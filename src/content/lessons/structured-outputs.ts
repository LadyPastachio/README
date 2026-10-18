import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "structured-outputs",
  title: "Structured outputs you can trust",
  skill: "structured-outputs",
  paths: ["web", "finance", "automation"],
  minutes: 20,
  objective: "Ask a model for data in a defined shape, then parse and validate it with a schema, retry once with the error, and fall back safely when it still fails.",
  whyItMatters:
    "Your code can't act on a paragraph. To route leads, categorize transactions or generate layouts, you need data with known fields, and you need to catch the times the model gets the shape wrong.",
  prerequisites: ["calling-a-model-api"],
  sections: [
    {
      heading: "Ask for a shape",
      body: [
        "Describe the exact JSON you want: field names, allowed values and limits. Many APIs can also be given a JSON schema so the model is constrained to it.",
        "Even then, treat the result as untrusted input, exactly like a form submission. Your code still checks it.",
      ],
      code: "{\n  \"intent\": \"pricing\" | \"hours\" | \"booking\" | \"other\",\n  \"urgency\": \"low\" | \"normal\" | \"high\",\n  \"summary\": \"string, at most 140 characters\",\n  \"needsHuman\": true | false\n}",
    },
    {
      heading: "Parse, then validate",
      body: [
        "Step one: JSON.parse inside try/catch, because the text may not be JSON at all (wrapped in Markdown fences, cut off, or chatty). Step two: validate the parsed value against a schema (this app uses Zod), so a missing field or an unknown value is caught before it reaches the rest of your code.",
        "Rejecting unknown fields (strict mode) also stops injected data from riding along.",
      ],
      code: "const LeadTriage = z.object({\n  intent: z.enum([\"pricing\", \"hours\", \"booking\", \"other\"]),\n  urgency: z.enum([\"low\", \"normal\", \"high\"]),\n  summary: z.string().max(140),\n  needsHuman: z.boolean(),\n}).strict();\n\nconst result = LeadTriage.safeParse(data);\nif (!result.success) { /* retry or hand off */ }",
    },
    {
      heading: "Retry once, then fall back",
      body: [
        "When validation fails, ask again once, including the error (\"needsHuman is missing\"). If it still fails, do something safe: send the lead to a person. Never let a bad answer crash the workflow or slip through.",
        "Keep the cases that failed. They become your evaluation set (a later lesson).",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "why-validate",
      variant: "concept",
      prompt: "You asked the model for JSON with four fields and it usually complies. Why validate every response anyway?",
      options: [
        { id: "a", text: "\"Usually\" fails at scale: a missing or wrong field would silently break the next step.", correct: true, why: "Right. At a thousand leads a day, a one-percent failure rate is ten broken leads a day." },
        { id: "b", text: "Validation makes the model more accurate next time.", correct: false, why: "Validation doesn't change the model. It protects your code from its mistakes." },
        { id: "c", text: "You don't need to: if it parses as JSON, it's correct.", correct: false, why: "Valid JSON can still have missing fields or values your code doesn't expect.", misconception: "Thinks valid JSON means valid data" },
      ],
    },
    {
      kind: "choice",
      id: "predict-parse",
      variant: "predict",
      prompt: "The model returned this text. What happens?",
      code: "const text = \"```json\\n{\\\"intent\\\": \\\"hours\\\"}\\n```\";\nconst data = JSON.parse(text);",
      options: [
        { id: "a", text: "JSON.parse throws a SyntaxError, because of the backticks.", correct: true, why: "Right. Code fences aren't JSON. Strip them (or extract from the first { to the last }) before parsing, inside try/catch." },
        { id: "b", text: "data is { intent: \"hours\" }.", correct: false, why: "JSON.parse doesn't skip Markdown. The first character, a backtick, is invalid.", misconception: "Thinks JSON.parse ignores surrounding text" },
        { id: "c", text: "data is the string with the backticks.", correct: false, why: "Parsing either succeeds with a value or throws. It doesn't return the input unchanged." },
      ],
    },
    {
      kind: "order",
      id: "order-pipeline",
      prompt: "Order the steps for handling a model's structured answer safely.",
      steps: [
        "Clean the text (remove code fences, extract the JSON)",
        "Parse it inside try/catch",
        "Validate the value against the schema",
        "If it fails, retry once with the error message",
        "If it still fails, hand the lead to a person",
      ],
      feedback: {
        correct: "Yes. Each step catches a different failure, and the last one guarantees nothing crashes or slips through.",
        incorrect: "You can't validate what you haven't parsed, and the fallback comes last, after the retry.",
      },
    },
    {
      kind: "explain",
      id: "explain-finance-shape",
      prompt: "Design the JSON shape for your finance tracker's AI category suggestion. List the fields, their allowed values, and what your code does if the answer fails validation.",
      lookFor: ["A category field limited to your real categories", "Possibly a confidence or reason field with limits", "Never an amount field the model could change", "On failure: leave it uncategorized for you to choose, never guess"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-strict",
      variant: "concept",
      prompt: "A lead's message tricked the model into adding \"discount\": \"90%\" to its JSON. Which check stops that field reaching your code?",
      options: [
        { id: "a", text: "A strict schema that rejects unknown fields.", correct: true, why: "Right. Strict mode turns an unexpected field into a validation failure." },
        { id: "b", text: "JSON.parse.", correct: false, why: "The JSON is valid. Parsing alone accepts any fields." },
        { id: "c", text: "A longer system prompt.", correct: false, why: "Prompts reduce the chance; only code checks guarantee it." },
      ],
    },
    {
      kind: "choice",
      id: "review-fallback",
      variant: "concept",
      prompt: "Validation fails twice for one lead. What is the safest outcome?",
      options: [
        { id: "a", text: "Hand the lead to a person, and log the failure.", correct: true, why: "Right. Safe, visible, and the failed case can join your test set." },
        { id: "b", text: "Use the second answer anyway, since it's probably close.", correct: false, why: "Data that failed validation can break later steps or act on wrong information.", misconception: "Accepts invalid output after retries" },
        { id: "c", text: "Retry until it works.", correct: false, why: "Unlimited retries cost money and may never succeed." },
      ],
    },
  ],
  misconceptions: [
    { myth: "If you ask for JSON, you get JSON.", reality: "Usually. Code fences, extra text, cut-off answers and wrong values all happen. Parse and validate every time." },
    { myth: "A validation failure means the feature is broken.", reality: "It means the safety net worked. Retry once, then fall back." },
  ],
  hints: ["What does JSON.parse do with a backtick?", "Parsing checks syntax; what checks the fields?", "What should happen when everything fails?"],
  masteryRequirement: "Order a safe parse–validate–retry–fallback pipeline and pick the check that catches each failure, without hints.",
};
