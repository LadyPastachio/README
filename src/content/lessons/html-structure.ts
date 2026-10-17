import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'html-structure',
  title: 'HTML: structure and meaning',
  skill: 'html',
  paths: ['web', 'finance', 'chess'],
  minutes: 20,
  objective: 'Read nested HTML, choose elements that describe their content, and use the attributes links and images need.',
  whyItMatters:
    'HTML is the skeleton of every page you\'ll build. Choosing the right element isn\'t pedantry: a real <button> works with the keyboard and screen readers for free, while a styled <div> doesn\'t. Good structure is also what makes CSS and JavaScript easy later.',
  prerequisites: ['how-a-page-reaches-you'],
  sections: [
    {
      heading: 'Elements, tags and nesting',
      body: [
        'HTML is made of elements. Most have an opening tag, content and a closing tag: <p>Hello</p>. Elements nest inside each other like boxes, and an element must close before its parent does.',
        'A few elements, like <img>, have no content and no closing tag.',
      ],
      code: '<main>\n  <h1>My chess game</h1>\n  <p>Play against the computer.</p>\n</main>',
    },
    {
      heading: 'Say what things are',
      body: [
        'Semantic elements describe meaning: <header>, <nav>, <main>, <button>, <h1> to <h6>. Browsers, search engines and assistive technology all rely on that meaning.',
        'A <div> means nothing in particular. It\'s fine for grouping things for layout, but not as a replacement for a button, heading or link.',
      ],
    },
    {
      heading: 'Attributes add details',
      body: [
        'Attributes go inside the opening tag. A link needs href (where it goes). An image needs src (the file) and alt (a text description for people who can\'t see it).',
      ],
      code: '<a href="/projects">See my projects</a>\n<img src="board.png" alt="Chess board at the start of a game">',
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'choose-button',
      variant: 'concept',
      prompt: 'You need a control that saves a transaction when clicked. Which element should you use?',
      options: [
        { id: 'a', text: '<button>', correct: true, why: 'Right. A button can be reached with Tab, activated with Enter or Space, and is announced as a button, all without extra code.' },
        { id: 'b', text: '<div> with a click handler', correct: false, why: 'It works with a mouse, but keyboard and screen-reader users can\'t reach or understand it unless you rebuild everything a button already does.', misconception: 'Thinks any element can stand in for a button' },
        { id: 'c', text: '<a> with no href', correct: false, why: 'Links are for going somewhere. Without href it isn\'t even focusable.' },
        { id: 'd', text: '<span>', correct: false, why: 'A span has no meaning or behavior. It\'s for styling bits of text.' },
      ],
    },
    {
      kind: 'choice',
      id: 'bug-alt',
      variant: 'bug',
      prompt: 'A screen-reader user gets nothing useful from the chart. What\'s missing?',
      code: '<h1>Monthly budget</h1>\n<img src="spending-chart.png">\n<p>You spent less on food this month.</p>',
      options: [
        { id: 'a', text: 'An alt attribute describing what the chart shows', correct: true, why: 'Right. For example: alt="Bar chart: food spending fell from $420 to $310".' },
        { id: 'b', text: 'A closing </img> tag', correct: false, why: '<img> is an empty element and has no closing tag.', misconception: 'Thinks img needs a closing tag' },
        { id: 'c', text: 'A width attribute', correct: false, why: 'Width affects layout, not what assistive technology can tell the user.' },
        { id: 'd', text: 'A <title> element', correct: false, why: '<title> names the whole page in the browser tab. It doesn\'t describe images.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-href',
      prompt: 'Make this link go to the projects page.',
      code: '<a ___="/projects">See my projects</a>',
      accepted: ['href'],
      explanation: 'href ("hypertext reference") tells a link where to go.',
      commonWrong: [{ answer: 'src', why: 'src is for loading a resource into the page, like an image or script. Links use href.', misconception: 'Mixes up href and src' }],
    },
    {
      kind: 'order',
      id: 'order-nesting',
      prompt: 'Arrange these lines into correctly nested HTML.',
      steps: ['<body>', '<main>', '<h1>My chess game</h1>', '</main>', '</body>'],
      feedback: {
        correct: 'Each element closes before the element that contains it. That\'s what "nested" means.',
        incorrect: 'An element has to close before its parent closes. Which element is the outermost box here?',
      },
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-nav',
      variant: 'concept',
      prompt: 'Which element should wrap a site\'s main menu of links?',
      options: [
        { id: 'a', text: '<nav>', correct: true, why: 'Right. <nav> marks a block of navigation links, and screen readers let users jump straight to it.' },
        { id: 'b', text: '<div>', correct: false, why: 'A div works visually but tells assistive technology nothing.', misconception: 'Thinks any element can stand in for a button' },
        { id: 'c', text: '<main>', correct: false, why: '<main> is for the page\'s main content, not its menu.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-alt',
      prompt: 'Describe the image for people who can\'t see it.',
      code: '<img src="knight.png" ___="White knight">',
      accepted: ['alt'],
      explanation: 'alt is read aloud by screen readers and shown if the image fails to load.',
      commonWrong: [{ answer: 'title', why: 'title shows a tooltip on hover. alt is what assistive technology reads.' }],
    },
  ],
  misconceptions: [
    { myth: 'Any element can be made into a button with CSS and JavaScript.', reality: 'You\'d have to rebuild keyboard support and accessibility yourself. <button> gives you both.' },
    { myth: 'alt text is optional decoration.', reality: 'It\'s the only way some people know what an image shows.' },
  ],
  hints: ['Ask what the thing is, not how it should look.', 'Links go somewhere (href). Images load something (src).', 'Find the outermost element first, then work inwards.'],
  masteryRequirement: 'Choose semantic elements, supply required attributes and nest elements correctly, without hints.',
};
