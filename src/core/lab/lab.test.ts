import { protectLoops } from './protectLoops';
import { explainError } from './explainError';
import { buildDocument, findLinks, LAB_CSP } from './buildDocument';
import { normalizeLabStore, saveWorkspace, loadLabStore, removeWorkspace, LAB_KEY } from './workspaceStore';
import { createMemoryAdapter } from '../persistence/storage';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { getSkill } from '@/content/skills';

const page = (body = '') => `<!doctype html><html><head><link rel="stylesheet" href="style.css"></head><body>${body}<script src="script.js"></script></body></html>`;

describe('protectLoops', () => {
  it('adds a guard to every kind of loop without changing line numbers', () => {
    const src = 'for (let i=0;i<3;i++) {\n  x();\n}\nwhile (a) b();\ndo { c(); } while (d);\nfor (const k of list) {}\nfor (const k in obj) {}';
    const r = protectLoops(src);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.code.match(/__guard\(\)/g)).toHaveLength(5);
    expect(r.code.split('\n')).toHaveLength(src.split('\n').length);
    expect(r.code).toContain('while (a) {__guard();b();}');
  });

  it('reports syntax errors with line and column, without running anything', () => {
    const r = protectLoops('let a = 1;\nlet b = (2 + ;\n');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.line).toBe(2);
    expect(r.error.column).toBeGreaterThan(1);
    expect(r.error.message).not.toMatch(/\(\d+:\d+\)/);
  });

  it('leaves code without loops unchanged', () => {
    expect(protectLoops('console.log(1)')).toEqual({ ok: true, code: 'console.log(1)' });
  });
});

describe('explainError', () => {
  it('explains common errors in plain language', () => {
    expect(explainError('totl is not defined').title).toBe('JavaScript doesn\'t know “totl”');
    expect(explainError("Cannot read properties of null (reading 'name')").explanation).toContain('“name”');
    expect(explainError('total.toFixed is not a function').title).toContain('isn\'t a function');
    expect(explainError('Assignment to constant variable.').tip).toContain('let');
    expect(explainError('This loop ran for more than 1 second, so it was stopped.').title).toBe('A loop never stopped');
    expect(explainError('Unexpected token').title).toContain('couldn\'t read');
  });
  it('falls back to the original message', () => {
    expect(explainError('Something odd').explanation).toBe('Something odd');
  });
});

describe('buildDocument', () => {
  it('only includes files that index.html links to, like a real browser', () => {
    const linked = buildDocument({ html: page('<h1>Hi</h1>'), css: 'h1{color:red}', js: 'console.log(1)' }, 'r1');
    expect(linked.linked).toEqual({ css: true, js: true });
    expect(linked.html).toContain('h1{color:red}');
    expect(linked.html).toContain('console.log(1)');
    const unlinked = buildDocument({ html: '<h1>Hi</h1>', css: 'h1{color:red}', js: 'console.log(1)' }, 'r1');
    expect(unlinked.linked).toEqual({ css: false, js: false });
    expect(unlinked.html).not.toContain('h1{color:red}');
    expect(unlinked.html).not.toContain('console.log(1)');
  });

  it('adds a strict content security policy that blocks network access', () => {
    const r = buildDocument({ html: page(), css: '', js: '' }, 'r1');
    expect(r.html).toContain(`content="${LAB_CSP}"`);
    expect(LAB_CSP).toContain("connect-src 'none'");
    expect(LAB_CSP).toContain("default-src 'none'");
  });

  it('keeps learner code from breaking out of its script tag', () => {
    const r = buildDocument({ html: page(), css: '', js: 'const s = "</script><img src=x>";' }, 'r1');
    expect(r.html).not.toContain('"</script><img');
    expect(r.html).toContain('"<\\/script><img src=x>"');
  });

  it('reports syntax errors and leaves the broken script out', () => {
    const r = buildDocument({ html: page(), css: '', js: 'let x = ;' }, 'r1');
    expect(r.syntaxError?.line).toBe(1);
    expect(r.html).toContain("name:'SyntaxError'");
  });

  it('tells the prelude which line script.js starts on', () => {
    const r = buildDocument({ html: page(), css: '', js: 'console.log(1)' }, 'r1');
    expect(r.html).not.toContain('__JS_START__');
    expect(r.html).toMatch(/JS_START=\d+/);
  });

  it('only adds the checks script when there are checks', () => {
    expect(buildDocument({ html: page(), css: '', js: '' }, 'r').html).not.toContain('var checks=');
    expect(buildDocument({ html: page(), css: '', js: '' }, 'r', [{ id: 'a', test: 'return true;' }]).html).toContain('var checks=');
  });

  it('detects links with ./ and single quotes', () => {
    expect(findLinks(`<link href='./style.css' rel="stylesheet"><script src="./script.js"></script>`)).toEqual({ css: true, js: true });
  });
});

describe('lab workspace storage', () => {
  it('saves, loads and removes code per exercise', () => {
    const s = createMemoryAdapter();
    saveWorkspace(s, 'first-page', { files: { html: '<p>x</p>', css: '', js: '' } });
    expect(loadLabStore(s).workspaces['first-page']?.files.html).toBe('<p>x</p>');
    removeWorkspace(s, 'first-page');
    expect(loadLabStore(s).workspaces['first-page']).toBeUndefined();
  });
  it('drops damaged workspaces but keeps good ones', () => {
    const good = { files: { html: 'a', css: '', js: '' }, updatedAt: 'x' };
    expect(Object.keys(normalizeLabStore({ workspaces: { a: good, b: { files: 5 } } }).workspaces)).toEqual(['a']);
    expect(normalizeLabStore('junk')).toEqual({ version: 1, workspaces: {} });
    const s = createMemoryAdapter({ [LAB_KEY]: '{bad' });
    expect(loadLabStore(s).workspaces).toEqual({});
  });
});

describe('lab exercises', () => {
  it('are valid and reference real skills', () => {
    expect(LAB_EXERCISES.length).toBeGreaterThanOrEqual(8);
    for (const x of LAB_EXERCISES) if (x.skill) expect(getSkill(x.skill), x.id).toBeDefined();
  });
  it('have starter pages that link both files, and checks with unique ids', () => {
    for (const x of LAB_EXERCISES) {
      expect(findLinks(x.starter.html), x.id).toEqual({ css: true, js: true });
      const ids = x.checks.map((c) => c.id);
      expect(new Set(ids).size, x.id).toBe(ids.length);
      if (x.kind !== 'playground') expect(x.solution, `${x.id} needs a solution`).toBeDefined();
    }
  });
  it('have check code that at least parses as a function body', () => {
    for (const x of LAB_EXERCISES) for (const c of x.checks) expect(() => new Function('doc', 'logs', 'source', c.test), `${x.id}/${c.id}`).not.toThrow();
  });
});
