import type { ExperimentInput } from './schema';

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My First Webpage</title>
  <!-- This line connects the CSS file, which controls how the page looks. -->
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="card">
    <!-- <h1> is a heading. The text between <h1> and </h1> appears on the page. -->
    <h1 id="greeting">Hello, world!</h1>
    <p>I am learning how websites work.</p>
    <button id="greetButton">Click me</button>
    <p id="message">Your message will appear here.</p>
  </main>
  <!-- This line runs the JavaScript file, which makes the page respond. -->
  <script src="script.js"></script>
</body>
</html>
`;

const CSS = `/* Each rule starts with a selector (which elements) and lists properties inside { }. */
body {
  font-family: Arial, sans-serif;
  background-color: #f4f1ea;
  padding: 40px 20px;
}

.card {
  max-width: 420px;
  margin: 0 auto;
  padding: 24px;
  background-color: white;
  border-radius: 12px;
  text-align: center;
}

button {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background-color: #365b49;
  color: white;
  cursor: pointer;
}
`;

const JS = `// Find the button and the message on the page.
const button = document.querySelector("#greetButton");
const message = document.querySelector("#message");

// When the button is clicked, change the message text.
button.addEventListener("click", function () {
  message.textContent = "You made this webpage interactive!";
});
`;

/** Shared snippets for checks (they run inside the sandboxed preview). */
const BG = (sel: string) => `getComputedStyle(doc.querySelector('${sel}')).backgroundColor`;
const CLICK_MESSAGE = `var b = doc.querySelector('#greetButton'); var m = doc.querySelector('#message');
if (!b) throw new Error('Not quite. The button is missing from the page. Check that <button id="greetButton"> is still in index.html.');
if (!m) throw new Error('Not quite. The message paragraph is missing. Check that <p id="message"> is still in index.html.');
b.click();
var t = m.textContent.trim();`;

export const experiment: ExperimentInput = {
  id: 'first-webpage',
  title: 'Build Your First Interactive Webpage',
  objective: 'Learn what HTML, CSS and JavaScript each do by changing a real webpage, one file at a time.',
  lessons: ['how-a-page-reaches-you', 'html-structure'],
  skill: 'html',
  minutes: 15,
  intro: 'A webpage is made of three kinds of files that work together: HTML for the content, CSS for the look, and JavaScript for behavior. You will change each one and see the result straight away.',
  starter: { html: HTML, css: CSS, js: JS },
  steps: [
    {
      id: 'html-heading',
      title: 'Change the webpage content',
      concept: 'HTML describes what appears on the page: headings, paragraphs, buttons.',
      file: 'html',
      task: ['Find the heading that says Hello, world!', 'Change it to Welcome to My Website!', 'Press Run Code.'],
      expected: 'The preview shows your new heading.',
      hints: [
        'Look near the middle of index.html, inside <main>.',
        'Change only the text between the opening <h1 id="greeting"> tag and the closing </h1> tag. The line should become: <h1 id="greeting">Welcome to My Website!</h1>',
      ],
      terms: [
        { term: 'tag', meaning: 'A label in angle brackets, like <h1>, that tells the browser what something is. Most come in pairs: an opening tag <h1> and a closing tag </h1>.' },
        { term: 'heading', meaning: 'A title on the page. <h1> is the main heading.' },
      ],
      test: `var h = doc.querySelector('#greeting') || doc.querySelector('h1');
