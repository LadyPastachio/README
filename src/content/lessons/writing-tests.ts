import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "writing-tests",
  title: "Writing tests that catch bugs",
  skill: "testing",
  paths: ["finance", "chess", "automation"],
  minutes: 20,
  objective: "Write small automated tests (arrange, act, assert), choose cases that include edges, and explain how a test proves itself by failing on broken code.",
  whyItMatters:
    "Budgets, chess rules and lead workflows all have logic where a small mistake is costly and easy to miss. Tests let you change code with confidence, because the computer re-checks everything in a second.",
  prerequisites: ["functions"],
  sections: [
    {
      heading: "A test is code that checks code",
      body: [
        "A test calls your function with a known input and compares the result with what you expect. If they differ, the test fails and tells you how. Tools like Vitest (which this app uses) run hundreds of these in seconds.",
        "Most tests follow three steps: arrange (set up the input), act (call the function), assert (check the result).",
      ],
      code: "test(\"remaining budget subtracts spending\", () => {\n  const budget = { limit: 20000, spent: 12550 };   // arrange (cents)\n  const left = remaining(budget);                  // act\n  expect(left).toBe(7450);                         // assert\n});",
    },
    {
      heading: "Pick cases that could break",
      body: [
        "One typical case proves little. Add edges: zero, empty lists, exactly on a limit, one over, negative numbers, the first and last square of a board.",
        "Bugs cluster at boundaries. \"Over budget\" with > instead of >= is wrong only when spending equals the limit, so that is the case to test.",
      ],
    },
    {
      heading: "A test must be able to fail",
      body: [
        "A test that passes no matter what protects nothing. Check it by breaking the code on purpose (change >= to >, or return 0) and watching the test fail. This is the idea behind mutation testing.",
        "Some Code Lab exercises do exactly that: they run your tests against deliberately broken versions and count how many you catch.",
      ],
    },
  ],
  activities: [
    {
      kind: "order",
      id: "order-aaa",
      prompt: "Put the parts of a test in order.",
      steps: ["Name the behavior being tested", "Arrange: prepare the input data", "Act: call the function", "Assert: compare the result with the expected value"],
      feedback: { correct: "Yes: name, arrange, act, assert.", incorrect: "You need data before calling the function, and a result before checking it." },
    },
    {
      kind: "choice",
      id: "best-edge-case",
      variant: "concept",
      prompt: "isOverBudget(spent, limit) should be true when spending reaches the limit. Which single test case is most likely to catch a bug?",
      options: [
        { id: "a", text: "spent 10000, limit 10000 → true", correct: true, why: "Right. Exactly on the boundary is where > and >= differ." },
        { id: "b", text: "spent 500, limit 10000 → false", correct: false, why: "Almost any implementation gets this right, so it catches little." },
        { id: "c", text: "spent 99999, limit 10000 → true", correct: false, why: "Far over the limit passes with both > and >=.", misconception: "Tests only obvious cases" },
      ],
    },
    {
      kind: "choice",
      id: "useless-test",
      variant: "bug",
      prompt: "What's wrong with this test?",
      code: "test(\"total adds amounts\", () => {\n  const items = [500, 250];\n  const result = total(items);\n  expect(result).toBe(total(items));\n});",
      options: [
        { id: "a", text: "It compares the function with itself, so it passes even if total is wrong.", correct: true, why: "Right. The expected value must come from you (750), not from the code under test." },
        { id: "b", text: "It needs more items.", correct: false, why: "More items wouldn't help while the expectation is computed by the same function." },
        { id: "c", text: "toBe should be toEqual.", correct: false, why: "For numbers, toBe is correct. The problem is the expected value." },
      ],
    },
    {
      kind: "fill",
      id: "fill-assert",
      prompt: "Complete the assertion: on an otherwise empty board, a knight on b1 can reach exactly three squares (a3, c3 and d2).",
      code: "expect(knightMoves(\"b1\").length).___(3);",
      accepted: ["toBe"],
      explanation: "toBe compares a number exactly. For arrays or objects, toEqual compares contents.",
      commonWrong: [{ answer: "equals", why: "The matcher in Jest and Vitest is toBe (or toEqual for objects)." }],
    },
    {
      kind: "explain",
      id: "explain-mutant",
      prompt: "Describe how you would check that your tests for a budget function would actually notice a bug.",
      lookFor: ["Break the function on purpose (change an operator, return a constant)", "Run the tests: at least one should fail", "If none fail, add a test for the case that was missed", "Then undo the deliberate bug"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-boundary",
      variant: "concept",
      prompt: "A chess function returns the squares a rook can reach. Which test adds the most value beyond a rook in the middle of an empty board?",
      options: [
        { id: "a", text: "A rook in a corner, blocked by its own piece next to it.", correct: true, why: "Right. Edges and blocking are where move logic breaks." },
        { id: "b", text: "A second rook in the middle of an empty board.", correct: false, why: "Same situation, same code path." },
        { id: "c", text: "Checking the function exists.", correct: false, why: "That would fail anyway the moment you call it." },
      ],
    },
    {
      kind: "choice",
      id: "review-fail-first",
      variant: "concept",
      prompt: "Why do developers like to see a new test fail before writing the code that makes it pass?",
      options: [
        { id: "a", text: "It proves the test can detect the missing behavior.", correct: true, why: "Right. A test that has never failed might be testing nothing." },
        { id: "b", text: "Failing tests run faster.", correct: false, why: "Speed is unrelated." },
        { id: "c", text: "It is required by JavaScript.", correct: false, why: "It's a habit, not a language rule." },
      ],
    },
  ],
  misconceptions: [
    { myth: "If all tests pass, the code is correct.", reality: "Only for the cases you tested. Good tests cover the edges where bugs hide." },
    { myth: "Writing tests slows you down.", reality: "It's slower on day one and faster from then on, because changes stop breaking things silently." },
  ],
  hints: ["Where do > and >= give different answers?", "Where does the expected value come from?", "What would happen if the function always returned the same thing?"],
  masteryRequirement: "Structure a test, choose boundary cases, and spot a test that can't fail, without hints.",
};
