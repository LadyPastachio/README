import type { LessonInput } from "../schema";

type LessonFile = Omit<LessonInput, "alternatives">;

export const lesson: LessonFile = {
  id: "secrets-and-least-privilege",
  title: "Secrets and least privilege",
  skill: "security",
  paths: ["finance", "automation"],
  path: "automation",
  minutes: 18,
  objective: "Keep secrets out of code, browsers and logs, give each part of a system only the access it needs, and keep each client's data separate in a white-label service.",
  whyItMatters:
    "Your capstone agent will hold API keys and act for several businesses. One leaked key or one query that forgets which client it's for can expose everyone. These habits prevent that.",
  prerequisites: ["backend-basics"],
  sections: [
    {
      heading: "Where secrets live",
      body: [
        "Secrets (API keys, database passwords, webhook signing keys) live in environment variables or a secret manager on the server. Never in source code, never in the browser, never in git history, never in logs.",
        "If one leaks, rotate it: create a new key, switch over, revoke the old one. Having .env files ignored by git, like this project does, prevents the most common leak.",
      ],
    },
    {
      heading: "Least privilege",
      body: [
        "Give every part only what it needs. The lead workflow can read approved knowledge and write leads; it doesn't need to delete accounts. A reporting job gets read-only database access.",
        "When something is compromised or buggy, least privilege limits the damage to what that part could do.",
      ],
    },
    {
      heading: "Tenant isolation for white-label",
      body: [
        "A white-label agent serves several businesses (tenants) from one system. Every record carries a tenant_id, and every query filters by the tenant of the current request, taken from the authenticated request, never from user input.",
        "Write tests that try to read another tenant's data and expect a refusal. Phase 8 adds accounts and runs these isolation tests for real.",
      ],
      code: "-- Every query is scoped to the caller's tenant\nSELECT * FROM leads\nWHERE tenant_id = :tenant_from_session\n  AND status = 'new';",
    },
  ],
  activities: [
    {
      kind: "choice",
      id: "leaked-key",
      variant: "concept",
      prompt: "You accidentally pushed an API key to a public repository, then deleted it in the next commit. What should you do?",
      options: [
        { id: "a", text: "Revoke the key and create a new one: it's still in the git history and may already be copied.", correct: true, why: "Right. Deleting a file doesn't erase history. Rotate." },
        { id: "b", text: "Nothing: the latest commit doesn't contain it.", correct: false, why: "Anyone can read old commits, and bots scan for keys within minutes.", misconception: "Thinks deleting a committed secret removes it" },
        { id: "c", text: "Make the repository private.", correct: false, why: "It may already have been copied. Rotate the key." },
      ],
    },
    {
      kind: "choice",
      id: "tenant-bug",
      variant: "bug",
      prompt: "What's the security problem in this endpoint?",
      code: "app.get(\"/leads\", (req, res) => {\n  const tenant = req.query.tenant;   // from the URL\n  res.json(db.leadsFor(tenant));\n});",
      options: [
        { id: "a", text: "The tenant comes from the URL, so anyone can change it and read another business's leads.", correct: true, why: "Right. Take the tenant from the authenticated session." },
        { id: "b", text: "It should use POST.", correct: false, why: "The method doesn't fix trusting user-supplied tenant ids." },
        { id: "c", text: "res.json is slow.", correct: false, why: "Unrelated." },
      ],
    },
    {
      kind: "choice",
      id: "least-privilege",
      variant: "concept",
      prompt: "A nightly job emails each business a summary of yesterday's leads. What database access should it have?",
      options: [
        { id: "a", text: "Read-only access to leads.", correct: true, why: "Right. It only reads; it should be unable to change or delete anything." },
        { id: "b", text: "The same admin access as the main app, for simplicity.", correct: false, why: "A bug or compromise in the job could then destroy data." },
        { id: "c", text: "No access; it should scrape the app's web pages.", correct: false, why: "Scraping is fragile and still needs credentials." },
      ],
    },
    {
      kind: "explain",
      id: "explain-logs",
      prompt: "Your agent logs every step. What must never appear in those logs, and how would you still make the logs useful?",
      lookFor: ["Never: API keys, passwords, tokens", "Avoid full personal data or message contents unless needed and allowed", "Log ids, actions, outcomes, timings and sizes instead", "Limit who can read logs and how long they're kept"],
    },
  ],
  review: [
    {
      kind: "choice",
      id: "review-env",
      variant: "concept",
      prompt: "Where should a webhook signing secret be stored?",
      options: [
        { id: "a", text: "In an environment variable or secret manager on the server.", correct: true, why: "Right." },
        { id: "b", text: "In a constant at the top of the server code.", correct: false, why: "It ends up in git and every copy of the code." },
        { id: "c", text: "In the browser, so the form can sign requests.", correct: false, why: "Anything in the browser is public." },
      ],
    },
    {
      kind: "choice",
      id: "review-isolation",
      variant: "concept",
      prompt: "Which test best protects a white-label system?",
      options: [
        { id: "a", text: "Signed in as business A, request business B's lead by id, and expect a refusal.", correct: true, why: "Right. Isolation must be tested directly." },
        { id: "b", text: "Check that business A can see its own leads.", correct: false, why: "Necessary, but it doesn't test the boundary." },
        { id: "c", text: "Check the page loads quickly.", correct: false, why: "Unrelated to isolation." },
      ],
    },
  ],
  misconceptions: [
    { myth: "Deleting a committed secret removes it.", reality: "It stays in history. Rotate it." },
    { myth: "Internal tools don't need limited access.", reality: "Least privilege matters most for the parts you watch least." },
  ],
  hints: ["Can anyone still see old commits?", "Who controls the URL?", "What does the job actually need to do?"],
  masteryRequirement: "Handle a leaked secret, spot tenant isolation bugs and apply least privilege, without hints.",
};