if (!h) throw new Error('Not quite. There is no <h1> heading on the page now. Check that both the opening <h1 id="greeting"> and closing </h1> tags are still there.');
var t = h.textContent.trim();
if (t === 'Hello, world!') throw new Error('Not quite. The heading still says "Hello, world!". Change the text between <h1> and </h1>, then press Run Code.');
if (t !== 'Welcome to My Website!') throw new Error('Close! Your heading says "' + t + '". It should be exactly "Welcome to My Website!", with the same capital letters and the exclamation mark.');
return true;`,
      success: 'Correct! Your heading has changed. You changed the HTML content, and the browser read the HTML and displayed it.',
    },
    {
      id: 'css-background',
      title: 'Change the appearance',
      concept: 'CSS controls how HTML elements look: colors, spacing, fonts.',
      file: 'css',
      task: ['Find background-color inside the body rule (near the top).', 'Change its value to #dce8f2', 'Press Run Code.'],
      expected: 'The page background becomes pale blue.',
      hints: [
        'Change the color value, not the property name. Keep the semicolon at the end.',
        'Inside body { … }, the line should become: background-color: #dce8f2;',
      ],
      terms: [
        { term: 'rule', meaning: 'A block of CSS: a selector such as body, then properties inside { and }.' },
        { term: 'property', meaning: 'One thing to change, like background-color, followed by a colon, a value and a semicolon.' },
        { term: 'color code', meaning: 'A color written as # and six characters, like #dce8f2.' },
      ],
      test: `var bg = ${BG('body')};
