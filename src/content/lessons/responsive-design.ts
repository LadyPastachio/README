import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'responsive-design',
  title: 'Pages that work on any screen',
  skill: 'css-layout',
  path: 'web',
  paths: ['web', 'finance', 'chess'],
  minutes: 20,
  objective: 'Make a page adapt from phone to desktop with the viewport tag, flexible sizes and mobile-first media queries.',
  whyItMatters:
    'Most people will open your projects on a phone first. A page designed only for a laptop screen is unreadable there. Responsive design is the difference between something that works for you and something you can share.',
  prerequisites: ['flexbox-layout'],
  sections: [
    {
      heading: 'Tell the phone the truth',
      body: [
        'Without a viewport tag, phones pretend to be a wide desktop screen and shrink the page until it\'s unreadable. This one line in <head> tells the browser to use the device\'s real width.',
      ],
      code: '<meta name="viewport" content="width=device-width, initial-scale=1">',
    },
    {
      heading: 'Flexible by default',
      body: [
        'Prefer sizes that adapt: percentages, max-width, and layouts that wrap. Images need max-width: 100% so they never burst out of a narrow column.',
        'Use rem for text sizes so they respect the reader\'s browser settings.',
      ],
      code: 'img {\n  max-width: 100%;\n  height: auto;\n}\n.page {\n  max-width: 960px;\n  margin: 0 auto;   /* centered on wide screens */\n  padding: 0 16px;  /* breathing room on phones */\n}',
    },
    {
      heading: 'Mobile first, then add',
      body: [
        'Write the phone layout first, as your default CSS. Then use media queries with min-width to add changes for larger screens. Styles inside @media (min-width: 768px) only apply when the screen is at least 768px wide.',
        'Starting small keeps the phone version simple, and wider screens only add.',
      ],
      code: '.cards {\n  display: grid;\n  gap: 16px;               /* phone: one column */\n}\n@media (min-width: 768px) {\n  .cards {\n    grid-template-columns: 1fr 1fr;  /* tablet and up: two */\n  }\n}',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'which-query',
      variant: 'concept',
      prompt: 'Which media query applies its styles only on screens 768px wide or more?',
      options: [
        { id: 'a', text: '@media (min-width: 768px)', correct: true, why: 'Right. min-width means "at least this wide".' },
        { id: 'b', text: '@media (max-width: 768px)', correct: false, why: 'max-width means "at most this wide": phones and small tablets.', misconception: 'Mixes up min-width and max-width' },
        { id: 'c', text: '@media (width: 768px)', correct: false, why: 'That matches exactly 768px, almost never what you want.' },
      ],
    },
    {
      kind: 'order',
      id: 'order-mobile-first',
      prompt: 'Order the steps of building a page mobile-first.',
      steps: [
        'Add the viewport meta tag',
        'Write the default CSS for a narrow phone screen',
        'Check it on a narrow screen and fix overflow',
        'Add min-width media queries for wider layouts',
        'Check each width again',
      ],
      feedback: {
        correct: 'That\'s the workflow: phone first, then add for wider screens, and check as you go.',
        incorrect: 'Mobile-first means the phone layout is the starting point, and wider layouts are added on top.',
      },
    },
    {
      kind: 'fill',
      id: 'fill-img',
      prompt: 'Stop images from overflowing narrow screens.',
      code: 'img {\n  max-width: ___;\n  height: auto;\n}',
      accepted: ['100%'],
      explanation: 'max-width: 100% lets an image shrink to fit its container but never grow past its natural size.',
      commonWrong: [{ answer: 'auto', why: 'auto doesn\'t limit the width, so large images still overflow.' }, { answer: '100', why: 'Without a unit, CSS ignores it. Use 100%.' }],
    },
    {
      kind: 'explain',
      id: 'explain-check',
      prompt: 'How would you check that a page you built works on a phone, using only your laptop?',
      lookFor: ['Use the browser\'s developer tools device mode, or resize the window narrow', 'Look for sideways scrolling, overflowing images, tiny text', 'Test real interactions (menus, forms) at that size'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-viewport',
      variant: 'concept',
      prompt: 'A page looks tiny and zoomed out on phones, though its CSS is responsive. What is most likely missing?',
      options: [
        { id: 'a', text: 'The viewport meta tag', correct: true, why: 'Right. Without it, phones render at a fake desktop width and shrink the page.' },
        { id: 'b', text: 'A max-width media query', correct: false, why: 'Media queries won\'t trigger correctly until the viewport tag tells the phone its real width.' },
        { id: 'c', text: 'A larger font size', correct: false, why: 'Everything is shrunk, not just text. That points to the viewport.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-meta',
      prompt: 'Complete the viewport tag.',
      code: '<meta name="viewport" content="width=___, initial-scale=1">',
      accepted: ['device-width'],
      explanation: 'device-width tells the browser to lay out the page at the screen\'s real width.',
      commonWrong: [{ answer: '100%', why: 'The viewport tag uses the keyword device-width, not a percentage.' }],
    },
  ],
  misconceptions: [
    { myth: 'Responsive means making a separate phone site.', reality: 'One page adapts with flexible sizes and media queries.' },
    { myth: 'Start with the desktop design and squeeze it down.', reality: 'Starting with the phone layout is usually simpler, then add for wider screens.' },
  ],
  hints: ['min-width means "at least this wide".', 'Start with the narrowest screen.', 'Images need a limit relative to their container.'],
  masteryRequirement: 'Use the viewport tag, flexible sizing and mobile-first media queries correctly, without hints.',
};
