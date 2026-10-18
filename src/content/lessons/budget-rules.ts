import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "budget-rules",
  title: "Budget rules you can trust",
  skill: "testing",
  paths: ["finance"],
  path: "finance",
  minutes: 20,
  objective: "Turn budget rules into small functions with clear inputs and outputs, decide the edge cases (exactly on budget, refunds, empty months) and pin them down with tests.",
  whyItMatters:
    "A budget tool is only useful if its numbers are right every time. Writing the rules as tested functions means a later change can't quietly make \"under budget\" lie to you.",
  prerequisites: ["money-math", "filter-map-reduce", "writing-tests"],
  sections: [
    {
      heading: "Rules as functions",
      body: [
        "Each rule becomes a function: spentIn(transactions, category, month), remaining(budget, spent), status(budget, spent) returning \"under\", \"at\" or \"over\". Amounts stay in cents.",
        "Functions that only take inputs and return outputs can be tested without any page, form or storage.",
      ],
      code: "function status(limitCents, spentCents) {\n  if (spentCents > limitCents) return \"over\";\n  if (spentCents === limitCents) return \"at\";\n  return \"under\";\n}",
    },
    {
      heading: "Decide the edge cases first",
      body: [
        "What counts as spending? A refund is a negative amount in the same category: it should reduce spending. A transfer between your own accounts is not spending at all.",
        "Write these decisions down as tests before coding. Each test is a sentence about how your budget behaves.",
      ],
      code: "test(\"a refund reduces spending\", () => {\n  const t = [{ category: \"food\", cents: 4000 }, { category: \"food\", cents: -1500 }];\n  expect(spentIn(t, \"food\")).toBe(2500);\n});",
    },
    {
      heading: "Tests as a safety net for changes",
      body: [
        "Later you'll add monthly filters, rollovers and charts. Every change reruns the tests. If \"exactly on budget\" stops showing \"at\", you'll know before anyone relies on the number.",
      ],
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "predict-status",
      variant: "predict",
      prompt: "What does this return?",
      code: "status(20000, 20000);",
      options: [
        { id: "a", text: "\"at\"", correct: true, why: "Right. Spending equals the limit, so neither \"over\" nor \"under\"." },
        { id: "b", text: "\"over\"", correct: false, why: "The first check is strictly greater than; 20000 > 20000 is false." },
        { id: "c", text: "\"under\"", correct: false, why: "The equality check comes before the fallback." },
      ],
    },
    {
      kind: "choice",
      id: "refund-bug",
      variant: "bug",
      prompt: "A $15 refund makes food spending go up. Why?",
      code: "const spent = t\n  .filter((x) => x.category === \"food\")\n  .reduce((sum, x) => sum + Math.abs(x.cents), 0);",
      options: [
        { id: "a", text: "Math.abs turns the negative refund into a positive amount.", correct: true, why: "Right. Keep the sign so refunds subtract." },
        { id: "b", text: "reduce should start at 1.", correct: false, why: "Sums start at 0." },
        { id: "c", text: "filter removes refunds.", correct: false, why: "The refund has category food, so it's kept." },
      ],
    },
    {
      kind: "order",
      id: "order-tdd",
      prompt: "Order these steps for adding a new budget rule safely.",
      steps: ["Decide the rule and its edge cases in plain words", "Write tests for those cases", "Run them and see them fail", "Write the function until the tests pass", "Rerun all tests to check nothing else broke"],
      feedback: { correct: "Yes. Decide, test, fail, build, recheck.", incorrect: "Tests come from the decisions, and you need failing tests before writing the code that fixes them." },
    },
    {
      kind: "explain",
      id: "explain-transfers",
      prompt: "Should moving $500 from checking to savings count as spending? Decide, explain why, and write the test name you'd use.",
      lookFor: ["No: it's money moving between your own accounts, not spent", "It needs a category or flag (transfer) so code can exclude it", "A test name like \"transfers are not counted as spending\""],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-empty",
      variant: "concept",
      prompt: "What should spentIn return for a month with no transactions in that category?",
      options: [
        { id: "a", text: "0", correct: true, why: "Right. reduce with a starting value of 0 handles it, and a test should prove it." },
        { id: "b", text: "undefined", correct: false, why: "Callers would then show NaN or crash." },
        { id: "c", text: "An error", correct: false, why: "An empty month is normal, not an error." },
      ],
    },
    {
      kind: "choice",
      id: "review-why-functions",
      variant: "concept",
      prompt: "Why put budget logic in plain functions instead of inside the click handler?",
      options: [
        { id: "a", text: "Plain functions can be tested without a page, and reused by the summary, charts and alerts.", correct: true, why: "Right." },
        { id: "b", text: "Click handlers can't do arithmetic.", correct: false, why: "They can; it's just harder to test there." },
        { id: "c", text: "Functions are faster.", correct: false, why: "Speed isn't the reason." },
      ],
    },
  ],
  misconceptions: [
    { myth: "Refunds should be ignored.", reality: "They reduce spending in their category. Ignoring them overstates what you spent." },
    { myth: "Edge cases are rare, so they can wait.", reality: "\"Exactly on budget\" happens all the time with round budgets." },
  ],
  hints: ["Check the comparison operators in order.", "What does Math.abs(-1500) return?", "What does reduce return for an empty list with a start value?"],
  masteryRequirement: "Predict budget-rule results, fix sign and boundary bugs, and plan tests first, without hints.",
};
