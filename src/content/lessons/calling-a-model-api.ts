import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "calling-a-model-api",
  title: "Calling a model API",
  skill: "model-apis",
  paths: ["web", "finance", "automation"],
  minutes: 20,
  objective: "Describe what a model API request and response contain, estimate tokens and cost, handle errors and limits, and explain why the API key must stay on a server.",
  whyItMatters:
    "To put AI into your projects, your code calls a model over HTTP like any other API. Knowing the request, the costs and the failure modes is what separates a demo from a feature you can leave running.",
  prerequisites: ["what-a-model-does", "json-basics"],
  sections: [
    {
      heading: "A request is JSON",
      body: [
        "Your code sends an HTTP POST with a JSON body: which model, the most tokens it may write (max_tokens), a system prompt with your rules, and the messages so far. The response is JSON too: the generated content, why it stopped (stop_reason) and how many tokens were used.",
        "The AI Workshop shows the exact body as you edit it. Try it after this lesson.",
      ],
      code: "{\n  \"model\": \"claude-opus-5-5\",\n  \"max_tokens\": 300,\n  \"system\": \"You reply to enquiries for a small studio...\",\n  \"messages\": [\n    { \"role\": \"user\", \"content\": \"How much is an audit?\" }\n  ]\n}",
    },
    {
      heading: "Tokens, context and cost",
      body: [
        "Models read and write tokens: chunks of text, roughly 4 characters of English each. You pay per token, separately for input (everything you send) and output (what it writes). Output usually costs more per token.",
        "The context window is how many tokens fit in one request. Sending a long history every time costs more and can push early details out of view, so send only what the task needs.",
      ],
    },
    {
      heading: "Things go wrong: plan for it",
      body: [
        "Requests can fail: 429 means too many requests (slow down), 5xx means a temporary problem on the provider's side (wait and retry, with growing gaps), 401 means a bad key (retrying will not help). A response can also stop early with stop_reason \"max_tokens\": the answer is cut off.",
        "Every call takes time, often seconds. Show a loading state and never block the whole page.",
      ],
    },
    {
      heading: "Keys belong on a server",
      body: [
        "An API key is a password that spends money. Anything in browser code or browser storage can be read by anyone who opens the page. So the browser calls your own small server, and only the server holds the key and calls the model.",
        "That server can also enforce limits: a daily cap, a maximum answer length, and validation of what the browser sends. This academy's local server does exactly that.",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "where-key",
      variant: "concept",
      prompt: "Your budget app needs to call a model. Where should the API key live?",
      options: [
        { id: "a", text: "In an environment variable read by a small server; the browser calls that server.", correct: true, why: "Right. The key never reaches the browser, and the server can add limits and validation." },
        { id: "b", text: "In the JavaScript bundle, but minified so it is hard to read.", correct: false, why: "Minifying hides nothing: anyone can open developer tools and find it.", misconception: "Thinks minified or hidden code keeps secrets" },
        { id: "c", text: "In localStorage, after the user pastes it once.", correct: false, why: "Any script on the page can read localStorage, including injected ones. Privileged keys never go in browser storage." },
      ],
    },
    {
      kind: "choice",
      id: "handle-429",
      variant: "concept",
      prompt: "Your workflow gets a 429 response from the model API. What should your code do?",
      options: [
        { id: "a", text: "Wait, then retry with a growing delay, and give up after a few tries with a clear message.", correct: true, why: "Right. 429 means slow down. Backing off and capping retries avoids making it worse." },
        { id: "b", text: "Retry immediately in a loop until it works.", correct: false, why: "That sends even more requests while you are already being limited.", misconception: "Retries immediately and forever" },
        { id: "c", text: "Treat it as a bad key and stop the app.", correct: false, why: "That is 401. 429 is temporary." },
      ],
    },
    {
      kind: "fill",
      id: "fill-stop-reason",
      prompt: "A reply ends mid-sentence. Which stop_reason tells your code the answer was cut off by the token limit?",
      code: "if (response.stop_reason === \"___\") {\n  // raise the limit or ask for a shorter answer\n}",
      accepted: ["max_tokens"],
      explanation: "stop_reason \"max_tokens\" means the model hit the limit you set. \"end_turn\" means it finished naturally.",
      commonWrong: [{ answer: "end_turn", why: "end_turn means it finished on its own. A cut-off answer stops because of max_tokens." }],
    },
    {
      kind: "choice",
      id: "predict-cost",
      variant: "predict",
      prompt: "Input costs $4 per million tokens and output $20 per million. A call sends 1,000 tokens and gets 500 back. Roughly what does it cost?",
      code: "const cost = (1000 * 4 + 500 * 20) / 1_000_000;",
      options: [
        { id: "a", text: "$0.014", correct: true, why: "Right: 4,000 + 10,000 = 14,000, divided by a million is $0.014. The shorter output costs more than the input." },
        { id: "b", text: "$0.006", correct: false, why: "That prices everything at the input rate. Output tokens cost five times more here." },
        { id: "c", text: "$14", correct: false, why: "Prices are per million tokens, so divide by 1,000,000." },
      ],
    },
    {
      kind: "explain",
      id: "explain-limits",
      prompt: "Your lead workflow will call a model for every incoming message. Name two limits you would put on the server and what each protects against.",
      lookFor: ["A daily or per-minute cap on requests (protects the bill from bugs or abuse)", "A maximum answer length / max_tokens (controls cost per call)", "Validating and size-limiting what the browser sends", "Never logging message content (privacy)"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-input-output",
      variant: "concept",
      prompt: "Why does sending the whole conversation history with every request cost more over time?",
      options: [
        { id: "a", text: "Everything sent counts as input tokens on every call, so the bill grows as the history grows.", correct: true, why: "Right. Send what the task needs, not everything." },
        { id: "b", text: "The provider charges a fee per message in the history.", correct: false, why: "You pay for tokens, not messages." },
        { id: "c", text: "It doesn't: history is stored for free on the provider's side.", correct: false, why: "With a plain Messages API call, you send the history yourself each time, and it is billed as input.", misconception: "Thinks the model remembers past calls" },
      ],
    },
    {
      kind: "choice",
      id: "review-401",
      variant: "concept",
      prompt: "The server logs a 401 from the model API. What is the most useful next step?",
      options: [
        { id: "a", text: "Check the API key on the server; retrying will not help.", correct: true, why: "Right. 401 means the key was rejected." },
        { id: "b", text: "Retry with exponential backoff.", correct: false, why: "Backoff helps with 429 and 5xx, not a rejected key." },
        { id: "c", text: "Send the key from the browser instead.", correct: false, why: "That exposes the key and does not fix a wrong one." },
      ],
    },
  ],
  misconceptions: [
    { myth: "The model remembers previous calls.", reality: "Each call stands alone. Your code sends whatever history the model should see." },
    { myth: "Hiding a key in front-end code is good enough for a hobby project.", reality: "Keys in the browser get found and spent. Always proxy through a server." },
  ],
  hints: ["Which side of the connection can a visitor read?", "Look up what each status code means: 401, 429, 5xx.", "Price input and output separately, then divide by one million."],
  masteryRequirement: "Explain request contents, estimate a call's cost, choose the right reaction to common errors and keep keys server-side, without hints.",
};
