import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'filter-map-reduce',
  title: 'Filter, map and reduce',
  skill: 'data-structures',
  path: 'finance',
  paths: ['finance', 'automation', 'web'],
  minutes: 25,
  objective: 'Use filter to keep matching items, map to transform each item, and reduce to combine items into one value such as a total.',
  whyItMatters:
    'Questions like "how much did I spend on food in October?" are a filter, then a sum. These three methods turn a list of transactions into the summaries your finance tracker shows, and the same patterns sort and score leads for your sales agent.',
  prerequisites: ['arrays-and-objects', 'functions'],
  sections: [
    {
      heading: 'filter: keep what matches',
      body: ['filter runs a test function on each item and returns a new array with only the items where the test returned true. The original array is unchanged.'],
      code: 'const food = transactions.filter((t) => t.category === "food");',
    },
    {
      heading: 'map: transform each item',
      body: ['map runs a function on each item and returns a new array of the results, always the same length as the original.'],
      code: 'const amounts = food.map((t) => t.cents);  // [1250, 830, 2100]',
    },
    {
      heading: 'reduce: combine into one value',
      body: [
        'reduce walks through the array carrying a running result, often called the accumulator. You give it a function and a starting value.',
        'Always give the starting value. Without it, reduce uses the first item as the start, and on an empty array it throws an error.',
      ],
      code: 'const totalCents = amounts.reduce((sum, c) => sum + c, 0);  // 4180\n\n// Or all at once:\ntransactions\n  .filter((t) => t.category === "food")\n  .reduce((sum, t) => sum + t.cents, 0);',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'predict-filter-map',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const txns = [\n  { category: "food", cents: 500 },\n  { category: "rent", cents: 90000 },\n  { category: "food", cents: 250 },\n];\nconst result = txns\n  .filter((t) => t.category === "food")\n  .map((t) => t.cents / 100);\nconsole.log(result);',
      options: [
        { id: 'a', text: '[5, 2.5]', correct: true, why: 'Right. filter keeps the two food items, then map converts each from cents to dollars.' },
        { id: 'b', text: '[500, 250]', correct: false, why: 'map divides each by 100 after filtering.' },
        { id: 'c', text: '7.5', correct: false, why: 'Nothing here adds the values together. That would need reduce.', misconception: 'Confuses map with reduce' },
        { id: 'd', text: '[5, 900, 2.5]', correct: false, why: 'filter removes the rent item first.' },
      ],
    },
    {
      kind: 'choice',
      id: 'bug-reduce-empty',
      variant: 'bug',
      prompt: 'This works most of the time but crashes with "Reduce of empty array with no initial value" for a category with no transactions. Why?',
      code: 'function categoryTotal(txns, category) {\n  return txns\n    .filter((t) => t.category === category)\n    .reduce((sum, t) => sum + t.cents);\n}',
      options: [
        { id: 'a', text: 'reduce has no starting value, so it fails on an empty array (and adds an object, not cents, as the first value).', correct: true, why: 'Right. Pass 0 as the second argument: .reduce((sum, t) => sum + t.cents, 0).' },
        { id: 'b', text: 'filter can\'t return an empty array.', correct: false, why: 'It can, and here it does when nothing matches. reduce is what breaks.' },
        { id: 'c', text: 'The arrow function needs curly braces.', correct: false, why: 'A one-line arrow function returns its expression without braces.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-filter',
      prompt: 'Keep only the food transactions.',
      code: 'const food = transactions.___((t) => t.category === "food");',
      accepted: ['filter'],
      explanation: 'filter keeps the items whose test returns true.',
      commonWrong: [{ answer: 'map', why: 'map would return true/false for every item instead of keeping only matches.', misconception: 'Confuses filter with map' }, { answer: 'find', why: 'find returns only the first match, not all of them.' }],
    },
    {
      kind: 'explain',
      id: 'explain-question',
      prompt: 'Describe, step by step, how you would answer "what was my biggest single expense in rent this year?" using these methods.',
      lookFor: ['filter to rent (and this year)', 'map to the amounts, or compare objects directly', 'reduce (or Math.max) to find the largest, with a sensible start value'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-map-length',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const doubled = [1, 2, 3, 4].map((n) => n * 2);\nconsole.log(doubled.length);',
      options: [
        { id: 'a', text: '4', correct: true, why: 'Right. map always returns an array the same length as the original.' },
        { id: 'b', text: '20', correct: false, why: 'That would be a sum. map transforms each item but doesn\'t combine them.', misconception: 'Confuses map with reduce' },
        { id: 'c', text: '8', correct: false, why: 'The values are doubled, not the number of items.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-reduce',
      prompt: 'Add up all the amounts, starting from zero.',
      code: 'const total = amounts.___((sum, n) => sum + n, 0);',
      accepted: ['reduce'],
      explanation: 'reduce combines all items into one value, here a running sum starting at 0.',
      commonWrong: [{ answer: 'map', why: 'map transforms each item into a new array; it doesn\'t combine them.', misconception: 'Confuses map with reduce' }],
    },
  ],
  misconceptions: [
    { myth: 'filter and map change the original array.', reality: 'They return new arrays and leave the original alone.' },
    { myth: 'reduce\'s starting value is optional.', reality: 'Technically, but leaving it out breaks on empty arrays. Always pass it.' },
  ],
  hints: ['filter: fewer items. map: same count, changed items. reduce: one value.', 'Work through the chain one method at a time.', 'What happens if the list is empty?'],
  masteryRequirement: 'Predict filter/map chains, fix a reduce without a starting value, and choose the right method, without hints.',
};
