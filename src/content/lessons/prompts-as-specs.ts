import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "prompts-as-specs",
  title: "Prompts are specifications",
  skill: "prompt-spec",
  paths: ["web", "finance", "automation"],
  minutes: 18,
  objective: "Write a prompt with a clear task, context, constraints, output format, an example and success criteria, and explain why each part reduces guessing.",
  whyItMatters:
    "Every AI feature you build starts with a prompt your code sends thousands of times. A vague prompt gives a different kind of answer each time; a precise one behaves like a specification you can test.",
  prerequisites: ["what-a-model-does", "describing-requirements"],
  sections: [
    {
      heading: "Vague in, unpredictable out",
      body: [
        "\"Write a nice reply to this customer\" leaves the model to guess the tone, length, facts and format. Each guess can differ from the last, so the feature behaves differently every time.",
        "A model fills every gap you leave with what is typical. When typical is not what you want, say so.",
      ],
    },
    {
      heading: "The parts of a good prompt",
      body: [
        "Task: what to do, as a verb. Context: who it is for and the situation. Constraints: length, tone, what it must never do. Format: the exact shape you want back. Example: one short sample of a good answer. Criteria: how a good answer will be judged. Sources: which facts to use, and what to do when the answer is not there.",
        "These are the same parts as the requirements you write for people. A prompt is a requirement document that a model reads.",
      ],
      code: "Reply to the enquiry below for a small web studio.\nAudience: a potential customer who asked about price.\nUse only the approved facts. If the answer is not there, say a person will follow up.\nNever offer discounts.\nFormat: 2 short paragraphs, under 80 words.\nA good reply states the audit price and invites them to book.\n\n<facts>Audits start at $490.</facts>\n<enquiry>{message}</enquiry>",
    },
    {
      heading: "Keep instructions and data apart",
      body: [
        "Put the text you are working on (an email, a document) inside clear markers such as <enquiry> tags, separate from your instructions. The model can then tell what to do from what to work on.",
        "This also makes your prompt a template: your code fills in {message} each time, and the instructions stay identical.",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "pick-better-prompt",
      variant: "concept",
      prompt: "Your finance tracker should suggest a category for each transaction. Which prompt will give the most consistent results?",
      options: [
        { id: "a", text: "Categorize this transaction: {description}", correct: false, why: "No list of allowed categories and no format, so you might get \"Food\", \"Groceries\" or a whole sentence.", misconception: "Thinks a short prompt is a clear prompt" },
        { id: "b", text: "Pick exactly one category from: groceries, rent, transport, eating out, other. Reply with the category only, in lowercase. If unsure, reply other. Transaction: <t>{description}</t>", correct: true, why: "Right. A fixed list, an exact format and a rule for uncertainty make every answer checkable by code." },
        { id: "c", text: "You are a world-class financial expert. Think carefully and categorize this transaction as accurately as possible: {description}", correct: false, why: "Flattery and \"accurately\" add no information. The model still has to guess the categories and the format.", misconception: "Thinks role-play replaces a specification" },
      ],
    },
    {
      kind: "order",
      id: "order-prompt-parts",
      prompt: "Put the parts of this prompt into a sensible order, from first to last.",
      steps: [
        "The task: \"Summarize the customer's message\"",
        "The context: \"for a busy sales manager deciding what to do next\"",
        "The constraints and format: \"in one sentence, under 25 words\"",
        "What a good answer contains: \"the request and any deadline\"",
        "The data, inside markers: <message>…</message>",
      ],
      feedback: {
        correct: "Yes. Instructions first, data last and clearly marked, so the model knows what to do before it reads what to work on.",
        incorrect: "Lead with what to do and for whom, then the rules, then the data inside its markers at the end.",
      },
    },
    {
      kind: "choice",
      id: "spot-missing-part",
      variant: "bug",
      prompt: "This prompt powers your lead workflow. It sometimes tells people prices the business never set. What is missing?",
      code: "Reply helpfully to this lead in a friendly tone,\nin under 100 words.\n\n<lead>{message}</lead>",
      options: [
        { id: "a", text: "A source rule: which facts to use, and what to do when the answer is not there.", correct: true, why: "Right. Without approved facts and a fallback, the model fills the gap with plausible prices." },
        { id: "b", text: "A higher word limit, so it can explain more.", correct: false, why: "More words would give it more room to invent, not less." },
        { id: "c", text: "Asking it to be more professional.", correct: false, why: "Tone does not change where facts come from.", misconception: "Thinks tone instructions prevent invented facts" },
      ],
    },
    {
      kind: "explain",
      id: "explain-rewrite",
      prompt: "Rewrite \"Make my profile page look better\" as a prompt for a model that suggests CSS changes. Then say which part you think matters most and why.",
      lookFor: ["A task as a verb (suggest CSS changes)", "Context: what the page is and who visits it", "Constraints such as working at 375px or keeping colors", "A format: a short list of changes, each with the CSS", "A criterion you could check"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-why-format",
      variant: "concept",
      prompt: "Why ask a model to \"reply with the category only, in lowercase\" when your code reads the answer?",
      options: [
        { id: "a", text: "So code can compare the answer with the allowed list without guessing.", correct: true, why: "Right. A fixed format turns free text into something code can check." },
        { id: "b", text: "Because lowercase uses fewer tokens.", correct: false, why: "The difference is negligible. The point is predictability." },
        { id: "c", text: "Models cannot write capital letters reliably.", correct: false, why: "They can. You are removing variation your code would have to handle." },
      ],
    },
    {
      kind: "fill",
      id: "review-fallback",
      prompt: "Complete the source rule so the model hands off instead of inventing.",
      code: "Use only the facts below. If the answer is not there, ___.",
      accepted: ["say a person will follow up", "say so", "say you don't know", "say a person will reply"],
      caseSensitive: false,
      explanation: "A fallback gives the model a safe thing to do when the facts run out, instead of filling the gap with something plausible.",
    },
  ],
  misconceptions: [
    { myth: "A clever role (\"you are a world-class expert\") makes answers accurate.", reality: "Roles can set tone, but accuracy comes from facts, constraints and a checkable format." },
    { myth: "Shorter prompts are clearer.", reality: "Short prompts leave more to guess. Clear prompts are as long as the specification needs." },
  ],
  hints: ["Ask: could two people read this and expect different answers?", "Which facts must the answer use, and what if they are missing?", "Would your code be able to check the answer automatically?"],
  masteryRequirement: "Identify missing parts in a prompt and write one with task, context, constraints, format and a source rule, without hints.",
};
