import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'json-basics',
  title: 'JSON: how programs pass data',
  skill: 'json',
  paths: ['web', 'finance', 'automation'],
  minutes: 15,
  objective: 'Recognize valid JSON, find the usual syntax mistakes, and convert between JSON text and JavaScript values.',
  whyItMatters:
    'When your finance tracker saves data, when a webhook delivers a new lead, when an AI model returns structured output: it\'s almost always JSON. Your app\'s backups are JSON too. One misplaced comma and the whole thing fails to load.',
  prerequisites: ['arrays-and-objects'],
  sections: [
    {
      heading: 'Text that looks like an object',
      body: [
        'JSON (JavaScript Object Notation) is a text format for data built from objects, arrays, strings, numbers, true, false and null. It looks almost exactly like a JavaScript object.',
        'Because it\'s plain text, any language can read it, which is why APIs use it.',
      ],
      code: '{\n  "lead": "Jordan",\n  "budget": 1200,\n  "interested": true,\n  "tags": ["new", "website"]\n}',
    },
    {
      heading: 'Stricter than JavaScript',
      body: [
        'Keys and strings must use double quotes. No single quotes, no unquoted keys.',
        'No trailing comma after the last item. No comments. Numbers and true/false/null are written without quotes.',
      ],
    },
    {
      heading: 'Converting',
      body: ['JSON.parse(text) turns JSON text into a JavaScript value you can use. JSON.stringify(value) turns a value into JSON text you can save or send.'],
      code: 'const text = \'{"amount": 42}\';\nconst data = JSON.parse(text);\ndata.amount;              // 42\nJSON.stringify(data);     // \'{"amount":42}\'',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'bug-trailing',
      variant: 'bug',
      prompt: 'This JSON fails to load. What\'s wrong with it?',
      code: '{\n  "name": "Avery",\n  "budget": 1200,\n  "categories": ["rent", "food",],\n}',
      options: [
        { id: 'a', text: 'There are trailing commas after "food" and after the last property.', correct: true, why: 'Right. JavaScript tolerates trailing commas; JSON does not. Remove both.' },
        { id: 'b', text: '1200 should be in quotes.', correct: false, why: 'Numbers are written without quotes in JSON. Quoting it would make it a string.', misconception: 'Thinks numbers must be quoted in JSON' },
        { id: 'c', text: 'Arrays aren\'t allowed inside JSON objects.', correct: false, why: 'Arrays and objects can be nested freely.' },
        { id: 'd', text: 'Keys shouldn\'t have quotes.', correct: false, why: 'The reverse: JSON requires double quotes around every key.' },
      ],
    },
    {
      kind: 'choice',
      id: 'valid-json',
      variant: 'concept',
      prompt: 'Which of these is valid JSON?',
      options: [
        { id: 'a', text: '{"done": true}', correct: true, why: 'Right. Double-quoted key, and true without quotes.' },
        { id: 'b', text: "{'done': true}", correct: false, why: 'JSON only allows double quotes.', misconception: 'Thinks JSON accepts single quotes' },
        { id: 'c', text: '{done: true}', correct: false, why: 'Keys must be in double quotes. This is valid JavaScript but not JSON.' },
        { id: 'd', text: '{"done": True}', correct: false, why: 'JSON\'s booleans are lowercase: true and false.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-parse',
      prompt: 'Turn the JSON text into a value you can read.',
      code: 'const data = JSON.___(\'{"amount": 42}\');\nconsole.log(data.amount); // 42',
      accepted: ['parse'],
      explanation: 'JSON.parse reads text and builds the JavaScript value it describes.',
      commonWrong: [{ answer: 'stringify', why: 'stringify goes the other way: value → text. Here we start with text.', misconception: 'Mixes up JSON.parse and JSON.stringify' }],
    },
    {
      kind: 'explain',
      id: 'explain-why-json',
      prompt: 'Why do you think systems send data as JSON text rather than sharing JavaScript objects directly?',
      lookFor: ['Programs on different computers can\'t share memory; they exchange text', 'JSON is readable by almost every language', 'It has strict rules, so both sides agree on the format'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-stringify-type',
      variant: 'predict',
      prompt: 'What does this print?',
      code: 'const text = JSON.stringify({ a: 1 });\nconsole.log(typeof text);',
      options: [
        { id: 'a', text: 'string', correct: true, why: 'Right. stringify always produces text.' },
        { id: 'b', text: 'object', correct: false, why: 'stringify turns an object into a string. parse goes back the other way.', misconception: 'Mixes up JSON.parse and JSON.stringify' },
        { id: 'c', text: 'number', correct: false, why: 'The result is the text {"a":1}.' },
      ],
    },
    {
      kind: 'choice',
      id: 'review-missing-comma',
      variant: 'bug',
      prompt: 'What\'s wrong with this JSON?',
      code: '{"lead": "Sam" "status": "new"}',
      options: [
        { id: 'a', text: 'A comma is missing between the two properties.', correct: true, why: 'Right. Every property except the last needs a comma after it.' },
        { id: 'b', text: '"new" should be new without quotes.', correct: false, why: 'Text values always need double quotes.' },
        { id: 'c', text: 'Objects can only have one property.', correct: false, why: 'Objects can have any number of properties, separated by commas.' },
      ],
    },
  ],
  misconceptions: [
    { myth: 'JSON is the same as a JavaScript object.', reality: 'JSON is text with stricter rules. You parse it to get an object.' },
    { myth: 'Every value in JSON needs quotes.', reality: 'Only keys and strings. Numbers, true, false and null are unquoted.' },
  ],
  hints: ['Check every comma: one between items, none after the last.', 'Check every quote: double quotes only, around keys and strings.', 'parse: text → value. stringify: value → text.'],
  masteryRequirement: 'Identify valid and invalid JSON and choose parse vs stringify, without hints.',
};
