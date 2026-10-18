import { detectLang } from '@/design/components/highlight';
import type { LabFiles } from '@/core/lab/buildDocument';

const PAGE = (body: string) =>
  `<!doctype html>\n<html lang="en">\n<head>\n  <title>Experiment</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n${body}\n  <script src="script.js"></script>\n</body>\n</html>\n`;
const BASE_CSS = 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n';
/** Sample markup so CSS examples have something to style. */
const SAMPLE = '  <nav class="nav">\n    <a href="#">Home</a>\n    <a href="#">Projects</a>\n    <a href="#">About</a>\n  </nav>\n  <div class="toolbar"><strong>Logo</strong><input placeholder="Search"><button>Go</button></div>\n  <div class="cards">\n    <div class="card">One</div>\n    <div class="card">Two</div>\n    <div class="card">Three</div>\n  </div>\n  <img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'200\'%3E%3Crect width=\'800\' height=\'200\' fill=\'%23dcece9\'/%3E%3C/svg%3E" alt="Wide placeholder image">';

export function looksLikeCss(code: string): boolean {
  return /^[\s\S]*[.#@a-z][^{;]*\{[^}]*:[^}]*\}/i.test(code) && !/\b(const|let|function|console)\b/.test(code) && !code.trimStart().startsWith('<');
}

/** Turns a lesson code example into Code Lab files you can run and change. */
export function experimentFiles(code: string): LabFiles {
  if (looksLikeCss(code)) return { html: PAGE(SAMPLE), css: `${BASE_CSS}\n${code}\n`, js: '' };
  const lang = detectLang(code);
  if (lang === 'html') {
    const isFull = /<html|<body/i.test(code);
    return { html: isFull ? code : PAGE(code.split('\n').map((l) => '  ' + l).join('\n')), css: BASE_CSS, js: '' };
  }
  if (lang === 'json') return { html: PAGE('  <p>Output appears in the console.</p>'), css: BASE_CSS, js: `const data = ${code};\nconsole.log(data);\n` };
  return { html: PAGE('  <p>Output appears in the console.</p>'), css: BASE_CSS, js: code + '\n' };
}
