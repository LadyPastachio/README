import type { Alternatives } from "../schema";

/** Alternative explanations for the Phase 7 lessons. Merged into ALTERNATIVES in alternatives.ts. */
export const PHASE7_ALTERNATIVES: Record<string, Alternatives> = {
  "writing-tests": {
    simpler: [
      "A test runs your function with an input you chose and checks the answer you expected.",
      "Test the edges: zero, empty, exactly on a limit.",
      "Break the code on purpose once: a good test fails.",
    ],
    analogy:
      "A smoke alarm you never test might have a dead battery. You press the test button so you know it will go off when it matters. Breaking your code on purpose is pressing that button.",
    steps: [
      "Pick a behavior: \"over budget when spending reaches the limit\".",
      "Arrange: limit 10000, spent 10000.",
      "Act: call isOverBudget(10000, 10000).",
      "Assert: expect true.",
      "Change >= to > in the function: the test should now fail. Change it back.",
    ],
    example: {
      intro: "A tiny test runner, like the one in the Code Lab exercises:",
      code: "function expect(actual) {\n  return {\n    toBe(expected) {\n      if (actual !== expected) throw new Error(\"expected \" + expected + \", got \" + actual);\n    },\n  };\n}\n\nexpect(remaining({ limit: 20000, spent: 12550 })).toBe(7450);",
      explanation: "Real tools like Vitest add nicer messages and run many tests, but the idea is exactly this.",
    },
    challenge: {
      prompt: "Your lead workflow's processLead decides reply or handoff. Write the names of five tests you would add, including at least two edge cases.",
      lookFor: ["A price question gets the pricing reply", "An unknown question is handed off", "Invalid JSON is rejected without crashing", "An empty message is handled", "Instructions inside the message don't change the reply"],
    },
  },
  "dom-events": {
    simpler: [
      "JavaScript can find any element on the page and change it.",
      "addEventListener runs your function when something happens, like a click.",
      "Use real <button> elements so keyboards and screen readers work too.",
    ],
    analogy:
      "A doorbell: you install it once (addEventListener), and every time someone presses it (the event), it rings (your handler runs). A drawing of a doorbell on the wall (a clickable div) looks right, but nobody can press it without help.",
    steps: [
      "Find the button: const button = document.querySelector(\"#menu-button\").",
      "Listen: button.addEventListener(\"click\", toggle).",
      "Someone clicks: toggle runs.",
      "Read the current state from aria-expanded, flip it.",
      "Show or hide the menu to match.",
    ],
    example: {
      intro: "Event delegation: one listener for a whole list.",
      code: "document.querySelector(\"#projects\").addEventListener(\"click\", (event) => {\n  const card = event.target.closest(\".project\");\n  if (!card) return;\n  showDetails(card.dataset.id);\n});",
      explanation: "Works for cards added later too, because the listener is on the parent.",
    },
    challenge: {
      prompt: "Your finance tracker needs a \"Show only this month\" toggle. Describe the element you'd use, the event, and what the handler changes.",
      lookFor: ["A real checkbox or a button with aria-pressed", "Listen for change (checkbox) or click (button)", "Update one piece of state, then redraw the list from it", "Keyboard works without extra code"],
    },
  },
  "accessible-forms": {
    simpler: [
      "Every field needs a visible label linked to it.",
      "Error messages say what's wrong and how to fix it, next to the field.",
      "Tell screen reader users what happened after submitting.",
    ],
    analogy:
      "A paper form where the boxes have no headings, and mistakes are marked with a red pen only you can see. Labels are the headings; linked error messages are notes written next to the box, in words.",
    steps: [
      "Add <label for=\"email\">Email</label> and give the input id=\"email\".",
      "On submit, prevent the default and check each field.",
      "For a bad email, show \"Enter an email like name@example.com\" in <p id=\"email-error\">.",
      "Set aria-invalid=\"true\" and aria-describedby=\"email-error\" on the input.",
      "Write a summary in a role=\"status\" region and focus the first invalid field.",
    ],
    example: {
      intro: "Marking a field invalid and linking its message:",
      code: "function showError(input, message) {\n  const msg = document.getElementById(input.id + \"-error\");\n  msg.textContent = message;\n  input.setAttribute(\"aria-invalid\", \"true\");\n  input.setAttribute(\"aria-describedby\", msg.id);\n}",
      explanation: "Screen readers now read the label, then the message, when the field gets focus.",
    },
    compare: {
      title: "Placeholder versus label",
      a: { label: "Placeholder only", code: "<input placeholder=\"Email\">" },
      b: { label: "Real label", code: "<label for=\"email\">Email</label>\n<input id=\"email\" type=\"email\">" },
      points: ["The placeholder disappears as you type", "The label stays visible and is read aloud", "Clicking the label focuses the field"],
    },
    challenge: {
      prompt: "Design the \"Add transaction\" form for your finance tracker so it works by keyboard and screen reader. List the fields, labels, input types and one error message.",
      lookFor: ["Labelled fields: description, amount, date, category", "Appropriate types: text, number or text with inputmode=\"decimal\", date, select", "An error like \"Enter an amount, like 12.50\" linked with aria-describedby", "A status message after adding"],
    },
  },
  "chess-move-rules": {
    simpler: [
      "A move function looks at one piece and returns the squares it can reach.",
      "Knights jump; rooks, bishops and queens slide until something blocks them.",
      "Drop squares off the board or holding your own pieces.",
    ],
    analogy:
      "A rook is like a person walking down a corridor: they keep going until they reach a wall or a person. If it's a friend, they stop before them; if it's an opponent, they can tag them, but they can't walk through.",
    steps: [
      "Rook on d4 (row 4, col 3). Pick a direction: up, [-1, 0].",
      "Step to d5: empty, add it. Step to d6: empty, add it.",
      "Step to d7: black pawn, an enemy. Add it (capture), then stop.",
      "Repeat for down, left and right.",
      "Return all the collected squares.",
    ],
    example: {
      intro: "Knight moves in a few lines:",
      code: "const JUMPS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];\nfunction knightMoves(board, row, col) {\n  const color = board[row][col][0];\n  return JUMPS.map(([dr, dc]) => [row + dr, col + dc])\n    .filter(([r, c]) => r >= 0 && r < 8 && c >= 0 && c < 8)\n    .filter(([r, c]) => !board[r][c] || board[r][c][0] !== color);\n}",
      explanation: "Map to candidate squares, filter off-board ones, filter squares with your own pieces.",
    },
    challenge: {
      prompt: "Describe how you'd write bishopMoves and queenMoves by reusing your rook logic.",
      lookFor: ["Extract a slide(board, row, col, directions) helper", "Rook: the 4 straight directions", "Bishop: the 4 diagonals", "Queen: all 8 directions"],
    },
  },
  "budget-rules": {
    simpler: [
      "Write each budget rule as a small function with inputs and an output.",
      "Decide the tricky cases first: refunds, exactly on budget, empty months.",
      "Turn each decision into a test.",
    ],
    analogy:
      "House rules written on the fridge (\"refunds count against spending\", \"transfers don't count\"). Tests are someone checking every month that the rules are actually being followed.",
    steps: [
      "Rule: food spending this month, in cents.",
      "Decide: refunds reduce it; transfers don't count.",
      "Tests: 4000 + (-1500) = 2500; empty month = 0; a transfer is ignored.",
      "Write spentIn with filter and reduce, keeping signs.",
      "Run the tests; all green. Add status() the same way.",
    ],
    example: {
      intro: "spentIn with the decisions built in:",
      code: "function spentIn(transactions, category) {\n  return transactions\n    .filter((t) => t.category === category && !t.transfer)\n    .reduce((sum, t) => sum + t.cents, 0);\n}",
      explanation: "Refunds subtract because their cents are negative; transfers are skipped; an empty list gives 0.",
    },
    challenge: {
      prompt: "Add a \"rollover\" rule: unspent budget carries into next month, up to a cap. Write the decisions and three test cases before any code.",
      lookFor: ["Decide what happens when overspent (negative rollover or zero)", "A cap on how much rolls over", "Tests: underspent, overspent, rollover above the cap"],
    },
  },
  "sql-basics": {
    simpler: [
      "SELECT picks columns, FROM picks the table, WHERE picks rows.",
      "GROUP BY makes one row per group, with COUNT or SUM.",
      "JOIN combines rows from two tables that refer to each other.",
    ],
    analogy:
      "Asking a librarian: \"From the fiction shelf (FROM), only books after 2020 (WHERE), show me title and author (SELECT), newest first (ORDER BY).\" You say what you want; they know how to find it.",
    steps: [
      "Start with the table: FROM transactions.",
      "Keep this month: WHERE month = '2026-10'.",
      "One row per category: GROUP BY category.",
      "Choose what to show: SELECT category, SUM(cents) AS total.",
      "Biggest first: ORDER BY total DESC.",
    ],
    example: {
      intro: "The same question in JavaScript and SQL:",
      code: "// JavaScript\nconst total = rows.filter((r) => r.month === \"2026-10\").reduce((s, r) => s + r.cents, 0);\n\n-- SQL\nSELECT SUM(cents) FROM transactions WHERE month = '2026-10';",
      explanation: "WHERE is filter; SUM is reduce. The database does it without loading every row into your code.",
    },
    challenge: {
      prompt: "Write (in words or SQL) the query for: leads with no follow-up scheduled yet.",
      lookFor: ["Start from leads", "Match follow-ups by lead_id", "Keep leads with no matching follow-up (LEFT JOIN … WHERE followups.id IS NULL, or NOT EXISTS)", "Explain why a plain JOIN would drop them"],
    },
  },
  "backend-basics": {
    simpler: [
      "A backend endpoint receives a request, does protected work and answers with a status code.",
      "Check who sent a webhook before using it.",
      "Remember event ids so a repeat delivery does nothing twice.",
    ],
    analogy:
      "A post room that signs for parcels. It checks the sender's seal (signature), opens and inspects the parcel (validation), and keeps a list of tracking numbers already received, so a duplicate delivery is signed for but not unpacked again (idempotency).",
    steps: [
      "Request arrives with a signature header and a JSON body.",
      "Recompute the signature with the secret: mismatch → 401.",
      "Validate the body: invalid → 400.",
      "Event id evt_42 already seen → 200 \"duplicate ignored\".",
      "New: store the lead and the id together → 201.",
    ],
    example: {
      intro: "The database can enforce idempotency for you:",
      code: "CREATE TABLE processed_events (\n  event_id TEXT PRIMARY KEY,\n  processed_at TEXT NOT NULL\n);\n-- Inserting the same event_id twice fails, so the second delivery is detected.",
      explanation: "A unique key makes duplicates impossible even if two copies arrive at the same moment.",
    },
    challenge: {
      prompt: "Your booking tool sends \"meeting.cancelled\" webhooks. Describe how your service should handle one that arrives twice, and one that arrives for a meeting it never saw.",
      lookFor: ["Duplicate: recognized by event id, 200, no second action", "Unknown meeting: don't crash; log it and respond (200 or 404 by agreement)", "Signature checked first in both cases"],
    },
  },
  "secrets-and-least-privilege": {
    simpler: [
      "Keep keys and passwords on the server, in environment variables, never in code or logs.",
      "Give each part only the access it needs.",
      "In a white-label system, every query is limited to the current business.",
    ],
    analogy:
      "An office building: each employee's key card opens only the rooms they need (least privilege). Master keys stay in a safe, not taped under a desk (secrets). Tenants on different floors can't open each other's doors, however the card is waved (isolation).",
    steps: [
      "Put the API key in .env.local, ignored by git.",
      "The server reads process.env.API_KEY; the browser never sees it.",
      "The reporting job uses a read-only database user.",
      "Every query includes WHERE tenant_id = the signed-in business's id.",
      "A test signs in as business A and tries to read business B's data: refused.",
    ],
    example: {
      intro: "Scoping by tenant in one place:",
      code: "function leadsFor(session, filters) {\n  // tenant comes from the verified session, never from the request body or URL\n  return db.query(\"SELECT * FROM leads WHERE tenant_id = ? AND status = ?\", [session.tenantId, filters.status]);\n}",
      explanation: "Callers can't forget the tenant filter, because they can't call the database directly.",
    },
    challenge: {
      prompt: "List the secrets your capstone follow-up agent will need, where each lives, and what you'd do if one leaked.",
      lookFor: ["Model API key, email or calendar credentials, webhook signing secret, database password", "All in server environment or a secret manager", "Leak: revoke and rotate, check logs for misuse"],
    },
  },
};
