import { parse, type Node } from 'acorn';
import { full } from 'acorn-walk';

/**
 * A rule-based code reviewer. It is not a model: every finding comes from a
 * fixed rule below, so it is predictable, free and works offline. It catches
 * common beginner problems; it can't judge design or intent.
 */

export type Severity = 'bug' | 'security' | 'accessibility' | 'suggestion';
export type ReviewFile = 'html' | 'css' | 'js';

export interface Finding {
  id: string;
  severity: Severity;
  file: ReviewFile;
  line: number;
  title: string;
  why: string;
  fix: string;
}

const ORDER: Record<Severity, number> = { bug: 0, security: 1, accessibility: 2, suggestion: 3 };

type AnyNode = Node & Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function lineOf(src: string, index: number): number {
  return src.slice(0, index).split('\n').length;
}

export function reviewJs(src: string): Finding[] {
  if (!src.trim()) return [];
  let ast: Node;
  try {
    ast = parse(src, { ecmaVersion: 'latest', sourceType: 'script', locations: true, allowReturnOutsideFunction: true });
  } catch (e) {
    const err = e as { message: string; loc?: { line: number } };
    return [{ id: 'syntax', severity: 'bug', file: 'js', line: err.loc?.line ?? 1, title: 'The code can\'t be parsed', why: err.message.replace(/\s*\(\d+:\d+\)$/, ''), fix: 'Fix this first: nothing else in the file runs until it parses. Look for a missing bracket, quote or comma on or just before this line.' }];
  }
  const out: Finding[] = [];
  const add = (f: Omit<Finding, 'file' | 'line'>, node: AnyNode) => out.push({ ...f, file: 'js', line: node.loc?.start.line ?? 1 });
  const letNames = new Map<string, AnyNode>();
  const assigned = new Set<string>();
  let consoleLogs = 0;
  let firstLog: AnyNode | null = null;

  full(ast, (n) => {
    const node = n as AnyNode;
    switch (node.type) {
      case 'VariableDeclaration':
        if (node.kind === 'var') add({ id: 'var', severity: 'suggestion', title: 'var instead of let or const', why: 'var ignores block scope, so a variable can leak out of an if or a loop and cause confusing bugs.', fix: 'Use const for values that never change and let for ones that do.' }, node);
        if (node.kind === 'let') for (const d of node.declarations) if (d.id.type === 'Identifier' && d.init) letNames.set(d.id.name, d);
        break;
      case 'AssignmentExpression':
        if (node.left.type === 'Identifier') assigned.add(node.left.name);
        if (node.left.type === 'MemberExpression' && !node.left.computed && node.left.property.name === 'innerHTML' && node.right.type !== 'Literal' && !(node.right.type === 'TemplateLiteral' && node.right.expressions.length === 0)) {
          add({ id: 'innerhtml', severity: 'security', title: 'innerHTML built from data', why: 'If any part of that text comes from a person (a form, a message, a URL), they can inject HTML or scripts into your page. This is called cross-site scripting (XSS).', fix: 'Use textContent for text, or create elements with document.createElement and set their textContent.' }, node);
        }
        break;
      case 'UpdateExpression':
        if (node.argument.type === 'Identifier') assigned.add(node.argument.name);
        break;
      case 'BinaryExpression': {
        const isNull = (x: AnyNode) => x.type === 'Literal' && x.value === null;
        if ((node.operator === '==' || node.operator === '!=') && !isNull(node.left) && !isNull(node.right)) {
          add({ id: 'loose-equality', severity: 'bug', title: `${node.operator} instead of ${node.operator}=`, why: `${node.operator} converts types before comparing, so "0" == 0 and "" == 0 are both true. That hides bugs.`, fix: `Use ${node.operator}= so the type has to match too.` }, node);
        }
        break;
      }
      case 'CatchClause':
        if (node.body.body.length === 0) add({ id: 'empty-catch', severity: 'bug', title: 'An error is silently ignored', why: 'An empty catch swallows the error, so when something breaks there is no message and nothing to debug.', fix: 'At least log it (console.error(error)), or handle it: show a message, use a fallback, or rethrow.' }, node);
        break;
      case 'CallExpression': {
        const c = node.callee;
        if (c.type === 'Identifier' && c.name === 'eval') add({ id: 'eval', severity: 'security', title: 'eval runs text as code', why: 'Anyone who can influence that text can run their own code in your page.', fix: 'Parse data with JSON.parse, or look up functions in an object instead of building code as text.' }, node);
        if (c.type === 'MemberExpression' && !c.computed && c.object.type === 'Identifier' && c.object.name === 'document' && c.property.name === 'write') add({ id: 'document-write', severity: 'bug', title: 'document.write', why: 'Called after the page has loaded, it erases the whole page. It\'s also blocked in many contexts.', fix: 'Create elements and append them, or set textContent on an existing element.' }, node);
        if (c.type === 'MemberExpression' && !c.computed && c.object.type === 'Identifier' && c.object.name === 'console' && c.property.name === 'log') {
          consoleLogs++;
          firstLog ??= node;
        }
        break;
      }
      case 'NewExpression':
        if (node.callee.type === 'Identifier' && node.callee.name === 'Function') add({ id: 'new-function', severity: 'security', title: 'new Function runs text as code', why: 'Like eval, it turns text into code that runs with full access to your page.', fix: 'Write the function normally, or choose between existing functions with an object lookup.' }, node);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression': {
        const lines = (node.loc?.end.line ?? 0) - (node.loc?.start.line ?? 0) + 1;
        if (lines > 40) add({ id: 'long-function', severity: 'suggestion', title: `A ${lines}-line function`, why: 'Long functions usually do several jobs, which makes them hard to test and reason about.', fix: 'Split it into smaller functions that each do one thing and have a name that says what.' }, node);
        break;
      }
    }
  });

  for (const [name, decl] of letNames) {
    if (!assigned.has(name)) add({ id: 'prefer-const', severity: 'suggestion', title: `${name} is never reassigned`, why: 'const tells the reader (and JavaScript) that this name always points at the same value.', fix: `Declare it with const ${name} = …` }, decl);
  }
  if (consoleLogs >= 3 && firstLog) add({ id: 'console-log', severity: 'suggestion', title: `${consoleLogs} console.log calls`, why: 'Great while debugging, but they clutter the console for anyone using the finished page.', fix: 'Remove the ones you no longer need before calling the work finished.' }, firstLog);
  return out;
}

