import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "evaluating-ai",
  title: "Evaluating AI features",
  skill: "ai-evaluation",
  paths: ["finance", "automation"],
  path: "automation",
  minutes: 18,
  objective: "Build a small evaluation set of realistic cases with expected results, score a feature against it, and rerun it after every change to catch regressions.",
  whyItMatters:
    "A prompt tweak that fixes one lead can quietly break three others. Without an evaluation set you find out from customers; with one you find out in seconds.",
  prerequisites: ["structured-outputs"],
  sections: [
    {
      heading: "An eval is a test suite for a model feature",
      body: [
        "Collect realistic inputs (synthetic leads, in this academy) and write down what a correct result is for each: the intent, whether it needs a person, which facts the reply may use.",
        "Include the hard cases: typos, two questions in one, angry messages, injection attempts, and messages that should be handed off.",
      ],
    },
    {
      heading: "Score with code where you can",
      body: [
        "Many checks are exact: was the intent right? did it hand off? does the reply contain the approved price and no other numbers? Code can score these every time, for free.",
        "For qualities like tone, use a rubric with clear yes/no questions, scored by a person or, carefully, by a second model whose judgments you spot-check.",
      ],
      code: "const cases = [\n  { message: \"How much is an audit?\", expect: { intent: \"pricing\", handoff: false } },\n  { message: \"Do you design logos?\", expect: { intent: \"other\", handoff: true } },\n];\nconst passed = cases.filter((c) => matches(run(c.message), c.expect)).length;\nconsole.log(`${passed} / ${cases.length}`);",
    },
    {
      heading: "Rerun on every change",
      body: [
        "Change the prompt, the model or the code? Rerun the whole set and compare. A higher score with a new failure still deserves a look.",
        "Every real-world failure you find becomes a new case, so the same mistake can't return unnoticed.",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "why-eval",
      variant: "concept",
      prompt: "You improved the prompt and the example you were fixing now works. What should you do before shipping?",
      options: [
        { id: "a", text: "Rerun the full evaluation set to check nothing else got worse.", correct: true, why: "Right. Model changes have side effects. The eval set shows them." },
        { id: "b", text: "Ship it: the bug is fixed.", correct: false, why: "One fixed example says nothing about the other cases.", misconception: "Judges a change by one example" },
        { id: "c", text: "Try the same example five more times.", correct: false, why: "That tests consistency on one case, not the effect on others." },
      ],
    },
    {
      kind: "choice",
      id: "pick-cases",
      variant: "concept",
      prompt: "Which set of cases makes the most useful evaluation for the lead workflow?",
      options: [
        { id: "a", text: "Common questions, plus typos, mixed questions, injection attempts and ones that must be handed off.", correct: true, why: "Right. The hard and unusual cases are where failures hide." },
        { id: "b", text: "Twenty slightly different ways of asking the price.", correct: false, why: "It measures one easy behavior many times and misses the risky ones." },
        { id: "c", text: "Real customer messages copied from a client's inbox.", correct: false, why: "Never use real people's data without authorization. Synthetic cases can cover the same patterns." },
      ],
    },
    {
      kind: "fill",
      id: "fill-score",
      prompt: "Complete the line that counts passing cases.",
      code: "const passed = results.___((r) => r.ok).length;",
      accepted: ["filter"],
      explanation: "filter keeps the results where ok is true; .length counts them.",
      commonWrong: [{ answer: "map", why: "map returns one value per result, so its length is always the total." }],
    },
    {
      kind: "explain",
      id: "explain-cases",
      prompt: "Write three evaluation cases for your finance tracker's category suggestions: the input, the expected result, and why that case is worth including.",
      lookFor: ["An ordinary case (\"Tesco groceries\" → groceries)", "An ambiguous case with an expected safe result (other / leave for you)", "A tricky one: a refund, a typo, or a description with an instruction in it", "Expected results written before running"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-regression",
      variant: "concept",
      prompt: "After switching to a cheaper model, the score goes from 18/20 to 19/20, but a case that used to pass now fails. What does that tell you?",
      options: [
        { id: "a", text: "Look at the newly failing case: an overall gain can still hide a regression that matters.", correct: true, why: "Right. Compare case by case, not just the total." },
        { id: "b", text: "Nothing: the score went up.", correct: false, why: "If that case is an injection or handoff case, it may matter more than the others combined." },
        { id: "c", text: "The eval is broken.", correct: false, why: "It's doing its job by showing the change." },
      ],
    },
    {
      kind: "choice",
      id: "review-code-scoring",
      variant: "concept",
      prompt: "Which check is best scored by code rather than a person?",
      options: [
        { id: "a", text: "Whether the reply contains any price other than the approved one.", correct: true, why: "Right. It is exact and checkable, so code scores it reliably and for free." },
        { id: "b", text: "Whether the reply sounds warm.", correct: false, why: "Tone needs a rubric and judgment." },
        { id: "c", text: "Whether the customer will like it.", correct: false, why: "That isn't directly measurable by either." },
      ],
    },
  ],
  misconceptions: [
    { myth: "If it works on my examples, it works.", reality: "Your examples are the easy cases. An eval set includes the hard ones." },
    { myth: "Evaluating AI needs special tools.", reality: "A list of cases, a function and a loop go a long way." },
  ],
  hints: ["What could a change break that you didn't look at?", "Where do failures hide: easy or unusual cases?", "Which array method keeps only some items?"],
  masteryRequirement: "Choose good evaluation cases and use an evaluation to judge a change, without hints.",
};
