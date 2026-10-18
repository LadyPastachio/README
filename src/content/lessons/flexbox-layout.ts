import type { LessonInput } from '../schema';

type LessonFile = Omit<LessonInput, 'alternatives'>;

export const lesson: LessonFile = {
  id: 'flexbox-layout',
  title: 'Layout with flexbox',
  skill: 'css-layout',
  path: 'web',
  paths: ['web', 'finance', 'chess'],
  minutes: 20,
  objective: 'Arrange items in a row or column with flexbox, control spacing and alignment, and let items wrap on small screens.',
  whyItMatters:
    'Almost every interface is rows and columns: a navigation bar, a list of budget categories, a row of chess squares. Flexbox is the everyday tool for that layout, and knowing its handful of properties lets you describe layouts precisely, to a browser or to an AI.',
  prerequisites: ['html-structure'],
  sections: [
    {
      heading: 'Turn on flex',
      body: [
        'By default, block elements stack vertically, each taking the full width. Add display: flex to a parent and its direct children line up in a row instead.',
        'flex-direction: column stacks them vertically again, but now with all the flex controls available.',
      ],
      code: '.nav {\n  display: flex;\n  gap: 16px;          /* space between items */\n}',
    },
    {
      heading: 'Spacing and alignment',
      body: [
        'justify-content spreads items along the main direction: flex-start, center, space-between. align-items lines them up across it: for a row, that\'s vertical alignment, and center is the common choice.',
        'gap puts space between items without margins on the first or last. It\'s the simplest way to space things evenly.',
      ],
      code: '.card {\n  display: flex;\n  justify-content: space-between; /* label left, amount right */\n  align-items: center;            /* vertically centered */\n}',
    },
    {
      heading: 'Wrapping and growing',
      body: [
        'flex-wrap: wrap lets items flow onto a new line when there isn\'t room, which is often all a layout needs to work on a phone.',
        'flex: 1 on a child tells it to grow and take up the leftover space, like a search box filling the rest of a toolbar.',
      ],
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'space-between',
      variant: 'concept',
      prompt: 'A budget row shows a category on the left and an amount on the right. Which declaration does that, once the row has display: flex?',
      options: [
        { id: 'a', text: 'justify-content: space-between', correct: true, why: 'Right. It pushes the first item to the start and the last to the end.' },
        { id: 'b', text: 'align-items: space-between', correct: false, why: 'align-items works across the row (vertically). space-between belongs to justify-content.', misconception: 'Mixes up justify-content and align-items' },
        { id: 'c', text: 'text-align: right', correct: false, why: 'That aligns text inside an element, not the position of flex items.' },
        { id: 'd', text: 'gap: auto', correct: false, why: 'gap sets a fixed space between items; it doesn\'t push them apart to the edges.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-gap',
      prompt: 'Put 16px of space between the links in a navigation bar.',
      code: '.nav {\n  display: flex;\n  ___: 16px;\n}',
      accepted: ['gap'],
      explanation: 'gap adds space between flex items only, never before the first or after the last.',
      commonWrong: [{ answer: 'margin', why: 'margin would add space around the whole nav, or need extra rules to skip the last item. gap is made for this.' }, { answer: 'padding', why: 'padding adds space inside the nav\'s edges, not between its items.' }],
    },
    {
      kind: 'choice',
      id: 'predict-wrap',
      variant: 'concept',
      prompt: 'Six cards, each 200px wide, sit in a flex row inside a 400px-wide phone screen. Nothing else is set. What happens?',
      options: [
        { id: 'a', text: 'They squeeze onto one line, shrinking or overflowing.', correct: true, why: 'Right. By default flex items stay on one line. Add flex-wrap: wrap to let them flow onto new lines.' },
        { id: 'b', text: 'They wrap into three rows of two.', correct: false, why: 'Only with flex-wrap: wrap. The default is nowrap.', misconception: 'Thinks flex items wrap by default' },
        { id: 'c', text: 'They stack into a single column.', correct: false, why: 'That needs flex-direction: column or a media query.' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-describe',
      prompt: 'Describe, precisely enough for someone else to build it, the layout of a toolbar with a logo on the left, a search box filling the middle and a button on the right.',
      lookFor: ['The toolbar is a flex row (display: flex)', 'The search box grows to fill space (flex: 1)', 'Alignment and spacing: align-items: center and a gap'],
    },
  ],
  review: [
    {
      kind: 'fill',
      id: 'review-center',
      prompt: 'Vertically center the items in a flex row.',
      code: '.row {\n  display: flex;\n  align-items: ___;\n}',
      accepted: ['center'],
      explanation: 'In a row, align-items controls the vertical alignment.',
      commonWrong: [{ answer: 'middle', why: 'CSS uses center. middle is for vertical-align on text.' }],
    },
    {
      kind: 'choice',
      id: 'review-grow',
      variant: 'concept',
      prompt: 'Which declaration makes one flex item take up all the remaining space?',
      options: [
        { id: 'a', text: 'flex: 1', correct: true, why: 'Right. It lets the item grow into leftover space.' },
        { id: 'b', text: 'width: auto', correct: false, why: 'Auto width sizes to content; it doesn\'t claim spare space in a flex row.' },
        { id: 'c', text: 'justify-content: stretch', correct: false, why: 'That isn\'t how flex items grow. Use flex: 1 on the item.', misconception: 'Mixes up justify-content and align-items' },
      ],
    },
  ],
  misconceptions: [
    { myth: 'display: flex goes on the items you want to arrange.', reality: 'It goes on their parent. The parent arranges its direct children.' },
    { myth: 'Flex items wrap automatically when space runs out.', reality: 'Only with flex-wrap: wrap.' },
  ],
  hints: ['Flex properties on the parent arrange its children.', 'justify-content works along the row; align-items works across it.', 'gap is the cleanest way to space items.'],
  masteryRequirement: 'Choose the right flex properties for spacing, alignment, wrapping and growing, without hints.',
};