export function reviewHtml(src: string): Finding[] {
  if (!src.trim()) return [];
  const out: Finding[] = [];
  const at = (re: RegExp) => {
    const m = re.exec(src);
    return m ? lineOf(src, m.index) : 1;
  };
  const doc = new DOMParser().parseFromString(src, 'text/html');
  if (/<html[\s>]/i.test(src) && !doc.documentElement.getAttribute('lang')) out.push({ id: 'lang', severity: 'accessibility', file: 'html', line: at(/<html/i), title: 'The page has no language', why: 'Screen readers use lang to pick the right pronunciation.', fix: 'Add it to the opening tag: <html lang="en">.' });
  if (/<head[\s>]/i.test(src) && !doc.querySelector('title')?.textContent?.trim()) out.push({ id: 'title', severity: 'accessibility', file: 'html', line: at(/<head/i), title: 'The page has no title', why: 'The title names the browser tab and is the first thing a screen reader announces.', fix: 'Add <title>What this page is</title> inside <head>.' });
  doc.querySelectorAll('img').forEach((img, i) => {
    if (!img.hasAttribute('alt')) out.push({ id: `img-alt-${i}`, severity: 'accessibility', file: 'html', line: at(new RegExp(`<img[^>]*${escapeRe(img.getAttribute('src') ?? '')}`, 'i')), title: 'An image has no alt text', why: 'People using screen readers hear nothing, or the file name, instead of what the image shows.', fix: 'Add alt="what the image shows", or alt="" if it\'s purely decorative.' });
  });
  doc.querySelectorAll('input, select, textarea').forEach((el, i) => {
    const type = el.getAttribute('type');
    if (type === 'hidden' || type === 'submit' || type === 'button') return;
    const id = el.getAttribute('id');
    const labelled = el.closest('label') || (id && doc.querySelector(`label[for="${CSS.escape(id)}"]`)) || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    if (!labelled) out.push({ id: `label-${i}`, severity: 'accessibility', file: 'html', line: id ? at(new RegExp(`id=["']${escapeRe(id)}["']`)) : at(new RegExp(`<${el.tagName}`, 'i')), title: `A ${el.tagName.toLowerCase()} has no label`, why: 'Placeholder text disappears as you type and isn\'t reliably read aloud. Without a label, people don\'t know what to enter.', fix: 'Add <label for="the-id">Name</label> and give the field that id.' });
  });
  doc.querySelectorAll('button').forEach((b, i) => {
    if (!b.textContent?.trim() && !b.getAttribute('aria-label')) out.push({ id: `button-name-${i}`, severity: 'accessibility', file: 'html', line: at(/<button/i), title: 'A button has no name', why: 'A screen reader announces just "button", with no hint of what it does.', fix: 'Put text inside it, or add aria-label="what it does" for icon-only buttons.' });
  });
  let prev = 0;
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
    const level = Number(h.tagName[1]);
    if (prev && level > prev + 1) out.push({ id: `heading-skip-${level}`, severity: 'accessibility', file: 'html', line: at(new RegExp(`<h${level}`, 'i')), title: `Heading jumps from h${prev} to h${level}`, why: 'Many people navigate by headings. Skipped levels suggest a missing section.', fix: `Use h${prev + 1} here, and style it with CSS if you want it smaller.` });
    prev = level;
  });
  return out;
}

