import { describe, expect, it } from 'vitest';
import { reviewCode, reviewCss, reviewHtml, reviewJs } from './codeReview';

const ids = (f: { id: string }[]) => f.map((x) => x.id);

describe('rule-based code review', () => {
  it('reports a syntax error with its line, and nothing else', () => {
    const f = reviewJs('const a = 1;\nif (a {\n}');
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ id: 'syntax', line: 2, severity: 'bug' });
  });

  it('flags loose equality but not comparisons with null', () => {
    expect(ids(reviewJs('const a = 1;\nif (a == "1") {}'))).toContain('loose-equality');
    expect(ids(reviewJs('const a = 1;\nif (a == null) {}'))).not.toContain('loose-equality');
  });

  it('flags innerHTML built from data, not static strings', () => {
    expect(ids(reviewJs('const el = document.body; const name = "x";\nel.innerHTML = "<b>" + name + "</b>";'))).toContain('innerhtml');
    expect(ids(reviewJs('const el = document.body;\nel.innerHTML = "";'))).not.toContain('innerhtml');
    expect(reviewJs('const el = document.body; const n = 1;\n\nel.innerHTML = `${n}`;').find((x) => x.id === 'innerhtml')?.line).toBe(3);
  });

  it('flags var, empty catch, eval and new Function', () => {
    const f = ids(reviewJs('var x = 1;\ntry { x++ } catch (e) {}\neval("1");\nnew Function("return 1");'));
    expect(f).toEqual(expect.arrayContaining(['var', 'empty-catch', 'eval', 'new-function']));
  });

  it('suggests const only for lets that are never reassigned', () => {
    const f = reviewJs('let total = 0;\nlet name = "a";\ntotal += 5;\nlet i = 0; i++;');
    expect(f.filter((x) => x.id === 'prefer-const').map((x) => x.title)).toEqual(['name is never reassigned']);
  });

  it('gives clean code no findings', () => {
    expect(reviewJs('const items = [1, 2, 3];\nconst total = items.reduce((sum, n) => sum + n, 0);\nconsole.log(total);')).toEqual([]);
  });

  it('checks HTML for language, title, alt text, labels, button names and heading order', () => {
    const html = '<!doctype html>\n<html>\n<head></head>\n<body>\n<h1>Hi</h1>\n<h3>Skip</h3>\n<img src="a.png">\n<input id="email" placeholder="Email">\n<label>Name <input></label>\n<button></button>\n</body>\n</html>';
    const f = reviewHtml(html);
    expect(ids(f)).toEqual(expect.arrayContaining(['lang', 'title', 'img-alt-0', 'label-0', 'button-name-0', 'heading-skip-3']));
    expect(ids(f)).not.toContain('label-1');
    expect(f.find((x) => x.id === 'label-0')?.line).toBe(8);
    expect(f.find((x) => x.id === 'img-alt-0')?.line).toBe(7);
  });

  it('accepts labelled fields and a complete page', () => {
    const html = '<html lang="en"><head><title>T</title></head><body><h1>A</h1><h2>B</h2><label for="e">Email</label><input id="e"><img src="x.png" alt=""><button>Go</button></body></html>';
    expect(reviewHtml(html)).toEqual([]);
  });

  it('checks CSS for !important, removed focus outlines and wide fixed widths', () => {
    expect(ids(reviewCss('a { color: red !important; }\nbutton { outline: none; }\n.wrap { width: 960px; }'))).toEqual(['important', 'outline-none', 'fixed-width']);
    expect(ids(reviewCss('button { outline: none; }\nbutton:focus-visible { outline: 2px solid; }\n.wrap { max-width: 960px; }'))).toEqual([]);
  });

  it('sorts bugs and security issues before suggestions', () => {
    const f = reviewCode({ html: '', css: 'a { color: red !important; }', js: 'var a = 1;\nif (a == 2) {}' });
    expect(f.map((x) => x.severity)).toEqual(['bug', 'suggestion', 'suggestion']);
  });
});
