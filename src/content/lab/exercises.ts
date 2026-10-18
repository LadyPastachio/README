import { labExerciseSchema, type LabExercise, type LabExerciseInput } from './schema';
import { PATH_EXERCISES } from './pathExercises';

const PAGE = (body: string, title = 'My page') =>
  `<!doctype html>\n<html lang="en">\n<head>\n  <title>${title}</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n${body}\n  <script src="script.js"></script>\n</body>\n</html>\n`;

const RAW: LabExerciseInput[] = [
  {
    id: 'first-page',
    title: 'Your first page',
    kind: 'build',
    skill: 'html',
    minutes: 10,
    summary: 'Write the HTML for a small profile page and see it appear.',
    instructions: [
      'index.html has an empty <main>. Inside it, add a main heading (<h1>) with your name, and a paragraph (<p>) saying what you\'re learning.',
      'Then add a link (<a>) to any website, with an href. Press Run (or Ctrl+Enter) to see the result in the preview.',
    ],
    checks: [
      { id: 'h1', criterion: 'There is one <h1> with some text in it', test: `const h = doc.querySelectorAll('h1'); return h.length === 1 && h[0].textContent.trim().length > 0;` },
      { id: 'p', criterion: 'There is a <p> with at least a few words', test: `const p = doc.querySelector('main p'); return !!p && p.textContent.trim().split(/\\s+/).length >= 3;` },
      { id: 'a', criterion: 'There is a link with an href', test: `const a = doc.querySelector('main a[href]'); return !!a && a.getAttribute('href').trim().length > 0 && a.textContent.trim().length > 0;` },
      { id: 'inside', criterion: 'Everything is inside <main>', test: `return !!doc.querySelector('main h1') && !!doc.querySelector('main p');` },
    ],
    starter: { html: PAGE('  <main>\n    <!-- Your heading, paragraph and link go here -->\n  </main>'), css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n', js: '' },
    hints: ['A heading looks like <h1>Your name</h1>.', 'A link needs href: <a href="https://example.com">text</a>.', 'Put the new lines between <main> and </main>.'],
    solution: { html: PAGE('  <main>\n    <h1>Ada Lovelace</h1>\n    <p>I am learning HTML, CSS and JavaScript.</p>\n    <a href="https://developer.mozilla.org">MDN Web Docs</a>\n  </main>') },
  },
  {
    id: 'style-a-card',
    title: 'Style a card',
    kind: 'build',
    skill: 'css-layout',
    minutes: 15,
    summary: 'Use CSS to turn plain HTML into a tidy budget card.',
    instructions: [
      'The HTML already has a card with the class "card". All the work is in style.css.',
      'Give .card some padding (at least 16px), rounded corners with border-radius, and a background color that differs from the page.',
      'Then make .card use flexbox (display: flex) with justify-content: space-between, so the label and amount sit at opposite ends.',
    ],
    checks: [
      { id: 'padding', criterion: '.card has at least 16px of padding', test: `const c = getComputedStyle(doc.querySelector('.card')); return parseFloat(c.paddingTop) >= 16 && parseFloat(c.paddingLeft) >= 16;` },
      { id: 'radius', criterion: '.card has rounded corners', test: `return parseFloat(getComputedStyle(doc.querySelector('.card')).borderTopLeftRadius) > 0;` },
      { id: 'bg', criterion: ".card's background differs from the page", test: `const c = getComputedStyle(doc.querySelector('.card')).backgroundColor; return c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' && c !== getComputedStyle(doc.body).backgroundColor;` },
      { id: 'flex', criterion: '.card uses flexbox with space between', test: `const c = getComputedStyle(doc.querySelector('.card')); return c.display === 'flex' && c.justifyContent === 'space-between';` },
    ],
    starter: {
      html: PAGE('  <main>\n    <h1>October budget</h1>\n    <div class="card">\n      <span class="label">Groceries</span>\n      <span class="amount">$312</span>\n    </div>\n  </main>', 'Budget'),
      css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n  background: #f4f6f5;\n}\n\n.card {\n  /* Your styles here */\n}\n',
      js: '',
    },
    openFile: 'css',
    hints: ['padding: 16px; adds space inside the card.', 'border-radius: 12px; rounds the corners. background: white; changes the fill.', 'display: flex; turns on flexbox, then justify-content: space-between; spreads the items.'],
    solution: { css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n  background: #f4f6f5;\n}\n\n.card {\n  display: flex;\n  justify-content: space-between;\n  padding: 16px 20px;\n  border-radius: 12px;\n  background: white;\n}\n' },
  },
  {
    id: 'counter-button',
    title: 'Make a button count',
    kind: 'build',
    skill: 'dom-events',
    minutes: 15,
    summary: 'Connect JavaScript to the page: every click adds one.',
    instructions: [
      'The page has a button with id "add" and a <span id="count"> showing 0.',
      'In script.js, find both elements with document.querySelector, then add a click listener to the button that increases a number and shows it in the span.',
    ],
    checks: [
      { id: 'starts', criterion: 'The count starts at 0', test: `return doc.querySelector('#count').textContent.trim() === '0';` },
      { id: 'one', criterion: 'One click shows 1', test: `doc.querySelector('#add').click(); return doc.querySelector('#count').textContent.trim() === '1';` },
      { id: 'three', criterion: 'Two more clicks show 3', test: `const b = doc.querySelector('#add'); b.click(); b.click(); return doc.querySelector('#count').textContent.trim() === '3';` },
    ],
    starter: {
      html: PAGE('  <main>\n    <p>Moves played: <span id="count">0</span></p>\n    <button id="add" type="button">Add a move</button>\n  </main>', 'Counter'),
      css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n\nbutton {\n  font: inherit;\n  padding: 8px 14px;\n}\n',
      js: '// 1. Find the button and the count element\n\n// 2. Keep a number that starts at 0\n\n// 3. When the button is clicked, add 1 and show it\n',
    },
    openFile: 'js',
    hints: ['const button = document.querySelector("#add");', 'let count = 0; Use let, because it changes.', 'button.addEventListener("click", () => { count = count + 1; countEl.textContent = count; });'],
    solution: { js: 'const button = document.querySelector("#add");\nconst countEl = document.querySelector("#count");\nlet count = 0;\n\nbutton.addEventListener("click", () => {\n  count = count + 1;\n  countEl.textContent = count;\n});\n' },
  },
  {
    id: 'fix-the-total',
    title: 'Fix the budget total',
    kind: 'debug',
    skill: 'debugging',
    minutes: 15,
    summary: 'The total is wrong. Find out why, using the console.',
    instructions: [
      'This code should print the total of the transactions: 42.5. Run it and look at what it prints instead.',
      'Use the console (try adding console.log lines) to find the cause, then fix it. Keep the total function: the checks call it.',
    ],
    checks: [
      { id: 'logs', criterion: 'The console shows 42.5', test: `return logs.some((l) => l.trim() === '42.5');` },
      { id: 'number', criterion: 'total() returns a number, not text', test: `return typeof total === 'function' && typeof total([{ amount: '1' }, { amount: '2' }]) === 'number';` },
      { id: 'other', criterion: 'total() works for other lists too', test: `return total([{ amount: '10' }, { amount: '0.5' }, { amount: '4' }]) === 14.5;` },
    ],
    starter: {
      html: PAGE('  <main>\n    <h1>Budget</h1>\n    <p>Open the console below to see the total.</p>\n  </main>', 'Budget'),
      css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n',
      js: '// Amounts arrive from a form, so they are text.\nconst transactions = [\n  { amount: "12.5" },\n  { amount: "30" },\n];\n\nfunction total(list) {\n  let sum = 0;\n  for (const t of list) {\n    sum = sum + t.amount;\n  }\n  return sum;\n}\n\nconsole.log(total(transactions));\n',
    },
    openFile: 'js',
    hints: ['Log each step: console.log(sum, t.amount) inside the loop.', 'What does 0 + "12.5" give in JavaScript? Remember what + does with strings.', 'Convert first: Number(t.amount).'],
    solution: { js: '// Amounts arrive from a form, so they are text.\nconst transactions = [\n  { amount: "12.5" },\n  { amount: "30" },\n];\n\nfunction total(list) {\n  let sum = 0;\n  for (const t of list) {\n    sum = sum + Number(t.amount);\n  }\n  return sum;\n}\n\nconsole.log(total(transactions));\n' },
  },
  {
    id: 'predict-the-loop',
    title: 'Predict, then run',
    kind: 'predict',
    skill: 'js-functions',
    minutes: 10,
    summary: 'Read a loop, write down what it prints, then check by running it.',
    instructions: [
      'Read script.js without running it. Write your prediction in the box, then press Run and compare.',
      'Afterwards, change the code so it prints only the even numbers from 2 to 10, each on its own line.',
    ],
    predict: { question: 'What will the console show, line by line?', answer: '1\n4\n9\n16', explanation: 'The loop runs for i = 1, 2, 3 and 4 (it stops when i <= 4 becomes false) and prints i * i each time.' },
    checks: [
      { id: 'evens', criterion: 'Prints 2, 4, 6, 8 and 10, in order', test: `return JSON.stringify(logs.map((l) => l.trim())) === JSON.stringify(['2', '4', '6', '8', '10']);` },
      { id: 'loop', criterion: 'Uses a loop rather than five separate console.log lines', test: `const s = source.js; return /\\b(for|while)\\b/.test(s) && (s.match(/console\\.log/g) || []).length <= 2;` },
    ],
    starter: { html: PAGE('  <main>\n    <h1>Loops</h1>\n    <p>Output appears in the console.</p>\n  </main>', 'Loops'), css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n', js: 'for (let i = 1; i <= 4; i++) {\n  console.log(i * i);\n}\n' },
    openFile: 'js',
    hints: ['Change where the loop starts and stops: from 2 up to 10.', 'i++ adds 1 each time. i += 2 adds 2.', 'Print i itself, not i * i.'],
    solution: { js: 'for (let i = 2; i <= 10; i += 2) {\n  console.log(i);\n}\n' },
  },
  {
    id: 'chess-board-row',
    title: 'Draw a chess board row',
    kind: 'build',
    skill: 'js-functions',
    minutes: 20,
    summary: 'Use a loop to create eight alternating squares: the first step of your chess game.',
    instructions: [
      'The page has an empty <div id="row">. CSS for .square, .light and .dark is ready.',
      'In script.js, use a loop to create 8 <div> elements with the class "square". Give them "light" and "dark" classes alternately, starting with light, and add each one to #row.',
    ],
    checks: [
      { id: 'eight', criterion: 'There are exactly 8 squares in #row', test: `return doc.querySelectorAll('#row > .square').length === 8;` },
      { id: 'alternate', criterion: 'Squares alternate light, dark, light…', test: `const s = [...doc.querySelectorAll('#row > .square')]; return s.length === 8 && s.every((el, i) => el.classList.contains(i % 2 === 0 ? 'light' : 'dark') && !el.classList.contains(i % 2 === 0 ? 'dark' : 'light'));` },
      { id: 'loop', criterion: 'Built with a loop, not eight copies', test: `return /\\b(for|while)\\b|\\.forEach\\(/.test(source.js) && (source.js.match(/createElement/g) || []).length <= 2;` },
    ],
    starter: {
      html: PAGE('  <main>\n    <h1>Chess board</h1>\n    <div id="row"></div>\n  </main>', 'Chess'),
      css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n\n#row {\n  display: flex;\n}\n\n.square {\n  width: 40px;\n  height: 40px;\n}\n\n.light {\n  background: #eeeed2;\n}\n\n.dark {\n  background: #769656;\n}\n',
      js: 'const row = document.querySelector("#row");\n\n// Create 8 squares here\n',
    },
    openFile: 'js',
    hints: ['for (let i = 0; i < 8; i++) { … } runs 8 times.', 'const sq = document.createElement("div"); sq.classList.add("square");', 'i % 2 === 0 is true for 0, 2, 4, 6: those are the light squares.'],
    solution: { js: 'const row = document.querySelector("#row");\n\nfor (let i = 0; i < 8; i++) {\n  const square = document.createElement("div");\n  square.classList.add("square", i % 2 === 0 ? "light" : "dark");\n  row.appendChild(square);\n}\n' },
  },
  {
    id: 'label-the-form',
    title: 'Make a form accessible',
    kind: 'debug',
    skill: 'accessibility',
    minutes: 15,
    summary: 'A lead-capture form looks fine but is hard to use with a screen reader. Fix it.',
    instructions: [
      'This form for a sales lead has inputs with placeholder text but no labels, so screen-reader users hear only "edit text".',
      'Give every input a <label> connected to it (label for="…" matching the input\'s id), and make sure the button has visible text.',
    ],
    checks: [
      { id: 'labels', criterion: 'Every input has a connected label', test: `const inputs = [...doc.querySelectorAll('form input')]; return inputs.length >= 2 && inputs.every((i) => i.labels && i.labels.length > 0 && i.labels[0].textContent.trim().length > 0);` },
      { id: 'button', criterion: 'The button has visible text', test: `const b = doc.querySelector('form button'); return !!b && b.textContent.trim().length > 0;` },
      { id: 'kept', criterion: 'The name and email inputs are still there', test: `return !!doc.querySelector('input[type=email]') && doc.querySelectorAll('form input').length >= 2;` },
    ],
    starter: {
      html: PAGE('  <main>\n    <h1>Book a callback</h1>\n    <form>\n      <input id="name" type="text" placeholder="Your name">\n      <input id="email" type="email" placeholder="Email">\n      <button type="submit"></button>\n    </form>\n  </main>', 'Callback'),
      css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n\nform {\n  display: grid;\n  gap: 8px;\n  max-width: 320px;\n}\n\nbutton:empty {\n  min-height: 32px;\n  background: #1d6b64;\n}\n',
      js: '',
    },
    hints: ['A label looks like <label for="name">Your name</label>.', 'The for value must equal the input\'s id exactly.', 'Put text between <button> and </button>, like "Request callback".'],
    solution: { html: PAGE('  <main>\n    <h1>Book a callback</h1>\n    <form>\n      <label for="name">Your name</label>\n      <input id="name" type="text">\n      <label for="email">Email</label>\n      <input id="email" type="email">\n      <button type="submit">Request callback</button>\n    </form>\n  </main>', 'Callback') },
  },
  {
    id: 'refactor-repeats',
    title: 'Refactor repeated code',
    kind: 'refactor',
    skill: 'js-functions',
    minutes: 20,
    summary: 'The code works but repeats itself. Make it shorter to change, without changing what it does.',
    instructions: [
      'script.js prints a line for each budget category, but the same calculation is copied three times. If the format changes, all three copies need fixing.',
      'Write one function that formats a category, and use it three times. The console output must stay exactly the same.',
    ],
    checks: [
      { id: 'same', criterion: 'Output is unchanged', test: `return JSON.stringify(logs.map((l) => l.trim())) === JSON.stringify(['Food: $120 of $150 (80%)', 'Rent: $900 of $900 (100%)', 'Fun: $45 of $60 (75%)']);` },
      { id: 'function', criterion: 'Uses a function you wrote', test: `return /\\bfunction\\s+\\w+|=\\s*\\([^)]*\\)\\s*=>|=\\s*\\w+\\s*=>/.test(source.js);` },
      { id: 'once', criterion: 'The percentage calculation appears only once', test: `return (source.js.match(/\\* ?100/g) || []).length === 1;` },
    ],
    starter: {
      html: PAGE('  <main>\n    <h1>Budget report</h1>\n    <p>Output appears in the console.</p>\n  </main>', 'Report'),
      css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n',
      js: 'const foodPct = Math.round((120 / 150) * 100);\nconsole.log("Food: $" + 120 + " of $" + 150 + " (" + foodPct + "%)");\n\nconst rentPct = Math.round((900 / 900) * 100);\nconsole.log("Rent: $" + 900 + " of $" + 900 + " (" + rentPct + "%)");\n\nconst funPct = Math.round((45 / 60) * 100);\nconsole.log("Fun: $" + 45 + " of $" + 60 + " (" + funPct + "%)");\n',
    },
    openFile: 'js',
    hints: ['A function with three inputs: function line(name, spent, budget) { … }', 'Move one copy of the calculation into the function and return the text.', 'Then call it three times: console.log(line("Food", 120, 150));'],
    solution: { js: 'function line(name, spent, budget) {\n  const pct = Math.round((spent / budget) * 100);\n  return `${name}: $${spent} of $${budget} (${pct}%)`;\n}\n\nconsole.log(line("Food", 120, 150));\nconsole.log(line("Rent", 900, 900));\nconsole.log(line("Fun", 45, 60));\n' },
    compare: {
      title: 'Another approach: data plus a loop',
      code: 'const categories = [\n  { name: "Food", spent: 120, budget: 150 },\n  { name: "Rent", spent: 900, budget: 900 },\n  { name: "Fun", spent: 45, budget: 60 },\n];\n\nfor (const c of categories) {\n  const pct = Math.round((c.spent / c.budget) * 100);\n  console.log(`${c.name}: $${c.spent} of $${c.budget} (${pct}%)`);\n}',
      points: [
        'Your function version keeps the calculation in one place, which was the main goal. Either version is a good refactor.',
        'The loop version separates data from logic: adding a category means adding one line of data, no new code.',
        'The function version is easier to reuse elsewhere (for example, on a web page). The loop version is easier to feed from saved data.',
        'Shorter isn\'t automatically better: the original was easy to read top to bottom. The real win is that a format change now happens in one place.',
      ],
    },
  },
  {
    id: 'playground',
    title: 'Playground',
    kind: 'playground',
    skill: null,
    minutes: 5,
    summary: 'A blank page to experiment with. Nothing is checked.',
    instructions: ['Try anything. Your code is saved in this browser as you type.'],
    checks: [],
    starter: { html: PAGE('  <main>\n    <h1>Hello!</h1>\n  </main>', 'Playground'), css: 'body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n', js: 'console.log("Hello from script.js");\n' },
  },
];

export const LAB_EXERCISES: LabExercise[] = [...RAW, ...PATH_EXERCISES].map((x) => {
  const r = labExerciseSchema.safeParse(x);
  if (!r.success) throw new Error(`Lab exercise "${x.id}" is invalid: ${r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  return r.data;
});

export function getLabExercise(id: string): LabExercise | undefined {
  return LAB_EXERCISES.find((x) => x.id === id);
}