export function reviewCss(src: string): Finding[] {
  if (!src.trim()) return [];
  const out: Finding[] = [];
  const important = [...src.matchAll(/!important/g)];
  if (important.length) out.push({ id: 'important', severity: 'suggestion', file: 'css', line: lineOf(src, important[0]!.index), title: `!important used ${important.length === 1 ? 'once' : `${important.length} times`}`, why: 'It overrides the normal cascade, so later changes stop working and you need more !important to fix them.', fix: 'Make the selector more specific, or reorder the rules, instead.' });
  const outline = /outline\s*:\s*(none|0)\b/.exec(src);
  if (outline && !/:focus-visible/.test(src)) out.push({ id: 'outline-none', severity: 'accessibility', file: 'css', line: lineOf(src, outline.index), title: 'Focus outline removed', why: 'Keyboard users rely on the outline to see where they are on the page.', fix: 'Keep it, or replace it with a visible :focus-visible style.' });
  for (const m of src.matchAll(/(?:^|[;{\s])width\s*:\s*(\d+)px/g)) {
    if (Number(m[1]) > 600) {
      out.push({ id: 'fixed-width', severity: 'suggestion', file: 'css', line: lineOf(src, m.index), title: `Fixed width of ${m[1]}px`, why: 'Wider than most phones, so the page will scroll sideways on small screens.', fix: `Use max-width: ${m[1]}px with width: 100% so it shrinks when needed.` });
      break;
    }
  }
  return out;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function reviewCode(files: { html: string; css: string; js: string }): Finding[] {
  return [...reviewJs(files.js), ...reviewHtml(files.html), ...reviewCss(files.css)].sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);
}

export const SEVERITY_LABEL: Record<Severity, string> = { bug: 'Likely bug', security: 'Security', accessibility: 'Accessibility', suggestion: 'Suggestion' };
