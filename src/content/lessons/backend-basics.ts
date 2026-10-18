import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "backend-basics",
  title: "A small service: receiving webhooks safely",
  skill: "backend",
  paths: ["automation"],
  path: "automation",
  minutes: 22,
  objective: "Describe what a backend endpoint does, answer with the right status codes, verify where a webhook came from, and make processing idempotent so a repeated delivery does nothing twice.",
  whyItMatters:
    "Lead forms and booking tools send webhooks to your service. They retry when they don't hear back, so the same lead can arrive twice. A follow-up agent that emails people twice, or books twice, loses trust fast.",
  prerequisites: ["http-and-apis", "validating-input", "sql-basics"],
  sections: [
    {
      heading: "An endpoint is a function with a URL",
      body: [
        "A backend receives an HTTP request (method, path, headers, body), does privileged work the browser must not do (store data, use secrets, call other services) and returns a response with a status code and body.",
        "Status codes tell the sender what happened: 200 or 201 done, 400 your data is wrong, 401 or 403 you're not allowed, 409 conflict, 500 our fault. Senders decide whether to retry based on them.",
      ],
    },
    {
      heading: "Check who sent it",
      body: [
        "Anyone can POST to a public URL. Webhook providers usually sign each request with a shared secret; your service recomputes the signature and rejects mismatches with 401 before doing anything else.",
        "Then validate the body as untrusted input, exactly as in the earlier lesson.",
      ],
    },
    {
      heading: "Idempotency: twice is the same as once",
      body: [
        "Each event carries an id. Before processing, check whether that id was already handled (a database table with a unique column). If so, answer 200 and stop: the sender gets its acknowledgment, and nothing happens twice.",
        "Record the id in the same step as the work (a transaction), so a crash halfway can't leave it half-done.",
      ],
      code: "function handleWebhook(req) {\n  if (!validSignature(req)) return { status: 401 };\n  const event = parseEvent(req.body);\n  if (!event.ok) return { status: 400, body: event.errors };\n  if (seen.has(event.id)) return { status: 200, body: \"duplicate ignored\" };\n  seen.add(event.id);\n  storeLead(event.lead);\n  return { status: 201 };\n}",
    },
  ],
  activities: [
    {
      kind: "order",
      id: "order-handler",
      prompt: "Order the steps a webhook handler should take.",
      steps: ["Verify the signature", "Parse and validate the body", "Check whether this event id was already processed", "Do the work and record the id together", "Respond with a status code"],
      feedback: { correct: "Yes. Cheapest and most important checks first; side effects only after.", incorrect: "Reject strangers before reading their data, and check for duplicates before doing any work." },
    },
    {
      kind: "choice",
      id: "duplicate-status",
      variant: "concept",
      prompt: "The same event id arrives a second time. What should your service respond?",
      options: [
        { id: "a", text: "200, without processing it again.", correct: true, why: "Right. The sender stops retrying, and nothing happens twice." },
        { id: "b", text: "500, so the sender knows something is odd.", correct: false, why: "A 500 makes the sender retry again and again.", misconception: "Uses error codes for duplicates, triggering retries" },
        { id: "c", text: "201, and process it again to be safe.", correct: false, why: "Processing twice is exactly what idempotency prevents." },
      ],
    },
    {
      kind: "choice",
      id: "status-codes",
      variant: "concept",
      prompt: "The body is missing the email field. Which status code fits?",
      options: [
        { id: "a", text: "400 Bad Request", correct: true, why: "Right. The sender's data is invalid; retrying the same data won't help." },
        { id: "b", text: "500 Internal Server Error", correct: false, why: "500 means your server failed, which invites retries." },
        { id: "c", text: "200 OK", correct: false, why: "That claims success, so nobody notices the lost lead." },
      ],
    },
    {
      kind: "explain",
      id: "explain-retry",
      prompt: "A webhook provider retries up to 5 times if it doesn't get a 2xx answer within 10 seconds. Your handler sends an email, which sometimes takes 15 seconds. What goes wrong, and how would you fix it?",
      lookFor: ["The provider times out and retries, so the lead is processed again", "Idempotency by event id prevents duplicate emails", "Acknowledge quickly (store the event, respond 2xx), then do slow work afterwards from a queue"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-signature",
      variant: "concept",
      prompt: "Why verify the webhook signature before parsing the body?",
      options: [
        { id: "a", text: "Requests from strangers are rejected before any of their data is processed.", correct: true, why: "Right. Least work, least exposure." },
        { id: "b", text: "Parsing is slow.", correct: false, why: "Speed isn't the reason; trust is." },
        { id: "c", text: "Signatures are inside the body.", correct: false, why: "Usually they're in a header, computed over the body." },
      ],
    },
    {
      kind: "choice",
      id: "review-idempotent",
      variant: "concept",
      prompt: "What makes an operation idempotent?",
      options: [
        { id: "a", text: "Doing it twice has the same effect as doing it once.", correct: true, why: "Right." },
        { id: "b", text: "It always returns the same status code.", correct: false, why: "It's about effects, not responses." },
        { id: "c", text: "It runs fast.", correct: false, why: "Unrelated." },
      ],
    },
  ],
  misconceptions: [
    { myth: "Each webhook arrives exactly once.", reality: "Senders retry on timeouts and errors. Design for duplicates." },
    { myth: "A secret URL is enough protection.", reality: "URLs leak into logs and tools. Verify signatures." },
  ],
  hints: ["Which checks cost least and protect most?", "What does the sender do after a 500?", "Whose fault is missing data?"],
  masteryRequirement: "Order a safe webhook handler, choose correct status codes and explain idempotency, without hints.",
};
