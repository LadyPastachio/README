import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'describing-requirements',
  title: 'Saying exactly what you want',
  skill: 'tech-communication',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 15,
  objective: 'Turn a vague request into a precise requirement with checkable acceptance criteria, and tell requirements apart from preferences.',
  whyItMatters:
    'Whether you\'re asking an AI to write code, briefing a developer or writing your own to-do list, vague requests produce unpredictable results. Precise requirements are how you get what you meant, and how you check whether you got it.',
  prerequisites: [],
  sections: [
    {
      heading: 'Vague requests get guesses',
      body: [
        '"Make the budget page better" could mean a hundred things. Whoever builds it, person or AI, has to guess, and you only find out what they guessed when it\'s done.',
        'A precise request says what, where, how it behaves, and how you\'ll know it\'s right.',
      ],
    },
    {
      heading: 'Must versus nice-to-have',
      body: [
        'Separate requirements ("must work on a 375px-wide phone") from preferences ("I\'d like calm colors"). Requirements are pass or fail. Preferences guide choices.',
        'Writing them separately helps you, and any AI you work with, make the right trade-offs.',
      ],
    },
    {
      heading: 'Acceptance criteria you can check',
      body: [
        'An acceptance criterion is a statement someone could test and answer yes or no. "User-friendly" can\'t be checked. "Submitting with an empty email shows \'Enter an email address\' under the field" can.',
        'Include edge cases: empty input, zero, very long text, no internet connection.',
      ],
      code: 'Given the email field is empty\nWhen I press Save\nThen I see "Enter an email address" under the field\nAnd nothing is sent',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'most-precise',
      variant: 'concept',
      prompt: 'Which request will most reliably get you what you want?',
      options: [
        { id: 'a', text: 'On the budget page, show each category\'s spending as a horizontal bar, largest first. Categories over budget show the amount over in red. Must fit a 375px-wide screen.', correct: true, why: 'Right. It says what, where, how it behaves, and includes a checkable constraint.' },
        { id: 'b', text: 'Make the budget page look modern and clean.', correct: false, why: '"Modern and clean" are preferences without detail. Two people would build very different pages.', misconception: 'Treats style words as specifications' },
        { id: 'c', text: 'Add charts to the budget page.', correct: false, why: 'Better, but which charts, of what data, behaving how?' },
        { id: 'd', text: 'Make the budget page better.', correct: false, why: 'This gives the builder nothing to go on.' },
      ],
    },
    {
      kind: 'choice',
      id: 'testable',
      variant: 'concept',
      prompt: 'Which of these is a testable acceptance criterion?',
      options: [
        { id: 'a', text: 'Submitting with an empty email shows "Enter an email address" under the field, and nothing is sent.', correct: true, why: 'Right. Anyone can try it and answer yes or no.' },
        { id: 'b', text: 'The form should be user-friendly.', correct: false, why: 'Nobody can test "user-friendly" without first defining what it means.', misconception: 'Treats style words as specifications' },
        { id: 'c', text: 'Errors should be handled well.', correct: false, why: 'Which errors, and what counts as "well"?' },
        { id: 'd', text: 'The page loads fast.', correct: false, why: 'Close, but how fast, on what connection? "Under 2 seconds on a 4G phone" would be testable.' },
      ],
    },
    {
      kind: 'order',
      id: 'order-bug-report',
      prompt: 'Put the parts of a good bug report in the usual order.',
      steps: [
        'A short title naming the problem',
        'Numbered steps to reproduce it',
        'What you expected to happen',
        'What actually happened',
        'Where it happened: browser, device, app version',
      ],
      feedback: {
        correct: 'That\'s the standard shape. Someone else can now see the bug for themselves.',
        incorrect: 'Start with what lets someone find it fast, then how to make it happen, then the gap between expected and actual.',
      },
    },
    {
      kind: 'explain',
      id: 'explain-rewrite',
      prompt: 'Rewrite "make the chess opponent smarter" as a precise requirement with at least two acceptance criteria.',
      lookFor: ['What "smarter" means concretely (e.g. never misses a capture of an undefended piece)', 'At least two yes/no criteria', 'A limit such as response time (e.g. moves within 2 seconds)'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-edge',
      variant: 'concept',
      prompt: 'You\'re specifying an "amount" field for new transactions. Which is an edge case worth writing down?',
      options: [
        { id: 'a', text: 'What happens when the amount is 0 or negative', correct: true, why: 'Right. Edge cases are the unusual inputs that break things if nobody decided what should happen.' },
        { id: 'b', text: 'The field\'s font', correct: false, why: 'That\'s a styling detail, not a behavior.' },
        { id: 'c', text: 'Typing a normal amount like 25', correct: false, why: 'That\'s the main case. Edge cases are at the boundaries.' },
      ],
    },
    {
      kind: 'choice',
      id: 'review-preference',
      variant: 'concept',
      prompt: 'Which of these is a preference rather than a requirement?',
      options: [
        { id: 'a', text: 'I\'d like it to feel calm, maybe with blue tones.', correct: true, why: 'Right. It guides choices but has no pass/fail test.' },
        { id: 'b', text: 'Text must have a contrast ratio of at least 4.5:1.', correct: false, why: 'That\'s measurable and pass/fail: a requirement.' },
        { id: 'c', text: 'The menu must be reachable with the keyboard.', correct: false, why: 'That can be tested directly: a requirement.' },
      ],
    },
  ],
  misconceptions: [
    { myth: 'A longer prompt is a better prompt.', reality: 'A precise one is better. Length only helps when it adds checkable detail.' },
    { myth: 'The builder will know what I mean.', reality: 'They will guess. Write down what you\'d check.' },
  ],
  hints: ['Could two different people build very different things from this?', 'Could you test it and answer yes or no?', 'A reader needs to find the bug, reproduce it, then see the gap.'],
  masteryRequirement: 'Pick precise, testable requirements and write your own acceptance criteria, without hints.',
};
