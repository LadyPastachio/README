import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'reading-errors',
  title: 'Reading an error message',
  skill: 'debugging',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 15,
  objective: 'Identify the error type, message and location in a JavaScript error, and follow a calm, step-by-step debugging process.',
  whyItMatters:
    'Errors are not failures; they\'re the program telling you exactly what went wrong and where. Reading them well is the difference between fixing a bug in two minutes and guessing for an hour, and it\'s what lets you check AI-generated code instead of trusting it.',
  prerequisites: ['functions'],
  sections: [
    {
      heading: 'Three parts of every error',
      body: [
        'A JavaScript error has a type (what kind of problem), a message (the details) and a location (file, line and column).',
        'In "app.js:12:15", 12 is the line and 15 is the column, meaning the character position on that line. Start at the line.',
      ],
      code: 'Uncaught ReferenceError: totl is not defined\n    at calculate (app.js:12:15)',
    },
    {
      heading: 'The two you\'ll see most',
      body: [
        'ReferenceError: you used a name JavaScript doesn\'t know. Usually a typo, or a variable used outside the place it was created.',
        'TypeError: the value exists but you used it the wrong way, such as reading a property of undefined or null, or calling something that isn\'t a function.',
      ],
    },
    {
      heading: 'A process, not a guess',
      body: [
        'Read the whole message. Go to the line it names. Form one specific guess about the cause. Change one thing. Run it again and compare.',
        'Changing several things at once might fix the bug, but you won\'t know which change did it, or what else you broke.',
      ],
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'reference-error',
      variant: 'concept',
      prompt: 'You see: "Uncaught ReferenceError: totl is not defined at app.js:12:15". What\'s the most likely cause?',
      options: [
        { id: 'a', text: 'A typo: the code says totl where it meant total, on line 12.', correct: true, why: 'Right. ReferenceError means an unknown name, and totl looks like a misspelling.' },
        { id: 'b', text: 'The problem is on line 15.', correct: false, why: '15 is the column (character position). The line is 12.', misconception: 'Mixes up line and column numbers' },
        { id: 'c', text: 'The server is down.', correct: false, why: 'This error comes from the JavaScript in your page. It has nothing to do with the network.', misconception: 'Blames the network for code errors' },
        { id: 'd', text: 'The file app.js is missing.', correct: false, why: 'The error points inside app.js, so the file was loaded and is running.' },
      ],
    },
    {
      kind: 'choice',
      id: 'type-error-null',
      variant: 'bug',
      prompt: 'This throws "TypeError: Cannot read properties of null (reading \'name\')". What does it mean?',
      code: 'const user = null;\nconsole.log(user.name);',
      options: [
        { id: 'a', text: 'user is null, so there\'s nothing to read a name from.', correct: true, why: 'Right. You can only read properties of an actual object. Check that the value exists first.' },
        { id: 'b', text: 'name is a reserved word in JavaScript.', correct: false, why: 'name is an ordinary property name. The message says the problem is reading it from null.' },
        { id: 'c', text: 'console.log is broken.', correct: false, why: 'The error happens while working out user.name, before console.log is called.' },
        { id: 'd', text: 'user needs quotes around it.', correct: false, why: 'Quotes would make it the text "user". The variable exists; its value is null.' },
      ],
    },
    {
      kind: 'order',
      id: 'order-debugging',
      prompt: 'Put the debugging steps in a sensible order.',
      steps: [
        'Read the whole error message',
        'Go to the file and line it names',
        'Form one specific guess about the cause',
        'Change one thing to test that guess',
        'Run it again and compare the result',
      ],
      feedback: {
        correct: 'That\'s the loop. If the guess was wrong, undo the change and go back to step 3.',
        incorrect: 'You can\'t test a guess before you have one, and you can\'t form a good guess before reading what the error says.',
      },
    },
    {
      kind: 'explain',
      id: 'explain-ask-for-help',
      prompt: 'You\'re stuck on an error and want to ask a friend or an AI for help. What would you include in your message, and why?',
      lookFor: ['The exact error message, copied, not paraphrased', 'The relevant code and which line', 'What you expected, what happened, and what you already tried'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-not-function',
      variant: 'bug',
      prompt: 'Why does this throw "TypeError: total.toFixed is not a function"?',
      code: 'const total = "12.5";\nconsole.log(total.toFixed(2));',
      options: [
        { id: 'a', text: 'total is a string, and toFixed only exists on numbers.', correct: true, why: 'Right. Convert first: Number(total).toFixed(2).' },
        { id: 'b', text: 'toFixed is spelled wrong.', correct: false, why: 'toFixed is the correct name. The problem is the type of value it\'s called on.' },
        { id: 'c', text: '2 should be in quotes.', correct: false, why: 'toFixed expects a number of decimal places, so 2 is right.', misconception: 'Treats a number in quotes as a number' },
      ],
    },
    {
      kind: 'choice',
      id: 'review-line',
      variant: 'concept',
      prompt: 'An error says "at chess.js:48:3". Where do you look first?',
      options: [
        { id: 'a', text: 'Line 48 of chess.js', correct: true, why: 'Right. 3 is the column, the character position on that line.' },
        { id: 'b', text: 'Line 3 of chess.js', correct: false, why: 'The first number after the file name is the line.', misconception: 'Mixes up line and column numbers' },
        { id: 'c', text: 'The 48th file in the project', correct: false, why: 'The location is inside chess.js.' },
      ],
    },
  ],
  misconceptions: [
    { myth: 'An error means I did something terrible.', reality: 'Errors are normal and useful. They tell you what broke and where.' },
    { myth: 'Change lots of things until it works.', reality: 'Change one thing at a time, so you know what fixed it.' },
  ],
  hints: ['The first word of the message is the type of error.', 'file:line:column. The line comes first.', 'A step can only happen once you have what it needs from the step before.'],
  masteryRequirement: 'Interpret ReferenceError and TypeError messages and their locations, and order the debugging process, without hints.',
};
