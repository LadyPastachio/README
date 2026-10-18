import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'values-and-variables',
  title: 'Values and variables',
  skill: 'js-basics',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 15,
  objective: 'Predict what simple JavaScript prints, explain the difference between a number and a string, and choose between let and const.',
  whyItMatters:
    'Every program stores information: a budget amount, a chess move, a lead\'s name. Variables are how code remembers those values, and mixing up a number with text is one of the most common bugs in finance code.',
  prerequisites: [],
  sections: [
    {
      heading: 'Values have types',
      body: [
        'A value is a single piece of information. The three you\'ll use constantly are numbers (42, 9.99), strings, which are text inside quotes ("Ada", "42"), and booleans, which are true or false.',
        'The quotes matter. 42 is a number you can do arithmetic with. "42" is two characters of text that happen to be digits.',
      ],
      code: 'const budget = 1200;        // number\nconst owner = "Ada";        // string\nconst isOverBudget = false; // boolean',
    },
    {
      heading: 'Variables are labelled boxes',
      body: [
        'A variable gives a value a name so you can use it later. const creates a variable that will always hold the same value. let creates one you\'re allowed to change.',
        'Start with const. Switch to let only when the value really needs to change, like a running total. That way, an accidental change becomes an error you notice instead of a silent bug.',
      ],
      code: 'let total = 0;\ntotal = total + 25;  // allowed: total was made with let\n\nconst rate = 0.2;\nrate = 0.3;          // TypeError: Assignment to constant variable.',
    },
    {
      heading: 'The + sign does two jobs',
      body: [
        'With two numbers, + adds. If either side is a string, + joins them into a longer string instead. So 4 + 2 is 6, but "4" + 2 is "42".',
        'This is why data typed into a form needs converting with Number(...) before you do maths with it: form fields always give you strings.',
      ],
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'predict-reassign',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'let count = 3;\ncount = count + 2;\nconsole.log(count);',
      options: [
        { id: 'a', text: '5', correct: true, why: 'Right. The right side is worked out first (3 + 2), then the result is stored back in count.' },
        { id: 'b', text: '3', correct: false, why: 'The second line stores a new value in count. Because count was made with let, that\'s allowed, so it is now 5.', misconception: 'Thinks reassignment does not change the variable' },
        { id: 'c', text: 'count + 2', correct: false, why: 'Without quotes, count + 2 is an expression to calculate, not text to print.' },
        { id: 'd', text: 'An error', correct: false, why: 'Changing a variable made with let is allowed. It would be an error with const.' },
      ],
    },
    {
      kind: 'choice',
      id: 'predict-string-plus',
      variant: 'predict',
      prompt: 'A form gives you the price as text. What does this print?',
      code: 'const price = "4";\nconst quantity = 2;\nconsole.log(price + quantity);',
      options: [
        { id: 'a', text: '42', correct: true, why: 'Right. price is a string, so + joins instead of adding: "4" followed by "2".' },
        { id: 'b', text: '6', correct: false, why: 'That would need two numbers. The quotes make price a string, so + joins the two values into "42".', misconception: 'Treats a number in quotes as a number' },
        { id: 'c', text: '8', correct: false, why: '+ never multiplies. With a string involved, it joins.' },
        { id: 'd', text: 'An error', correct: false, why: 'JavaScript doesn\'t complain here. It quietly converts 2 to "2" and joins them, which is exactly why this bug is easy to miss.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-let',
      prompt: 'greeting changes on line 3. Fill in the keyword that allows that.',
      code: '___ greeting = "Hi";\nconsole.log(greeting);\ngreeting = "Hello";',
      accepted: ['let'],
      explanation: 'let creates a variable you can change later. With const, line 3 would throw "Assignment to constant variable".',
      commonWrong: [
        { answer: 'const', why: 'const can\'t be reassigned, so line 3 would throw a TypeError.', misconception: 'Thinks const values can be reassigned' },
        { answer: 'var', why: 'var works, but it\'s the older way with confusing scoping rules. Modern code uses let.' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-let-const',
      prompt: 'In your own words: when would you use const, when would you use let, and why does it matter?',
      lookFor: [
        'const for values that never change; let for values that must change',
        'Default to const',
        'Using const turns accidental changes into visible errors',
      ],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-copy',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'let a = 10;\nlet b = a;\na = 20;\nconsole.log(b);',
      options: [
        { id: 'a', text: '10', correct: true, why: 'Right. b got a copy of the number 10. Changing a afterwards doesn\'t touch b.' },
        { id: 'b', text: '20', correct: false, why: 'b = a copies the value at that moment. The two variables are not linked afterwards.', misconception: 'Thinks variables stay linked after copying a number' },
        { id: 'c', text: 'undefined', correct: false, why: 'b was given a value on line 2, so it is defined.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-boolean',
      prompt: 'Store a boolean (yes/no) value saying the game is not over yet.',
      code: 'const isGameOver = ___;',
      accepted: ['false'],
      explanation: 'Booleans are written true or false, without quotes.',
      commonWrong: [
        { answer: '"false"', why: 'With quotes, that\'s the text "false", a string, not a boolean.', misconception: 'Treats a number in quotes as a number' },
        { answer: 'true', why: 'That would say the game is over.' },
      ],
    },
  ],
  misconceptions: [
    { myth: '"5" and 5 are the same thing.', reality: 'One is text and one is a number. They behave differently with +.' },
    { myth: 'const means the value can never be used in calculations.', reality: 'You can use a const in any calculation. You just can\'t store a new value in it.' },
  ],
  hints: [
    'Work out the right side of = first, then store the result in the left side.',
    'Look for quotes. A value in quotes is a string, even if it contains digits.',
    'If a variable gets a new value later, it can\'t be made with const.',
  ],
  masteryRequirement: 'Predict output involving reassignment and string joining without hints, and choose let or const correctly.',
};
