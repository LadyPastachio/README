import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'money-math',
  title: 'Money math you can trust',
  skill: 'js-basics',
  path: 'finance',
  paths: ['finance', 'automation'],
  minutes: 20,
  objective: 'Explain why 0.1 + 0.2 isn\'t exactly 0.3 in JavaScript, store money as whole cents, and format it only for display.',
  whyItMatters:
    'A finance tracker that is off by a cent destroys trust. Computers store decimals in binary, which makes small rounding errors. Professional finance code avoids them with one simple habit: count money in whole cents.',
  prerequisites: ['values-and-variables'],
  sections: [
    {
      heading: 'The 0.1 + 0.2 surprise',
      body: [
        'JavaScript numbers are stored in binary. Some simple decimals, like 0.1, can\'t be represented exactly in binary, just as 1/3 can\'t be written exactly in decimal.',
        'The tiny errors usually hide, but they show up when you add or compare: 0.1 + 0.2 is 0.30000000000000004.',
      ],
      code: 'console.log(0.1 + 0.2);         // 0.30000000000000004\nconsole.log(0.1 + 0.2 === 0.3); // false',
    },
    {
      heading: 'Count in cents',
      body: [
        'Whole numbers are stored exactly (up to about 9 quadrillion). So store $19.99 as 1999 cents, do all your adding and subtracting in cents, and you get exact answers.',
        'When money arrives as text from a form, convert carefully: multiply by 100 and round, so "12.34" becomes 1234.',
      ],
      code: 'const priceCents = Math.round(Number("12.34") * 100); // 1234\nconst total = 1999 + 1234;                             // 3233, exact',
    },
    {
      heading: 'Format only at the end',
      body: [
        'Turn cents back into dollars only when showing them to a person. toFixed(2) gives exactly two decimal places as text.',
        'Keep the formatting separate from the math: once a value is text, don\'t do arithmetic with it again.',
      ],
      code: 'function formatCents(cents) {\n  return "$" + (cents / 100).toFixed(2);\n}\nformatCents(3233); // "$32.33"',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'predict-float',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'console.log(0.1 + 0.2 === 0.3);',
      options: [
        { id: 'a', text: 'false', correct: true, why: 'Right. 0.1 + 0.2 is 0.30000000000000004 in binary floating point, so it isn\'t exactly equal to 0.3.' },
        { id: 'b', text: 'true', correct: false, why: 'It looks like it should be, but binary can\'t store 0.1 or 0.2 exactly, and the tiny errors add up.', misconception: 'Assumes decimal arithmetic is exact in code' },
        { id: 'c', text: 'An error', correct: false, why: 'Nothing is wrong with the code. It runs and gives a surprising answer.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-cents',
      prompt: 'Convert a dollar amount to whole cents.',
      code: 'const cents = Math.round(12.34 * ___);\nconsole.log(cents); // 1234',
      accepted: ['100'],
      explanation: 'Multiply by 100 to get cents, and round to clear away any floating-point dust.',
      commonWrong: [{ answer: '10', why: 'There are 100 cents in a dollar.' }],
    },
    {
      kind: 'choice',
      id: 'store-as',
      variant: 'concept',
      prompt: 'How should a finance tracker store a price of $19.99?',
      options: [
        { id: 'a', text: 'As the number 1999 (cents)', correct: true, why: 'Right. Whole numbers are exact, so totals and comparisons stay correct.' },
        { id: 'b', text: 'As the number 19.99', correct: false, why: 'Decimals pick up tiny binary errors that show up in totals.', misconception: 'Assumes decimal arithmetic is exact in code' },
        { id: 'c', text: 'As the text "$19.99"', correct: false, why: 'Text can\'t be added safely ("19.99" + 1 is "19.991"), and the $ has to be stripped every time.', misconception: 'Treats a number in quotes as a number' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-ai-numbers',
      prompt: 'Your finance tracker will later use AI to suggest categories. Why should the totals still come from code like this, not from the AI?',
      lookFor: ['Totals must be exact and repeatable', 'Code can be tested; model output varies and can be wrong', 'AI can help with words (categories, summaries), not the numbers themselves'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-format',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const total = 1999 + 501;\nconsole.log((total / 100).toFixed(2));',
      options: [
        { id: 'a', text: '25.00', correct: true, why: 'Right. 2500 cents is $25, and toFixed(2) always shows two decimals.' },
        { id: 'b', text: '25', correct: false, why: 'toFixed(2) pads to two decimal places.' },
        { id: 'c', text: '2500', correct: false, why: 'Dividing by 100 converts cents back to dollars.' },
      ],
    },
    {
      kind: 'choice',
      id: 'review-compare',
      variant: 'concept',
      prompt: 'You need to check whether a budget is exactly used up. Which is safest?',
      options: [
        { id: 'a', text: 'Compare whole-cent integers: spentCents === budgetCents', correct: true, why: 'Right. Integer comparisons are exact.' },
        { id: 'b', text: 'Compare decimals: spent === budget', correct: false, why: 'Decimal values can be off by a tiny fraction and fail an exact comparison.', misconception: 'Assumes decimal arithmetic is exact in code' },
        { id: 'c', text: 'Compare the formatted text: "$" + spent === "$" + budget', correct: false, why: 'Formatting hides the problem rather than fixing it, and mixes display with math.' },
      ],
    },
  ],
  misconceptions: [
    { myth: 'Computers do decimal arithmetic exactly.', reality: 'Binary floating point makes tiny errors with many decimals. Use whole cents for money.' },
    { myth: 'toFixed fixes the math.', reality: 'toFixed formats for display. Do the math in cents first.' },
  ],
  hints: ['Binary can\'t store 0.1 exactly.', 'Whole numbers are exact.', 'Format only at the moment you show a value.'],
  masteryRequirement: 'Explain floating-point error and choose integer cents for storage and comparison, without hints.',
};
