import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'functions',
  title: 'Functions: inputs and outputs',
  skill: 'js-functions',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 20,
  objective: 'Read a function call, predict its return value, and explain why return and console.log are not the same thing.',
  whyItMatters:
    'Functions are how you name a piece of work and reuse it: calculateTotal, isLegalMove, scoreLead. Almost every feature you build will be a handful of small functions working together, and each one can be tested on its own.',
  prerequisites: ['conditions'],
  sections: [
    {
      heading: 'A named, reusable step',
      body: [
        'A function takes inputs (parameters), does some work, and can hand back a result with return. You define it once and call it as often as you like.',
        'When you call double(4), the value 4 goes into the parameter n, the body runs, and the call is replaced by whatever the function returns.',
      ],
      code: 'function double(n) {\n  return n * 2;\n}\n\ndouble(4);       // 8\ndouble(10) + 1;  // 21',
    },
    {
      heading: 'return is not console.log',
      body: [
        'console.log shows a value on screen for a human. return hands a value back to the code that called the function, so it can be stored or used in more calculations.',
        'A function without return gives back undefined. This is one of the most common beginner bugs: the right number appears in the console, but the rest of the program receives nothing.',
      ],
      code: 'function badTotal(a, b) {\n  console.log(a + b);   // shows 5…\n}\nconst t = badTotal(2, 3);\nconsole.log(t);         // …but t is undefined',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'predict-double',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'function double(n) {\n  return n * 2;\n}\n\nconst result = double(4) + 1;\nconsole.log(result);',
      options: [
        { id: 'a', text: '9', correct: true, why: 'Right. double(4) is worked out first and becomes 8, then 1 is added.' },
        { id: 'b', text: '10', correct: false, why: 'That would be double(5). The function call finishes first; the + 1 is applied to its result.', misconception: 'Applies the outer operation before the function call finishes' },
        { id: 'c', text: '8', correct: false, why: 'double(4) is 8, but then + 1 is added before storing it in result.' },
        { id: 'd', text: 'undefined', correct: false, why: 'double has a return statement, so it gives back a number.' },
      ],
    },
    {
      kind: 'choice',
      id: 'bug-missing-return',
      variant: 'bug',
      prompt: 'This should print 12, but it prints undefined. Why?',
      code: 'function addTax(price) {\n  const total = price * 1.2;\n}\n\nconsole.log(addTax(10));',
      options: [
        { id: 'a', text: 'The function never returns total, so the call gives back undefined.', correct: true, why: 'Right. Add return total; as the last line of the function.' },
        { id: 'b', text: '1.2 should be 0.2.', correct: false, why: '10 × 1.2 is 12, which is correct. The value is calculated; it just never leaves the function.' },
        { id: 'c', text: 'total should be made with let.', correct: false, why: 'total is never changed, so const is fine. The problem is that it is never returned.' },
        { id: 'd', text: 'console.log can\'t print the result of a function call.', correct: false, why: 'It can. console.log(double(4)) would print 8. Here the function simply returns nothing.', misconception: 'Confuses console.log with return' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-return',
      prompt: 'Complete the function so it gives back true for even numbers and false for odd ones.',
      code: 'function isEven(n) {\n  ___ n % 2 === 0;\n}',
      accepted: ['return'],
      explanation: 'return hands the true/false result back to whoever called isEven.',
      commonWrong: [
        { answer: 'console.log', why: 'Logging shows the answer on screen, but the function would still give back undefined to the code that called it.', misconception: 'Confuses console.log with return' },
        { answer: 'const', why: 'const creates a variable; it needs a name. Here we want to send the value back.' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-return-log',
      prompt: 'Explain the difference between return and console.log as if to a friend who just hit the "prints the right number but my total is undefined" bug.',
      lookFor: ['console.log only displays a value', 'return sends a value back to the caller so it can be used', 'A function with no return gives undefined'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-greet',
      variant: 'predict',
      prompt: 'What appears in the console?',
      code: 'function greet(name) {\n  return "Hi " + name;\n}\n\ngreet("Sam");\nconsole.log("done");',
      options: [
        { id: 'a', text: 'Only "done"', correct: true, why: 'Right. greet returns "Hi Sam", but nothing logs or stores it, so it is thrown away.' },
        { id: 'b', text: '"Hi Sam", then "done"', correct: false, why: 'Returning a value doesn\'t print it. Only console.log prints.', misconception: 'Thinks a returned value is printed automatically' },
        { id: 'c', text: 'Nothing', correct: false, why: 'The last line logs "done".' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-area',
      prompt: 'Return the area of a rectangle.',
      code: 'function area(width, height) {\n  return width ___ height;\n}',
      accepted: ['*'],
      explanation: 'In JavaScript, * multiplies.',
      commonWrong: [{ answer: 'x', why: 'x is a letter (or a variable name) in JavaScript. Multiplication is *.' }],
    },
  ],
  misconceptions: [
    { myth: 'If the right number shows in the console, the function works.', reality: 'Only if it also returns that number. Logging and returning are different.' },
    { myth: 'A function runs as soon as it is defined.', reality: 'Defining a function only describes it. It runs each time it is called.' },
  ],
  hints: [
    'Replace each function call with the value it returns, then finish the rest of the line.',
    'Look for the word return. If there isn\'t one, the function gives back undefined.',
    'Ask: does the caller need this value, or does a human just need to see it?',
  ],
  masteryRequirement: 'Predict return values, diagnose a missing return, and explain return vs console.log in your own words.',
};
