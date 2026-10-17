import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'how-a-page-reaches-you',
  title: 'How a web page reaches your screen',
  skill: 'how-web-works',
  paths: ['web', 'finance', 'chess', 'automation'],
  minutes: 15,
  objective: 'Describe, in order, what happens between typing an address and seeing the page, and name the role of the browser, DNS and the server.',
  whyItMatters:
    'Every project in this academy is built on this exchange. The finance tracker saves data with requests, the chess game loads as a page, and the sales agent receives leads as requests from other systems. When something breaks, knowing which step failed tells you where to look.',
  prerequisites: [],
  sections: [
    {
      heading: 'Two programs having a conversation',
      body: [
        'Opening a page is a conversation between two programs. Your browser asks for something; a server somewhere answers. The rules for that conversation are called HTTP.',
        'Each exchange has two halves. The request says what the browser wants, such as "GET /about". The response carries a status code that says how it went (200 means OK, 404 means not found) plus the content itself.',
      ],
      diagram: 'request-response',
    },
    {
      heading: 'Finding the server first',
      body: [
        'A name like example.com is for people. Computers need a numeric address. Before it can ask for the page, the browser looks the name up in DNS, the internet\'s address book.',
        'Then it opens a connection to that address and sends its request.',
      ],
    },
    {
      heading: 'One page, many requests',
      body: [
        'The first response is usually HTML: the page\'s structure. As the browser reads it, it finds references to stylesheets, scripts and images, and requests each of those too.',
        'Only then can it draw the page and run its JavaScript. A slow or failing page is often one of these later requests going wrong, which is exactly what the browser\'s developer tools let you see.',
      ],
    },
  ],
  activities: [
    {
      kind: 'order',
      id: 'order-steps',
      prompt: 'Put these steps in the order they happen when you open a page.',
      steps: [
        'You type an address and press Enter',
        'The browser looks up the server\'s address in DNS',
        'The browser sends an HTTP request to the server',
        'The server sends back a response with HTML',
        'The browser requests the CSS, JavaScript and images the HTML mentions',
        'The browser draws the page and runs its scripts',
      ],
      feedback: {
        correct: 'That\'s the sequence. Notice the browser can\'t request the CSS until it has read the HTML that mentions it.',
        incorrect: 'Not quite. Ask yourself what each step needs before it can happen. Can the browser send a request before it knows where the server is?',
      },
    },
    {
      kind: 'choice',
      id: 'status-404',
      variant: 'concept',
      prompt: 'A page loads, but its photo is missing. In the developer tools, the request for the photo shows status 404. What does that tell you?',
      options: [
        { id: 'a', text: 'The server was reached, but it has nothing at that address.', correct: true, why: 'Right. 404 means the request arrived and the server answered "not found". Check the image\'s path for a typo or a file that was never uploaded.' },
        { id: 'b', text: 'The internet connection dropped.', correct: false, why: 'If the connection had dropped, there would be no response at all, so no status code. Getting a 404 proves the server answered.', misconception: 'Thinks an error status means the connection failed' },
        { id: 'c', text: 'The server crashed while sending the photo.', correct: false, why: 'Server failures usually come back as 500-range codes. 404 is the server working normally and reporting that the file doesn\'t exist.', misconception: 'Confuses 404 (not found) with 500 (server error)' },
        { id: 'd', text: 'The browser doesn\'t support that image format.', correct: false, why: 'The status code comes from the server, before the browser tries to display anything. A format problem wouldn\'t change it.' },
      ],
    },
    {
      kind: 'explain',
      id: 'explain-own-words',
      prompt: 'In two or three sentences, explain to a friend why a page might show its text but none of its styling.',
      lookFor: [
        'The HTML and the CSS arrive in separate requests',
        'The request for the stylesheet failed or was slow (for example a 404 or a wrong path)',
        'How you could check: the Network tab in the developer tools',
      ],
    },
  ],
  misconceptions: [
    { myth: 'A page is one file that downloads all at once.', reality: 'It\'s usually dozens of separate requests, starting with the HTML.' },
    { myth: 'A 404 means the website is down.', reality: 'A 404 proves the server is up and answering. It just has nothing at that path.' },
    { myth: 'The browser and the server are the same program.', reality: 'They are separate programs, usually on different computers, that only communicate through requests and responses.' },
  ],
  hints: [
    'Every step depends on the one before it. Start with what you do, and end with what you see.',
    'The browser needs a number, not a name, before it can contact a server.',
    'The browser only learns that a stylesheet exists by reading the HTML.',
  ],
  masteryRequirement:
    'Order the steps without hints, interpret a status code correctly, and explain a partial page failure in your own words. Mastery is confirmed later by a new scenario during spaced review.',
  review: [
    {
      kind: 'choice',
      id: 'review-500',
      variant: 'concept',
      prompt: 'You submit a form and get back a page saying "500 Internal Server Error". Where is the problem most likely to be?',
      options: [
        { id: 'a', text: 'In the server\'s code, which failed while handling the request.', correct: true, why: 'Right. 500-range codes mean the server received the request but something went wrong on its side.' },
        { id: 'b', text: 'In your browser, which sent the wrong address.', correct: false, why: 'A wrong address usually gives 404. A 500 means the server found something to run, and that code failed.', misconception: 'Confuses 404 (not found) with 500 (server error)' },
        { id: 'c', text: 'In DNS, which could not find the server.', correct: false, why: 'If DNS failed, the browser would never reach the server, so there would be no status code at all.', misconception: 'Thinks an error status means the connection failed' },
      ],
    },
    {
      kind: 'order',
      id: 'review-order-short',
      prompt: 'Order what happens when a page loads its stylesheet.',
      steps: [
        'The browser receives the HTML',
        'It reads a <link> to style.css in the HTML',
        'It sends a request for style.css',
        'It applies the styles and redraws the page',
      ],
      feedback: {
        correct: 'Yes: the HTML has to arrive and be read before the browser knows the stylesheet exists.',
        incorrect: 'Think about how the browser learns that style.css exists at all.',
      },
    },
  ],
};
