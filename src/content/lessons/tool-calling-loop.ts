import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "tool-calling-loop",
  title: "Tool calling and controlled loops",
  skill: "tool-calling",
  paths: ["automation"],
  path: "automation",
  minutes: 22,
  objective: "Trace a tool-use loop (model requests, code validates and runs, result returns), and add the controls a safe agent needs: validation, an allowlist, approval, a step limit, verification and logs.",
  whyItMatters:
    "An agent that books meetings is a model in a loop with tools. The model decides what to ask for; your code decides what actually happens. That division is the whole safety story of your capstone.",
  prerequisites: ["structured-outputs", "prompt-injection"],
  sections: [
    {
      heading: "The model asks; your code acts",
      body: [
        "You describe tools to the model: a name, what it does, and a schema for its inputs. When the model wants one, it stops with stop_reason \"tool_use\" and returns a tool_use block with the tool name and arguments.",
        "Your code runs the tool (checking a calendar, say) and sends back a tool_result linked by its id. The model continues, maybe requests another tool, and finally answers with stop_reason \"end_turn\".",
      ],
      code: "while (true) {\n  const res = await callModel(messages, TOOLS);\n  if (res.stop_reason !== \"tool_use\") return res;      // finished\n  if (++calls > MAX_TOOL_CALLS) return handoff(\"too many steps\");\n  const results = [];\n  for (const use of res.toolUses) {\n    results.push(await runChecked(use));               // validate, allow, maybe approve\n  }\n  messages.push(assistantTurn(res), userTurn(results));\n}",
    },
    {
      heading: "Controls that make it safe",
      body: [
        "Validate every argument against the tool's schema; send an error result back if it fails, so the model can correct itself. Only run tools on the allowlist. Pause for a person before anything that changes the world: bookings, payments, emails to new addresses.",
        "Cap the number of steps, so a confused loop stops. Verify the final answer against tool results (the booking reference must exist), and log every step.",
      ],
    },
    {
      heading: "When not to use an agent",
      body: [
        "If the steps are always the same, write them as ordinary code and use the model for one step only (classifying or drafting). Agents are for tasks where the next step genuinely depends on what was found.",
        "Simple, predictable workflows are cheaper, faster and easier to test.",
      ],
    },
  ],
  activities: [
    {
      kind: "order",
      id: "order-tool-loop",
      prompt: "Order one round of a tool-use loop.",
      steps: [
        "Your app sends the messages and the tool definitions",
        "The model replies with stop_reason \"tool_use\" and a tool_use block",
        "Your code validates the arguments and runs the tool",
        "Your app sends back a tool_result with the matching id",
        "The model continues and answers with stop_reason \"end_turn\"",
      ],
      feedback: {
        correct: "Yes. The model never runs anything itself: it asks, your code acts, and the result goes back.",
        incorrect: "The model can only request a tool. Your code runs it, then returns the result so the model can continue.",
      },
    },
    {
      kind: "choice",
      id: "bad-args",
      variant: "concept",
      prompt: "The model calls check_availability with { date: \"Thursday\", time: \"2pm\" }, but the tool needs YYYY-MM-DD and HH:MM. What should your code do?",
      options: [
        { id: "a", text: "Return a tool_result marked as an error that explains the expected format, and let the model try again.", correct: true, why: "Right. The model can usually correct itself, and nothing wrong reaches the calendar." },
        { id: "b", text: "Guess which Thursday is meant and run it.", correct: false, why: "Guessing turns a format problem into a wrong booking.", misconception: "Lets code guess at invalid model arguments" },
        { id: "c", text: "Crash with an error so a developer notices.", correct: false, why: "Errors should be handled. Return an error result, and hand off if it keeps failing." },
      ],
    },
    {
      kind: "choice",
      id: "stop-condition",
      variant: "bug",
      prompt: "What is missing from this loop?",
      code: "while (true) {\n  const res = await callModel(messages, TOOLS);\n  if (res.stop_reason === \"end_turn\") return res;\n  messages.push(...(await runTools(res)));\n}",
      options: [
        { id: "a", text: "A limit on the number of steps, so it can't loop (and spend) forever.", correct: true, why: "Right. Cap tool calls and hand off when the cap is reached." },
        { id: "b", text: "A sleep between calls.", correct: false, why: "Waiting doesn't stop a loop that never ends." },
        { id: "c", text: "Nothing: models always reach end_turn eventually.", correct: false, why: "Usually, not always. A confused loop can repeat the same call.", misconception: "Trusts the model to stop" },
      ],
    },
    {
      kind: "explain",
      id: "explain-approval",
      prompt: "List the tools your sales agent would need, and mark which ones should wait for a person's approval. Explain your rule for deciding.",
      lookFor: ["Lookups (check availability, read approved knowledge) can run automatically", "Bookings, sending to new addresses, refunds or anything costly need approval", "Rule: anything that changes the world or is hard to undo waits for a person", "Everything logged"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-verify",
      variant: "concept",
      prompt: "The model's final reply says \"You're booked, reference MTG-2001\". What should your code do before sending it?",
      options: [
        { id: "a", text: "Check that MTG-2001 matches a booking the tool actually created.", correct: true, why: "Right. Verify claims against tool results before anything goes out." },
        { id: "b", text: "Send it: the model saw the tool result.", correct: false, why: "It can still misquote or invent. Verification is cheap.", misconception: "Trusts model summaries of tool results" },
        { id: "c", text: "Ask the model to double-check itself.", correct: false, why: "A second model answer is not proof. Compare with the real data." },
      ],
    },
    {
      kind: "choice",
      id: "review-no-agent",
      variant: "concept",
      prompt: "Every lead goes through the same steps: validate, classify, reply or hand off. Do you need an agent loop?",
      options: [
        { id: "a", text: "No: write the fixed steps in code and use the model just for classifying and drafting.", correct: true, why: "Right. Predictable steps belong in code: cheaper, faster and testable." },
        { id: "b", text: "Yes: agents are always more capable.", correct: false, why: "More freedom means more ways to go wrong. Use it only when the steps vary." },
        { id: "c", text: "Yes, but with no tools.", correct: false, why: "Without tools there's no loop. A single call does the job." },
      ],
    },
  ],
  misconceptions: [
    { myth: "With tool calling, the model runs the tools.", reality: "The model only requests. Your code validates, decides and runs." },
    { myth: "Agents are the advanced way to build every AI feature.", reality: "Most features are better as fixed code plus one model call." },
  ],
  hints: ["Who actually executes the tool?", "What stops a loop that keeps asking for tools?", "Which actions are hard to undo?"],
  masteryRequirement: "Trace a tool-use loop and add validation, a step limit, approval and verification where needed, without hints.",
};
