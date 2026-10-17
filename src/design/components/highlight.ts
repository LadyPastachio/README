/**
 * A tiny syntax highlighter for the short snippets in lessons.
 * It splits code into tokens (keyword, string, number, comment, …) so the
 * CSS can color them. It isn't a full parser, and doesn't need to be.
 */

export type Lang = 'js' | 'html' | 'json' | 'text';
export interface Token { type: 'kw' | 'str' | 'num' | 'com' | 'fn' | 'tag' | 'attr' | 'key' | 'punct' | 'plain'; text: string }

const JS_KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'undefined', 'new', 'typeof', 'await', 'async', 'import', 'export', 'from', 'class']);

export function detectLang(code: string): Lang {
  const t = code.trimStart();
  if (t.startsWith('<')) return 'html';
  if (/^[[{]/.test(t) && /"\s*:/.test(t) && !/\b(const|let|function)\b/.test(t)) return 'json';
  if (/^(Uncaught|Given|TypeError|ReferenceError)/.test(t)) return 'text';
  return 'js';
}

const RULES: Record<'js' | 'json', [RegExp, Token['type']][]> = {
  js: [
    [/^\/\/[^\n]*/, 'com'],
    [/^"(?:[^"\\\n]|\\.)*"|^'(?:[^'\\\n]|\\.)*'|^`(?:[^`\\]|\\.)*`/, 'str'],
    [/^\d+(?:\.\d+)?/, 'num'],
    [/^[A-Za-z_$][\w$]*(?=\s*\()/, 'fn'],
    [/^[A-Za-z_$][\w$]*/, 'plain'],
    [/^[{}()[\];,.=+\-*/<>!%&|?:]+/, 'punct'],
  ],
  json: [
    [/^"(?:[^"\\\n]|\\.)*"(?=\s*:)/, 'key'],
    [/^"(?:[^"\\\n]|\\.)*"/, 'str'],
    [/^-?\d+(?:\.\d+)?/, 'num'],
    [/^(?:true|false|null|True)\b/, 'kw'],
    [/^[{}[\],:]/, 'punct'],
  ],
};

export function tokenize(code: string, lang: Lang): Token[] {
  if (lang === 'text') return [{ type: 'plain', text: code }];
  if (lang === 'html') return tokenizeHtml(code);
  const rules = RULES[lang];
  const out: Token[] = [];
  let rest = code;
  while (rest.length) {
    let matched = false;
    for (const [re, type] of rules) {
      const m = re.exec(rest);
      if (!m || m[0].length === 0) continue;
      const t: Token['type'] = lang === 'js' && type === 'plain' && JS_KEYWORDS.has(m[0]) ? 'kw' : type;
      push(out, t, m[0]);
      rest = rest.slice(m[0].length);
      matched = true;
      break;
    }
    if (!matched) {
      push(out, 'plain', rest[0]!);
      rest = rest.slice(1);
    }
  }
  return out;
}

function push(out: Token[], type: Token['type'], text: string) {
  const last = out[out.length - 1];
  if (last && last.type === type && type === 'plain') last.text += text;
  else out.push({ type, text });
}

/** HTML: text outside tags is plain; inside a tag, color the name, attributes and values. */
function tokenizeHtml(code: string): Token[] {
  const out: Token[] = [];
  const tagRe = /<\/?[a-zA-Z][\w-]*|<!--[\s\S]*?-->/g;
  let i = 0;
  for (let m = tagRe.exec(code); m; m = tagRe.exec(code)) {
    if (m.index > i) push(out, 'plain', code.slice(i, m.index));
    if (m[0].startsWith('<!--')) { push(out, 'com', m[0]); i = tagRe.lastIndex; continue; }
    push(out, 'tag', m[0]);
    const close = code.indexOf('>', tagRe.lastIndex);
    const inner = code.slice(tagRe.lastIndex, close === -1 ? code.length : close);
    for (const part of inner.split(/("[^"]*")/)) {
      if (part.startsWith('"')) push(out, 'str', part);
      else part.split(/([a-zA-Z-]+(?==))/).forEach((p, k) => p && push(out, k % 2 ? 'attr' : 'plain', p));
    }
    if (close !== -1) push(out, 'tag', '>');
    i = close === -1 ? code.length : close + 1;
    tagRe.lastIndex = i;
  }
  if (i < code.length) push(out, 'plain', code.slice(i));
  return out;
}
