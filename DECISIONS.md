# Architecture decisions

Short records of decisions that shape the project. Each says what was decided, why, and how hard it would be to change. When a decision changes, add a new entry rather than editing the old one.

---

## D1. React + TypeScript + Vite

**Decision:** Build the app with React 19, TypeScript (strict mode) and Vite.

**Why:** React is the most widely used interface library, so documentation, examples and AI help are plentiful, and it's a curriculum topic in Path A. TypeScript catches mistakes before code runs and documents the shape of data. Vite starts instantly and needs little configuration.

**Alternatives considered:** Next.js (adds server rendering we don't need yet, and more concepts at once); Svelte (pleasant, but a smaller ecosystem and less aligned with the curriculum).

**Cost to reverse:** High. This is the foundation.

## D2. Plain CSS with design tokens, no CSS framework

**Decision:** Styles are ordinary CSS files. All colors, spacing, type and radii are CSS variables in `src/design/tokens.css`. Settings change attributes on `<html>` (`data-theme`, `data-accent`, `data-density`, …) and the CSS reacts.

**Why:** You're learning CSS, so the styles should be readable CSS. Tokens make dark mode, accents, density and high contrast one-place changes.

**Alternatives considered:** Tailwind (fast, but hides CSS behind class names a beginner must translate); CSS-in-JS (extra runtime and concepts).

**Cost to reverse:** Medium. Components would need restyling, but the tokens carry over.

## D3. Hash-based URLs (`#/learn`)

**Decision:** Use React Router's hash router.

**Why:** Works on any static host (GitHub Pages, a shared preview, a folder on disk) with no server configuration, because the server only ever serves `index.html`.

**Trade-off:** URLs look less clean, and in-page `#anchor` scrolling needs a small helper (`src/app/useScrollToHash.ts`).

**Cost to reverse:** Low. Switch to `createBrowserRouter` and configure the host to serve `index.html` for every path.

## D4. All saved data goes through a storage interface

**Decision:** Code never calls `localStorage` directly. It uses the `StorageAdapter` interface (`read`, `write`, `remove`, `keys`) in `src/core/persistence/storage.ts`. The browser version is wrapped so blocked or full storage reports failure instead of crashing. Tests use an in-memory version.

**Why:** Phase 8 adds accounts and server storage; swapping the adapter shouldn't mean touching every feature. It also turns "storage was blocked" into a visible state ("Not saved") instead of silent data loss.

**Next step:** Learning records (Phase 2) will likely need asynchronous storage (IndexedDB, later a server). The interface will gain async methods then. This is a planned, small migration.

**Cost to reverse:** Low.

## D5. Curriculum is data, separate from screens

**Decision:** Paths, skills, glossary terms and lessons live in `src/content/` as typed data. Screens render whatever the data contains.

**Why:** Lessons can be written, reviewed and tested without touching interface code. `src/content/content.test.ts` already checks that every skill reference exists and that prerequisites contain no cycles.

**Next step:** Phase 2 adds runtime schemas (Zod) for lessons so new or generated lessons are validated automatically, and gives each lesson its own file.

**Cost to reverse:** Medium.

## D6. Validate everything that comes from outside

**Decision:** Settings and backups are parsed with Zod schemas. Every settings field has a default, and invalid fields fall back individually. Backup imports are checked, summarized for the person, and written only after confirmation. Unknown keys are skipped, and backups from newer app versions are refused with an explanation.

**Why:** Stored data can be old, corrupted or hand-edited. The app should repair what it can and never silently overwrite progress.

**Cost to reverse:** Low, but don't.

## D7. Mastery is a status, not a percentage

**Decision:** Skills have one of five statuses: Not introduced, Practiced with support, Needs another challenge, Demonstrated independently, Retained over time. There are no completion percentages, streaks or points.

**Why:** Opening a lesson isn't learning. Statuses based on evidence (independent work, hints used, recall later) describe what you can actually do.

**Cost to reverse:** High once learning records exist, which is why it's decided now.

## D8. No server and no AI provider until they're needed

**Decision:** Phases 0–5 run entirely in the browser. A small server arrives in Phase 6 so model API keys never reach the browser. Accounts and a database arrive in Phase 8.

**Why:** Free to run, nothing to secure yet, fewer moving parts. AI features start with clearly labeled simulated responses.

## D9. Self-hosted fonts

**Decision:** Fonts (Bricolage Grotesque for headings, Instrument Sans for text, JetBrains Mono for code) are npm packages bundled with the app.

**Why:** Works offline, sends no requests to third parties, and looks the same everywhere.

**Cost to reverse:** Low.

## D10. Mastery is calculated from an event log, not stored

**Decision:** Every answer, solution reveal and explanation is saved as an event (`src/core/learning/records.ts`). Lesson status, skill status, review dates, recommendations and observations are pure functions of that log (`mastery.ts`, `schedule.ts`, `recommend.ts`, `observations.ts`).

**Why:** Every status can be traced back to the attempts behind it, which is what Learning Evidence needs. Changing a rule (for example, how many retries still count as independent) immediately applies to past records with no migration. Pure functions are easy to test: 38 tests cover these rules.

**Rules in short:** first try with no hints → independent (one retry allowed); hints or more retries → practiced with support; solution shown or unsolved → needs another challenge; a spaced review passed at least 2 days later → retained; a missed review → needs another challenge until relearned. The most recent visit to an activity is what counts, so relearning works.

**Cost to reverse:** Medium. The log format is versioned and validated per entry.

## D11. Learning records stay in browser storage for now

**Decision:** Records use the same synchronous storage adapter as settings, capped at 5,000 events (about 2 MB). This updates the note in D4: moving to IndexedDB isn't needed yet.

**Why:** Each event is small, the cap is far above a year of daily use, and staying synchronous keeps the code simpler while you're learning it. Records are re-read before each save so two open tabs don't erase each other's work.

**When to revisit:** When accounts arrive (Phase 8) or the cap gets close. The adapter interface means only the storage layer changes.

## D12. Illustrations are drawn in code

**Decision:** Project and lesson illustrations are SVG components (`src/design/illustrations/`) that use the theme's color tokens. No image files or stock art.

**Why:** They adapt to light, dark and high-contrast themes automatically, stay sharp at any size, weigh almost nothing, and each one shows the concept it illustrates (indexed cells for arrays, a fork for conditions) rather than decorating.

**Cost to reverse:** Low.

## D13. Lessons are validated at load time

**Decision:** Every lesson file is parsed with the Zod schema in `src/content/schema.ts` when the app starts. An invalid lesson throws an error naming the lesson and the problem. The test suite checks the same, plus cross-references (skills, prerequisites, review questions that differ from lesson questions).

**Why:** Content will grow in batches, sometimes drafted with AI help. Mistakes like two correct options, a fill-in with no gap, or a duplicate id should fail loudly before anyone sees a broken lesson.

## D14. Code Lab runs learner code in a sandboxed iframe

**Decision:** Learner HTML, CSS and JavaScript run in `<iframe sandbox="allow-scripts allow-modals allow-forms">` with no `allow-same-origin`, built with `srcdoc`. (`allow-forms` was added in Phase 4: without it, submit events never fire. The CSP's `form-action 'none'` still stops any form sending data, and unhandled submits are cancelled.) Inside it, a Content-Security-Policy blocks all network requests. JavaScript is parsed with acorn first: syntax errors are reported without running anything, and a guard is added to every loop so one that runs longer than a second is stopped. The page and the app talk only through `postMessage`, and the app ignores messages that don't come from the current run's iframe.

**Why:** Without `allow-same-origin` the preview gets an opaque origin, so the browser itself prevents it from reading the app, its storage or cookies. That's stronger than anything our own code could promise. Nothing runs on a server, so there is no server to attack. Browser tests confirm the boundaries: reading the parent page, local storage or the network all fail.

**Like a real browser:** `style.css` and `script.js` only load if `index.html` links them, and the lab says so when they don't. This teaches how files actually connect.

**Limits:** Plain HTML/CSS/JS only for now. React, TypeScript and SQL need a build step or a different runtime and come later. An exercise's checks run in the same sandbox as the learner's code, so a determined learner could fool them; that only cheats themselves.

## D15. Lab exercises count toward mastery, without penalizing iteration

**Decision:** Passing all of an exercise's checks without hints or the solution counts as "Demonstrated independently" for its skill. Failed check runs before passing don't count against you; hints mean "practiced with support"; using the solution means "needs another challenge". Skills taught only through lab exercises can reach "independent" but not "retained", since retention needs spaced review.

**Why:** Running code, seeing it fail and fixing it is how programming works. Punishing that would teach the wrong habit.

## D16. Certification recommendations are verified data with honest readiness

**Decision:** `src/content/certifications.ts` lists each certification with the academy skills it relies on, cost, format, effort, what else to prepare, availability limits and source links, plus the date it was checked (`VERIFIED_ON`). A certification is "ready to consider" only when every related skill is demonstrated independently or retained. Partner-only exams show as "skills ready, but not open to you yet".

**Why:** Recommendations must never be invented, and "ready to consider" must not be read as "ready to pass". Most certifications need projects or study beyond this academy, so each card says what else is needed and to confirm prices on the provider's site.

**Maintenance:** Prices and exam versions change (for example, Microsoft replaced AI-900 with AI-901, and CompTIA Security+ V8 is expected around November 2026). Re-check the sources and update `VERIFIED_ON` every few months.

## D17. Path content extends shared skills without gating them

**Decision:** Lessons can belong to a path (`path` field) or be shared foundations. A skill's status is decided by its foundation lessons plus any path lessons or lab exercises you've started. Path content you haven't touched never blocks a shared skill. Milestones list required lessons and lab exercises; shared lessons finished once count in every path. Path lessons are never skipped as "already covered", because they teach things the foundations don't (cents in Finance, board indexes in Chess).

**Why:** Learners on different paths must be able to demonstrate the same shared skill, and switching paths must keep everything already done, without letting a generic lesson stand in for path-specific knowledge. Tests caught both failure modes during Phase 4.

## D18. Time estimates are ranges, from lesson minutes and weekly hours

**Decision:** Remaining time for a milestone = remaining lesson and exercise minutes × 2.5 (practice, mistakes, review) ÷ your weekly hours, shown as a range from 0.75× to 1.5×. The provisional path timelines from the master plan stay alongside as the longer view.

**Why:** People vary a lot; a single number would read as a promise. The factor is deliberately generous and should be tuned once real timing data exists.

## D19. Adaptive teaching uses authored alternatives, chosen by evidence first

**Decision:** Every lesson has authored alternative explanations (simpler, analogy, steps, another example, a transfer challenge, and a comparison where useful). The schema requires them, so every control always works without an AI provider. When a lesson opens, the app picks one to show automatically: first a kind of help you've used at least 3 times with first-try accuracy 15+ points above your no-help baseline; otherwise the first format you said helps (never one you said frustrates you); otherwise, for "detailed" learners, the step-by-step walkthrough. It always says why it opened. After two wrong answers on an activity, it offers simpler/analogy/steps.

**Why:** The master plan asks for personalization based on preferences, performance and feedback, not fixed learning styles, and says enjoying a format isn't the same as learning from it. Evidence therefore outranks stated preference, thresholds are deliberately cautious, and observations are presented as questions the learner can confirm or reject.

**Limits:** Small samples make the evidence noisy; thresholds should be revisited with more data. Generated, on-demand explanations come with model integration (Phase 6).

## D20. Settings updates always build on the latest state

**Decision:** The settings store applies each update to the most recent settings (kept in a ref), not to the value captured when a component rendered.

**Why:** Two updates in the same event (such as saving the profile and then learning preferences at the end of the check-in) would otherwise overwrite each other. The same class of bug appeared in Phase 1's reset; this fixes it at the root, with a test.

## D21. One AI interface; simulated by default

**Decision:** Screens use AI only through `useAI()` (`src/core/ai/useAI.ts`), which picks a provider: the simulated provider (rules plus the academy's own content) or the local-server provider. Simulated is the default and makes no network requests at all; the server's status is only checked after you choose Local server. If the server is missing, has no key, or fails, the answer falls back to simulated with a note explaining why. Every response carries its source and the screen labels it **Simulated** or **Live**.

**Why:** The master plan requires the app to work without paid APIs and never to pretend. A single interface means adding another provider is one file on the server (`ModelClient`), with no screen changes.

## D22. API keys live only in a local server, which owns the prompts and the limits

**Decision:** `server/` is a small Node service (no framework) using the official Anthropic SDK. It reads `ANTHROPIC_API_KEY` from the environment (`.env.local`, ignored by git), listens on 127.0.0.1 only, refuses requests from unknown browser origins and non-JSON bodies, validates input with Zod (`task`, `mode`, `input`, `context`, nothing else, size-limited), builds the system prompt itself from the chosen mode, wraps learner text in tags as data, enforces a daily request limit and an answer-length cap, and logs only metadata. The default model is `claude-opus-5-5` at low effort; `AI_MODEL` can switch to a cheaper one.

**Why:** Anything in the browser can be read, so a key there would be exposed. Keeping prompts on the server stops the browser (or another website) using it as a general-purpose proxy. Limits make a bug or a loop cost cents, not a surprise bill.

**Tests:** the model client is injected, so the server tests use a fake and never spend money.

## D23. Workshop labs are real code around authored model behavior

**Decision:** The structured-output, tool-calling and injection labs use authored examples of what models return. The code that handles them (parsing, Zod validation, argument checks, defense rules) is real and tested. Each lab says this on screen. The injection lab marks prompt-level defenses as "less likely, not stopped" and only code-enforced defenses as "stopped".

**Why:** Repeatable failures teach better than random ones, and the lessons are about the code around a model, which is where safety lives. Presenting instructions in a prompt as a guarantee would teach a dangerous habit.

## D24. Code review is rule-based and doesn't count as a hint

**Decision:** `src/core/ai/codeReview.ts` parses JavaScript with acorn and checks HTML and CSS for a fixed set of problems (loose equality, innerHTML built from data, empty catch, eval, var and never-reassigned let, missing labels, alt text, language, title, heading order, removed focus outlines, wide fixed widths). Findings link to the line. Using it is not recorded as a hint, because it points to problems without supplying the solution.

**Why:** Free, instant, offline feedback on the habits that matter most (security and accessibility first). It says plainly that finding nothing doesn't mean the code is correct.

## D25. SQL runs as real SQLite in a Web Worker, on fresh data every time

**Decision:** SQL exercises use sql.js (SQLite compiled to WebAssembly) inside a Web Worker built from a blob. Each run creates a new in-memory database from the exercise's setup script, runs the query, and closes it. A query that takes longer than 2 seconds is stopped by terminating the worker, which is then recreated. Answers are graded by running the reference query on the same data and comparing columns, rows (any order) and, where asked, order; some checks also require a construct such as JOIN (comments are ignored).

**Why:** Learners should write real SQL against a real engine, not a simplified imitation. The worker keeps the page responsive and has no access to the app's data. Fresh data means a stray DELETE can't break the exercise, and comparing results (not query text) accepts every correct query.

**Cost:** the engine adds about 0.7 MB, loaded only by SQL exercises (inlined in the single-file preview).

## D26. Testing exercises grade your tests with broken versions of the code

**Decision:** "Write tests" exercises include a tiny test runner (expect, toBe, toEqual). Checks run the learner's tests against their own code (must pass) and against several deliberately broken versions (each must be caught by at least one failing test).

**Why:** A test that can't fail protects nothing. This is mutation testing, a real technique for measuring test quality, and it turns "write some tests" into a checkable goal.

## D27. One academy server, SQLite, and cookies for sessions

**Decision:** The Phase 6 AI server grows into the academy server: the same process now serves accounts, sync and circles (`server/academy.ts`), storing data in SQLite through Node's built-in `node:sqlite`. Passwords are hashed with scrypt and a per-password salt. Sessions are random 256-bit tokens in an HttpOnly, SameSite=Strict cookie scoped to `/api`; the database stores only their SHA-256 hash. State-changing requests must carry an allowed Origin and a JSON body.

**Why:** One small process is easy to run and later to host. SQLite needs no separate service and suits a small group. HttpOnly cookies keep the session out of reach of page scripts (unlike tokens in localStorage), and SameSite=Strict plus the origin check block cross-site requests.

**Cost to change:** Low to medium. The queries are plain SQL in one file; moving to PostgreSQL for a larger deployment means swapping the driver and a few SQL details.

## D28. Authorization rules live in one file, and outsiders see "not found"

**Decision:** Every circle route checks membership first. Non-members get 404, the same as a circle that doesn't exist, so ids can't be probed. Only owners invite, remove members and delete circles; shares can be removed by their author or the owner; comments only by their author. Members see each other's display names, never emails. Invite codes are 10 characters from a 31-character alphabet, stored hashed, valid for 7 days and 5 uses.

**Why:** Keeping the rules together makes them reviewable, and each rule has a test that tries to break it as a different user.

## D29. Moving progress between device and account is explicit

**Decision:** Progress isn't synced automatically. "Save this device's progress" uploads the same validated backup the Backup feature makes; "Restore to this device" downloads it and runs it through the existing import plan, which lists what will be replaced and asks before writing.

**Why:** Automatic merging of learning records across devices can silently overwrite work, and the master plan requires that nothing is overwritten without confirmation. Reusing the backup format means one validated path for every import. Automatic sync can be built on top later.

## D30. Heavy screens load on demand; the preview stays one file

**Decision:** The Code Lab (editor, parser, SQL engine), AI Workshop, Progress, Certifications, Circles, Settings and Welcome screens are loaded with React Router's `lazy` routes. Home, Learn, lessons, Review and Projects stay in the first download. `npm run build:preview` (`SINGLE_FILE=1`) turns code splitting off for the one-file preview.

**Why:** The first download halved (about 560 KB to 286 KB compressed). Lessons stay eager because they power search and recommendations on every page.

## D31. The server hosts the app with a security policy, and tests run against that setup

**Decision:** The academy server serves `dist/` with a Content-Security-Policy (`default-src 'self'`, no third-party origins, no `unsafe-eval`, `object-src 'none'`, `frame-ancestors 'none'`) and `nosniff`, `no-referrer`, `DENY` framing, `same-origin` opener and a restrictive permissions policy. The browser tests run against this exact setup rather than a development server.

**Trade-off:** Inline scripts stay allowed, because the Code Lab's sandboxed `srcdoc` preview inherits the page's policy and learner code is inline. The sandbox's opaque origin and its own stricter policy protect the app; a separate preview origin would allow removing this (listed in SECURITY.md).

## D32. Color theme: warm off-white, deep teal, antique-gold whisper

**Decision (requested by the learner):** Background #FAF9F6; primary #0F4C5C for all buttons and active states; antique gold #B98A2F only for tiny decorative marks (the logo's crossbar, the thin bar beside the current page, a short rule before page labels); text #1E2A28 and #4A5A56. Dark mode: background #101817 with #6FB5A8 buttons (dark text on them).

**Why gold is never text:** it measures about 3:1 against the background, below the 4.5:1 that WCAG AA requires for text. All other pairs were measured: deep teal buttons 9.5:1, dark-mode buttons 7.3:1, secondary text 6.9:1. The accessibility audit runs on the final theme.

## D33. Guided experiments are data, run by one screen built from Code Lab parts

**Decision:** Each experiment is a validated data file (`src/content/experiments/`) listing its lessons, starter files and steps. Each step names one file to edit, gives a task, the expected result, hints from a small clue to the exact change, words explained in place, a check, and success feedback; a "make it your own" step offers choices, each with its own check. `ExperimentPage` runs any experiment using the Code Lab's CodeMirror editor, its sandboxed iframe runner and its error explanations. Checks run inside the sandbox after the page loads; they return true or throw an error whose message is the feedback.

**Why:** New experiments need only a new data file. Reusing the Code Lab keeps one sandbox and one editor to secure and test. Checks that inspect the rendered page (computed colors, clicking the button) accept any correct edit, and can explain specific mistakes, like putting the color in the wrong rule.

**Choices:** Run Code is explicit (no live preview while typing) so beginners connect the action with the result. Reset step restores the code as it was when the step started. Progress is stored separately from Code Lab exercises (`academy:experiments`) and included in backups. Completing an experiment doesn't count toward mastery, because the steps give the answer away in their hints; the lesson's practice and the Code Lab exercises do.