if (bg === 'rgb(220, 232, 242)') return true;
if (${BG('button')} === 'rgb(220, 232, 242)') throw new Error('Not quite. You changed the button\\'s color instead. Put #dce8f2 in the background-color inside the body rule, near the top of style.css.');
if (bg === 'rgb(244, 241, 234)') throw new Error('Not quite. The page background is still the original color. Change the background-color value inside the body rule, then press Run Code.');
throw new Error('Not quite. The background changed, but not to #dce8f2. Check the value: a # followed by dce8f2, then a semicolon.');`,
      success: 'Correct! The background is pale blue. The HTML stayed the same: CSS changed how the page looks.',
    },
    {
      id: 'css-button',
      title: 'Change the button',
      concept: 'CSS rules apply to the elements their selector names, so you can style one kind of element on its own.',
      file: 'css',
      task: ['Stay in style.css.', 'Find background-color inside the button rule (near the bottom).', 'Change it to #8a4f7d', 'Press Run Code.'],
      expected: 'The button becomes purple.',
      hints: [
        'There are two background-color lines you might find: one in body and one in button. This time, use the one inside button { … }.',
        'Inside button { … }, the line should become: background-color: #8a4f7d;',
      ],
      terms: [{ term: 'selector', meaning: 'The part before { that says which elements a rule styles. button styles every <button>.' }],
      test: `var bg = ${BG('button')};
if (bg === 'rgb(138, 79, 125)') return true;
if (${BG('body')} === 'rgb(138, 79, 125)') throw new Error('Not quite. The whole page turned purple: that value went into the body rule. Put #8a4f7d inside the button rule instead.');
if (bg === 'rgb(54, 91, 73)') throw new Error('Not quite. The button still has its original green. Change the background-color inside the button rule, then press Run Code.');
throw new Error('Not quite. The button changed, but not to #8a4f7d. Check the value and the semicolon after it.');`,
      success: 'Correct! The button is purple. CSS rules apply to the elements they select: the button rule controls the button.',
    },
    {
      id: 'js-message',
      title: 'Make the button interactive',
      concept: 'JavaScript adds behavior: it can wait for something to happen, like a click, and then change the page.',
      file: 'js',
      task: ['Find the line that starts with message.textContent =', 'Change the message to I can build interactive websites!', 'Press Run Code.', 'Click the button in the live preview.'],
      expected: 'When you click the button, the message below it changes.',
      hints: [
        'Change only the words inside the quotation marks. Keep the quotation marks and the semicolon.',
        'The line should become: message.textContent = "I can build interactive websites!";',
      ],
      terms: [
        { term: 'event listener', meaning: 'Code that waits for something to happen (an event, like a click) and then runs.' },
        { term: 'textContent', meaning: 'The text inside an element. Setting it replaces what the page shows.' },
        { term: 'quotation marks', meaning: 'Text in JavaScript goes between quotes, like "hello". Without both quotes, the code breaks.' },
      ],
      test: `${CLICK_MESSAGE}
if (t === 'I can build interactive websites!') return true;
if (t === 'You made this webpage interactive!') throw new Error('Not quite. Clicking still shows the old message. Change the text inside the quotation marks on the message.textContent line, then press Run Code.');
if (t === 'Your message will appear here.') throw new Error('Not quite. Clicking the button didn\\'t change the message. There may be an error in script.js: look for a message under the preview, and check the quotation marks.');
throw new Error('Close! Clicking shows "' + t + '". It should be exactly "I can build interactive websites!"');`,
      success: 'Correct! The message changes when you click. JavaScript listens for the click and updates the page: HTML supplies the elements, CSS styles them, and JavaScript makes them respond.',
    },
    {
      id: 'own-change',
      title: 'Make it your own',
      concept: 'Now combine what you learned. Pick one small change in any of the three files.',
      file: null,
      task: ['Choose one change below.', 'Make it in the file shown.', 'Press Run Code and check that it works.'],
      expected: 'Your change shows in the live preview.',
      hints: ['Start with one small change. You can keep experimenting after you pass the check.', 'For a new color, try a value like #f2d7c9 for the page or #2f5d8a for the button.'],
      choices: [
        {
          id: 'heading', label: 'Change the heading (HTML)', file: 'html',
          test: `var h = doc.querySelector('#greeting') || doc.querySelector('h1');
if (!h) throw new Error('Not quite. The heading is missing. Check that the <h1> opening and closing tags are still there.');
var t = h.textContent.trim();
if (!t) throw new Error('Not quite. The heading is empty. Write some text between <h1> and </h1>.');
if (t === 'Welcome to My Website!' || t === 'Hello, world!') throw new Error('Not quite. The heading is the same as before. Write your own heading between <h1> and </h1>, then press Run Code.');
return true;`,
          success: 'Your new heading is on the page.',
        },
        {
          id: 'color', label: 'Change a color (CSS)', file: 'css',
          test: `var a = ${BG('body')}; var b = ${BG('button')};
if (a !== 'rgb(220, 232, 242)' && a !== 'rgb(244, 241, 234)') return true;
if (b !== 'rgb(138, 79, 125)' && b !== 'rgb(54, 91, 73)') return true;
throw new Error('Not quite. The page and button colors are the same as before. Change a background-color value in style.css to a new color, then press Run Code.');`,
          success: 'Your new color is on the page.',
        },
        {
          id: 'message', label: 'Write a new message (JavaScript)', file: 'js',
          test: `${CLICK_MESSAGE}
if (!t) throw new Error('Not quite. Clicking makes the message empty. Write some words inside the quotation marks.');
if (t === 'I can build interactive websites!' || t === 'You made this webpage interactive!') throw new Error('Not quite. Clicking shows the same message as before. Write your own words inside the quotation marks, then press Run Code.');
if (t === 'Your message will appear here.') throw new Error('Not quite. Clicking the button didn\\'t change the message. Check script.js for a message under the preview, and check both quotation marks.');
return true;`,
          success: 'Your new message appears when you click.',
        },
      ],
      success: 'You made the webpage your own.',
    },
  ],
  mistakes: [
    { problem: 'Missing quotation mark in JavaScript', fix: 'Text needs a quote at both ends: "like this". A missing one usually shows an error message under the preview.' },
    { problem: 'Missing semicolon in CSS', fix: 'Each CSS property ends with ;. Without it, the next line can stop working too.' },
    { problem: 'Deleted a closing tag', fix: 'Tags come in pairs: <h1> … </h1>. If the closing one is gone, the page can look strange. Use View starter code to compare.' },
    { problem: 'Changed the wrong CSS rule', fix: 'Check which rule you are inside: body { … } styles the page, button { … } styles the button.' },
  ],
  completion: {
    title: 'You built your first interactive webpage',
    summary: 'You edited all three languages of the web and saw each change in a real page.',
    practiced: [
      'HTML: you changed the page\'s content (the heading).',
      'CSS: you changed how the page and one element look, using rules and properties.',
      'JavaScript: you changed what happens when someone clicks.',
      'How they connect: index.html links style.css and runs script.js.',
    ],
    next: [
      { label: 'Lesson: HTML structure and meaning', to: '/learn/lesson/html-structure' },
      { label: 'Code Lab: Your first web page', to: '/lab/first-page' },
      { label: 'Code Lab: Make a button count', to: '/lab/counter-button' },
    ],
  },
};
