import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "sql-basics",
  title: "Asking a database questions with SQL",
  skill: "sql",
  paths: ["finance", "automation"],
  minutes: 22,
  objective: "Read and write SQL queries that select columns, filter rows, sort, count and total by group, and join two related tables.",
  whyItMatters:
    "Your finance tracker and lead service will both store data in a database. SQL is how you ask it questions: this month's spending by category, leads waiting for a reply, follow-ups that are overdue.",
  prerequisites: ["arrays-and-objects", "filter-map-reduce"],
  sections: [
    {
      heading: "Tables, rows and columns",
      body: [
        "A database table is like a spreadsheet with strict columns: every row in leads has an id, name, email, status and created date. Each row has a unique id, so other tables can refer to it.",
        "SQL describes what you want, not how to find it. The database works out the fastest way.",
      ],
      code: "SELECT name, email\nFROM leads\nWHERE status = 'new'\nORDER BY created_at DESC;",
    },
    {
      heading: "Counting and totals",
      body: [
        "COUNT, SUM and AVG combine rows. GROUP BY makes one result row per group: one per category, one per status.",
        "This is filter, then reduce, from JavaScript, written as one statement.",
      ],
      code: "SELECT category, SUM(cents) AS total\nFROM transactions\nWHERE month = '2026-10'\nGROUP BY category\nORDER BY total DESC;",
    },
    {
      heading: "Joining related tables",
      body: [
        "Follow-ups belong to leads: the followups table has a lead_id column holding a lead's id. JOIN combines matching rows so one query can show the lead's name next to each follow-up.",
        "Splitting data into related tables avoids repeating the same lead details on every follow-up.",
      ],
      code: "SELECT leads.name, followups.due_on\nFROM followups\nJOIN leads ON leads.id = followups.lead_id\nWHERE followups.done = 0;",
    },
  ],
  activities: [
    {
      kind: "order",
      id: "order-clauses",
      prompt: "Put these SQL clauses in the order they must be written.",
      steps: ["SELECT category, SUM(cents)", "FROM transactions", "WHERE month = '2026-10'", "GROUP BY category", "ORDER BY SUM(cents) DESC"],
      feedback: { correct: "Yes: SELECT, FROM, WHERE, GROUP BY, ORDER BY.", incorrect: "The order is fixed: SELECT, FROM, WHERE, GROUP BY, ORDER BY." },
    },
    {
      kind: "choice",
      id: "predict-count",
      variant: "predict",
      prompt: "The leads table has 3 rows with status 'new' and 2 with status 'replied'. What does this return?",
      code: "SELECT status, COUNT(*) AS n\nFROM leads\nGROUP BY status;",
      options: [
        { id: "a", text: "Two rows: new 3 and replied 2 (in some order)", correct: true, why: "Right. One row per group." },
        { id: "b", text: "One row: 5", correct: false, why: "That would be COUNT(*) without GROUP BY.", misconception: "Misreads GROUP BY as a filter" },
        { id: "c", text: "Five rows, each with n = 1", correct: false, why: "GROUP BY combines rows with the same status." },
      ],
    },
    {
      kind: "choice",
      id: "quote-bug",
      variant: "bug",
      prompt: "This query fails with \"no such column: new\". Why?",
      code: "SELECT * FROM leads WHERE status = new;",
      options: [
        { id: "a", text: "Text values need single quotes: status = 'new'.", correct: true, why: "Right. Without quotes, SQL reads new as a column name." },
        { id: "b", text: "SELECT * isn't allowed.", correct: false, why: "It is allowed, just usually better to name columns." },
        { id: "c", text: "WHERE must come before FROM.", correct: false, why: "FROM comes first." },
      ],
    },
    {
      kind: "fill",
      id: "fill-join",
      prompt: "Complete the join so each follow-up is matched with its lead.",
      code: "SELECT leads.name, followups.due_on\nFROM followups\nJOIN leads ON leads.id = ___;",
      accepted: ["followups.lead_id"],
      caseSensitive: false,
      explanation: "followups.lead_id holds the id of the lead each follow-up belongs to.",
      commonWrong: [{ answer: "followups.id", why: "That's the follow-up's own id, not the lead it belongs to." }],
    },
    {
      kind: "explain",
      id: "explain-design",
      prompt: "Your finance tracker needs accounts and transactions. Sketch the two tables (columns) and explain how they're linked.",
      lookFor: ["accounts: id, name, type", "transactions: id, account_id, date, description, cents, category", "account_id refers to accounts.id", "Amounts stored as integer cents"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-where",
      variant: "concept",
      prompt: "Which query lists leads created after 1 October, newest first?",
      options: [
        { id: "a", text: "SELECT * FROM leads WHERE created_at > '2026-10-01' ORDER BY created_at DESC;", correct: true, why: "Right. Filter with WHERE, sort with ORDER BY … DESC." },
        { id: "b", text: "SELECT * FROM leads ORDER BY created_at WHERE created_at > '2026-10-01';", correct: false, why: "WHERE must come before ORDER BY." },
        { id: "c", text: "SELECT * FROM leads WHERE created_at > 2026-10-01;", correct: false, why: "Without quotes, 2026-10-01 is arithmetic: 2015." },
      ],
    },
    {
      kind: "choice",
      id: "review-sum",
      variant: "concept",
      prompt: "Which gives total spending per category?",
      options: [
        { id: "a", text: "SELECT category, SUM(cents) FROM transactions GROUP BY category;", correct: true, why: "Right." },
        { id: "b", text: "SELECT category, cents FROM transactions ORDER BY category;", correct: false, why: "That lists rows sorted, without totals." },
        { id: "c", text: "SELECT SUM(category) FROM transactions;", correct: false, why: "You can't sum text, and there's no grouping." },
      ],
    },
  ],
  misconceptions: [
    { myth: "SQL runs top to bottom like JavaScript.", reality: "It's declarative: you describe the result and the database decides how." },
    { myth: "GROUP BY filters rows.", reality: "WHERE filters; GROUP BY combines rows into groups." },
  ],
  hints: ["The clause order is always SELECT, FROM, WHERE, GROUP BY, ORDER BY.", "Text values go in single quotes.", "Which column in followups points at a lead?"],
  masteryRequirement: "Write and read queries with filters, sorting, grouping and a join, without hints.",
};
