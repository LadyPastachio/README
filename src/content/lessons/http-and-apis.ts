import type { LessonInput } from '../schema';

export const lesson: LessonInput = {
  id: 'http-and-apis',
  title: 'HTTP, APIs and webhooks',
  skill: 'http-apis',
  path: 'automation',
  paths: ['automation', 'finance', 'web'],
  minutes: 25,
  objective: 'Choose the right HTTP method, read a request and response, interpret status codes, and explain how a webhook delivers a new lead to your system.',
  whyItMatters:
    'Your sales agent will be connected to other systems: a form that sends new leads, a calendar to check, a CRM to log to. All of those conversations are HTTP requests. Understanding them lets you read API documentation, design your own endpoints and debug integrations.',
  prerequisites: ['json-basics', 'how-a-page-reaches-you'],
  sections: [
    {
      heading: 'Methods say what you want',
      body: [
        'GET reads something. POST creates something or submits data. PUT or PATCH changes something. DELETE removes it.',
        'A request also has a URL (which resource), headers (extra details such as the content type or a key) and, for POST and PUT, a body, usually JSON.',
      ],
      code: 'POST /api/leads HTTP/1.1\nContent-Type: application/json\n\n{ "name": "Jordan", "email": "jordan@example.com" }',
    },
    {
      heading: 'Status codes say what happened',
      body: [
        '2xx means success: 200 OK, 201 Created. 4xx means the request was wrong: 400 Bad Request (invalid data), 401 not signed in, 403 not allowed, 404 not found. 5xx means the server failed: 500.',
        'The difference matters: a 4xx means fix the request; a 5xx means the same request might work if you retry later.',
      ],
    },
    {
      heading: 'Webhooks: they call you',
      body: [
        'Usually your code calls an API. A webhook is the reverse: when something happens elsewhere, like a form being submitted, that system sends a POST request to a URL you gave it.',
        'Your webhook should check the data, record it, and reply 200 quickly. Slow work, such as drafting a reply with AI, should happen afterwards so the sender doesn\'t time out and send the same lead again.',
      ],
    },
  ],
  activities: [
    {
      kind: 'choice',
      id: 'which-method',
      variant: 'concept',
      prompt: 'Your app sends a new lead to a CRM\'s API to be saved. Which method fits?',
      options: [
        { id: 'a', text: 'POST', correct: true, why: 'Right. POST submits data to create something new.' },
        { id: 'b', text: 'GET', correct: false, why: 'GET is for reading. It shouldn\'t create or change anything.', misconception: 'Uses GET to change data' },
        { id: 'c', text: 'DELETE', correct: false, why: 'DELETE removes things.' },
      ],
    },
    {
      kind: 'order',
      id: 'order-webhook',
      prompt: 'Put the steps of a lead arriving by webhook in order.',
      steps: [
        'A visitor submits the contact form on the client\'s website',
        'The form provider sends a POST request to your webhook URL',
        'Your server checks the data is valid',
        'Your server records the lead and replies 200 OK',
        'Follow-up work, such as drafting a reply, runs afterwards',
      ],
      feedback: {
        correct: 'That\'s it. Replying quickly, before the slow work, keeps the sender from retrying.',
        incorrect: 'The webhook is triggered by the form, and the reply to the sender should come before any slow follow-up work.',
      },
    },
    {
      kind: 'choice',
      id: 'status-400',
      variant: 'concept',
      prompt: 'A webhook arrives without the lead\'s email address, which your system requires. What status should you respond with?',
      options: [
        { id: 'a', text: '400 Bad Request', correct: true, why: 'Right. The request itself is invalid; the sender needs to fix it.' },
        { id: 'b', text: '500 Internal Server Error', correct: false, why: '500 says your server broke. Here, your server worked correctly and rejected bad data.', misconception: 'Confuses 404 (not found) with 500 (server error)' },
        { id: 'c', text: '200 OK', correct: false, why: 'That tells the sender everything worked, so nobody will notice the lead was lost.' },
      ],
    },
    {
      kind: 'fill',
      id: 'fill-post',
      prompt: 'Send a lead to an API as JSON.',
      code: 'fetch("https://api.example.com/leads", {\n  method: "___",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(lead),\n});',
      accepted: ['POST'],
      caseSensitive: false,
      explanation: 'POST, with the lead as a JSON body.',
      commonWrong: [{ answer: 'GET', why: 'GET requests don\'t carry a body and shouldn\'t create data.', misconception: 'Uses GET to change data' }],
    },
    {
      kind: 'explain',
      id: 'explain-quick',
      prompt: 'Why should a webhook reply quickly and do slow work (like calling an AI model) afterwards?',
      lookFor: ['The sender may time out and retry, creating duplicate leads', 'Slow or failing AI calls shouldn\'t lose the lead', 'Record first, then process'],
    },
  ],
  review: [
    {
      kind: 'choice',
      id: 'review-404',
      variant: 'concept',
      prompt: 'Your agent asks the calendar API for a booking ID that was deleted. Which status code would you expect?',
      options: [
        { id: 'a', text: '404 Not Found', correct: true, why: 'Right. The server worked, but nothing exists at that address any more.' },
        { id: 'b', text: '201 Created', correct: false, why: '201 confirms something was created.' },
        { id: 'c', text: '503 Service Unavailable', correct: false, why: '5xx would mean the server itself has a problem.' },
      ],
    },
    {
      kind: 'fill',
      id: 'review-get',
      prompt: 'Read today\'s available slots from a calendar API.',
      code: 'fetch("/api/slots?date=2026-10-20", { method: "___" });',
      accepted: ['GET'],
      caseSensitive: false,
      explanation: 'GET reads data without changing anything.',
      commonWrong: [{ answer: 'POST', why: 'POST is for submitting or creating. Reading uses GET.' }],
    },
  ],
  misconceptions: [
    { myth: 'Any error means the server is broken.', reality: '4xx means the request was wrong; only 5xx means the server failed.' },
    { myth: 'A webhook is something you call.', reality: 'A webhook is a URL you provide that another system calls when something happens.' },
  ],
  hints: ['GET reads; POST creates.', 'First digit: 2 success, 4 your request, 5 their server.', 'With a webhook, the other system starts the conversation.'],
  masteryRequirement: 'Choose methods, interpret status codes and describe the webhook flow, without hints.',
};
