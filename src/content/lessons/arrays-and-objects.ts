import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'arrays-and-objects',
  title: 'Lists and records: arrays and objects',
  skill: 'data-structures',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 20,
  objective: 'Read values out of arrays and objects, remember that arrays count from 0, and choose which structure fits a piece of data.',
  whyItMatters:
    'A list of transactions, the 64 squares of a chess board, a lead with a name and phone number: real data comes in groups. Arrays and objects are the two shapes nearly all data takes, in JavaScript and in the JSON that APIs send.',
  prerequisites: ['values-and-variables'],
  sections: [
    {
      heading: 'Arrays: ordered lists',
      body: [
        'An array holds values in order, inside square brackets. You read an item by its position, called its index, and indexes start at 0, not 1.',
        'array.length tells you how many items there are. The last item is therefore at index length - 1.',
      ],
      code: 'const moves = ["e4", "e5", "Nf3"];\nmoves[0];            // "e4"\nmoves.length;        // 3\nmoves[moves.length - 1]; // "Nf3"',
    },
    {
      heading: 'Objects: named fields',
      body: [
        'An object groups related values under names, inside curly braces. You read a value with a dot and its name.',
        'Asking for a name that isn\'t there doesn\'t cause an error. You get undefined, which can quietly travel through your program if you don\'t check for it.',
      ],
      code: 'const txn = { amount: 25, category: "food" };\ntxn.amount;   // 25\ntxn.date;     // undefined (no such field)',
    },
    {
      heading: 'Lists of records',
      body: [
        'The two combine naturally: an array of objects. A finance tracker\'s transactions, a list of incoming leads and a game\'s move history all look like this.',
        'Use an array when order or count matters. Use an object when each value has a meaning you\'d describe with a name.',
      ],
      code: 'const transactions = [\n  { amount: 25, category: "food" },\n  { amount: 900, category: "rent" },\n];\ntransactions[1].category; // "rent"',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'predict-index',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const moves = ["e4", "e5", "Nf3"];\nconsole.log(moves[1]);',
      options: [
        { id: 'a', text: 'e5', correct: true, why: 'Right. Index 0 is "e4", so index 1 is the second item, "e5".' },
        { id: 'b', text: 'e4', correct: false, why: '"e4" is at index 0. Arrays count from 0, so [1] is the second item.', misconception: 'Thinks arrays start counting at 1' },
        { id: 'c', text: 'Nf3', correct: false, why: '"Nf3" is at index 2.' },
        { id: 'd', text: 'undefined', correct: false, why: 'Index 1 exists in a 3-item array.' },
      ],
    },
    {
      kind: 'choice',
      id: 'predict-missing',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const txn = { amount: 25, category: "food" };\nconsole.log(txn.date);',
      options: [
        { id: 'a', text: 'undefined', correct: true, why: 'Right. Reading a field that doesn\'t exist gives undefined rather than an error.' },
        { id: 'b', text: 'An error', correct: false, why: 'JavaScript doesn\'t stop here. That\'s exactly why missing fields can cause bugs much later.', misconception: 'Thinks reading a missing property throws an error' },
        { id: 'c', text: 'date', correct: false, why: 'txn.date asks for the value stored under "date", not the word itself.' },
        { id: 'd', text: 'null', correct: false, why: 'null is a value someone has to set on purpose. A field that was never set is undefined.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-last',
      prompt: 'Print the last item, whatever the array\'s size.',
      code: 'const items = ["a", "b", "c"];\nconsole.log(items[items.___ - 1]);',
      accepted: ['length'],
      explanation: 'length is 3, and the last index is 3 - 1 = 2. This works for an array of any size.',
      commonWrong: [{ answer: 'size', why: 'Arrays use length. (size belongs to other structures, like Map and Set.)' }],
    },
    {
      kind: 'explain',
      id: 'explain-choose',
      prompt: 'For a lead in your sales agent, which details would go in an object, and when would you use an array? Give a short example.',
      lookFor: ['An object for one lead\'s named details (name, phone, status)', 'An array for many leads, or a lead\'s list of messages', 'Order or count matters → array; named meaning → object'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-length',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const scores = [10, 20, 30];\nconsole.log(scores.length);',
      options: [
        { id: 'a', text: '3', correct: true, why: 'Right. There are three items. length counts items; it isn\'t the last index.' },
        { id: 'b', text: '2', correct: false, why: '2 is the last index. length counts the items, which is 3.', misconception: 'Confuses length with the last index' },
        { id: 'c', text: '30', correct: false, why: 'length is how many items there are, not the last value.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-board',
      prompt: 'A board is an array of rows. Print the first square of the second row.',
      code: 'const board = [\n  ["r", "n"],\n  ["p", "p"],\n];\nconsole.log(board[1][___]);',
      accepted: ['0'],
      explanation: 'board[1] is the second row, and [0] is its first item.',
      commonWrong: [{ answer: '1', why: '[1] would be the second square of that row. First is 0.', misconception: 'Thinks arrays start counting at 1' }],
    },
  ],
  misconceptions: [
    { myth: 'The first item of an array is item 1.', reality: 'It\'s item 0. The last is at length - 1.' },
    { myth: 'Asking for a missing field crashes the program.', reality: 'It returns undefined, which can cause confusing problems later.' },
  ],
  hints: ['Count positions starting from 0.', 'length counts items. The last index is one less.', 'A dot followed by a name reads the value stored under that name.'],
  masteryRequirement: 'Read values from arrays and objects correctly, including the last item and missing fields, without hints.',
};
