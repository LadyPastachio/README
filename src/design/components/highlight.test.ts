import { tokenize, detectLang } from './highlight';

const join = (code: string, lang: Parameters<typeof tokenize>[1]) => tokenize(code, lang).map((t) => t.text).join('');

describe('highlight', () => {
  it('never loses or changes characters', () => {
    const samples: [string, Parameters<typeof tokenize>[1]][] = [
      ['const x = "a"; // hi\nfunction f(n) { return n * 2; }', 'js'],
      ['{"a": [1, true, null], "b": "x"}', 'json'],
      ['<a href="/x">Hi <b>there</b></a>\n<img src="k.png" alt="White knight">', 'html'],
    ];
    for (const [code, lang] of samples) expect(join(code, lang)).toBe(code);
  });
  it('colors the right things', () => {
    const js = tokenize('const total = add(2, "x");', 'js');
    expect(js.find((t) => t.text === 'const')?.type).toBe('kw');
    expect(js.find((t) => t.text === 'add')?.type).toBe('fn');
    expect(js.find((t) => t.text === '"x"')?.type).toBe('str');
    const html = tokenize('<a href="/p">Go</a>', 'html');
    expect(html.find((t) => t.text === 'href')?.type).toBe('attr');
    expect(html.find((t) => t.text === 'Go')?.type).toBe('plain');
  });
  it('detects languages', () => {
    expect(detectLang('<main></main>')).toBe('html');
    expect(detectLang('{\n  "a": 1\n}')).toBe('json');
    expect(detectLang('let a = 1;')).toBe('js');
    expect(detectLang('Uncaught ReferenceError: x')).toBe('text');
  });
});
