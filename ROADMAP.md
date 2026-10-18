# Roadmap

The academy is built in phases. Each phase ends runnable, tested and documented. Time estimates for learning paths live in the app (Learn → a path); this file tracks building the app itself.

**Current status:** Phases 0–7 complete. Next: Phase 8 (online readiness and collaboration).

---

## Phase 0: Discovery and foundation ✅

- [x] Inspected the environment (Node 22, npm 10, Git 2.43, Chromium for browser tests)
- [x] Chose the stack and recorded decisions ([DECISIONS.md](DECISIONS.md))
- [x] Project setup: TypeScript strict mode, Vite, Vitest, Playwright, `.gitignore`, `.env.example` with no secrets
- [x] Git repository and working branch

## Phase 1: Design system and navigation ✅

- [x] Design tokens: light and dark themes, 5 accents, 4 path colors, 5 mastery colors, density, high contrast, reduced motion
- [x] Reusable components: buttons, panels, page header with breadcrumbs, chips, notices, "Planned" notice, empty state, segmented control, switch, slider, dialog, toast
- [x] Responsive navigation: sidebar (≥1024px), icon rail (768–1023px), bottom bar + "More" sheet (<768px), skip link, focus moved to content on navigation
- [x] All eight destinations with honest content; unbuilt features labeled with their phase
- [x] Global search (`/` or `Ctrl K`) and a searchable glossary
- [x] One complete sample lesson: diagram, ordering activity, multiple choice with per-answer explanations, explain-in-your-own-words, hints, misconceptions
- [x] Settings, all functional and saved: theme, accent, density, editor font and size, text size, reduced motion, high contrast
- [x] Backup (download/copy), validated restore with confirmation, delete local data, diagnostic report
- [x] Screen inventory ([docs/SCREENS.md](docs/SCREENS.md))

**Tests at end of Phase 1** (all run and passing on 2026-10-17):
- 39 unit tests: settings validation and storage, blocked-storage handling, backup export/import/rejection, search ranking, curriculum references and prerequisite cycles, activity logic, navigation, settings applying to the page, lesson activities
- 48 browser checks (16 tests × desktop, tablet, phone): every page renders with no console errors and no sideways scroll; navigation adapts by screen size; theme survives reload; search opens a glossary term; backup round-trip only changes data after confirmation; non-backup files are rejected

**Known limitations at the time** (resolved in Phase 2): answers weren't saved; on phones the lesson guide pushed the lesson text down.

---

## Phase 2: Working learning engine ✅

- [x] Lesson schema with runtime validation (Zod); one file per lesson; invalid lessons fail loudly ([DECISIONS.md](DECISIONS.md) D13)
- [x] Learning records: answers, hints shown, confidence, solution reveals, misconceptions, explanations and self-checks ([D10](DECISIONS.md))
- [x] Mastery rules for activities, lessons and skills, with plain-language reasons
- [x] Spaced review (2 → 7 → 21 → 60 days; a miss returns next day) and a Review screen
- [x] Home recommendations driven by records, with the reason for each
- [x] Learning settings: daily load, lesson order (explain first / try first), hint timing, solution reveal rule, confidence check
- [x] Initial learning profile: stated preferences vs. observed evidence; view, edit, reset, copy, download
- [x] Learning Evidence export (Markdown, JSON) and an independent-assessor prompt
- [x] My Progress: skill map with statuses, misconceptions spotted, recent answers, evidence per lesson
- [x] 9 new lessons (10 total) using six activity types
- [x] Records included in backups and validated on restore
- [x] **Design upgrade** (requested mid-phase): illustrations for each project and lesson, highlighted code panels with line numbers, activity-type icons, A/B/C answer keys, grouped sidebar, quieter "Phase N" labels, softer elevation

**Tests at end of Phase 2** (all run and passing on 2026-10-17):
- 78 unit tests, including 38 for the learning engine (mastery transitions, retention timing, review scheduling, recommendations, record storage and damage recovery, observations, evidence) and 8 for curriculum validation
- 60 browser checks (20 tests × desktop, tablet, phone), including a full lesson walkthrough that checks mastery, Home and Progress update and survive a reload

**Known limitations:**
- No code runs yet: activities test reading and reasoning about code. Writing and running code is Phase 3.
- Explanations are self-assessed against a checklist. Independent written feedback needs a model (Phase 6), or the assessor prompt in a separate AI chat.
- Observed patterns in the profile need at least 8 answers and are deliberately cautious.
- Code words in lesson text aren't styled as code yet (they are in code panels).
- "Download" buttons don't work inside the shared phone preview (the viewer blocks downloads); "Copy" does. Both work when running the app normally.
- Browser tests run in Chromium only.

## Phase 3: Functional Code Lab ✅

- [x] Editor with syntax highlighting (CodeMirror 6), file tabs for index.html, style.css and script.js, undo history per file
- [x] Sandboxed execution (iframe `sandbox="allow-scripts"`, no same-origin, network blocked by CSP) ([D14](DECISIONS.md))
- [x] Syntax errors caught before running; runaway loops stopped after a second
- [x] Console capture with plain-language error explanations and a button to jump to the line
- [x] Live preview while typing, Run (Ctrl/Cmd+Enter), Reset with confirmation, code saved as you type and included in backups
- [x] Shows how files connect: warns when index.html doesn't link style.css or script.js
- [x] 8 exercises with automatic checks: build (first page, style a card, counter button, chess board row), debug (budget total, accessible form), predict (loops), refactor (with a comparison of approaches and trade-offs), plus a playground
- [x] Hints and the solution follow your learning settings; passing counts toward mastery ([D15](DECISIONS.md))
- [x] Phone layout: one panel at a time (Task, Code, Preview, Console); desktop: resizable editor/preview, collapsible task panel
- [x] **Certification recommendations** (requested): 12 verified certifications matched to demonstrated skills, a Certifications page, prompts after finishing a lesson or exercise, and a card on Home and My Progress ([D16](DECISIONS.md))

**Tests at end of Phase 3** (all run and passing on 2026-10-17):
- 103 unit tests, adding the loop guard, error explanations, document builder (linking, CSP, script escaping, syntax errors), lab storage, lab mastery and certification readiness
- 100 browser checks across desktop, tablet and phone (17 skipped by design: per-exercise content checks run on desktop only). These include sandbox isolation (no access to the parent page, storage or network), infinite-loop recovery, error line numbers, and every exercise's starter failing while its reference solution passes

**Bugs found by these tests and fixed:** on phones and tablets, every lab panel showed at once (a style overrode the `hidden` attribute app-wide), and "Check my work" jumped away from the results.

**Known limitations:**
- Only HTML, CSS and JavaScript run. React, TypeScript, SQL and backend code come with later phases.
- Exercise checks run beside your code, so they can be fooled on purpose.
- Certification details were verified on 2026-10-17 and will drift; the app says to confirm on the provider's site.

## Phase 4: Competency map and four paths ✅

- [x] Skill map: all skills laid out by prerequisite depth, colored by status, filterable by path
- [x] 8 path lessons (2 per path) and 9 path Code Lab exercises, each path's first milestone fully buildable:
  - Website: flexbox, responsive design → responsive nav, **responsive profile page**
  - Finance: money math in cents, filter/map/reduce → transaction form, **monthly summary**
  - Chess: board as data, game state → full board, place pieces, **move pieces with clicks**
  - Automation: HTTP/APIs/webhooks, validating input → parse a webhook, **simulated lead workflow** (approved knowledge only, handoff, logging, injection-resistant)
- [x] Milestone tracking with required lessons and exercises, deliverable project, acceptance criteria and states (planned, not started, in progress, complete)
- [x] Time estimates as ranges at your weekly hours ([D18](DECISIONS.md)); current path and weekly hours in Settings
- [x] Switching paths keeps shared progress; path content never gates shared skills ([D17](DECISIONS.md))
- [x] Home: path chooser, recommendations toward the current milestone including Code Lab projects
- [x] Projects workspace: tabs per project, current deliverable, milestone tracker, your notes (design, known issues, improvements), saved and backed up
- [x] Learn shows each path's lessons, your path first

**Tests at end of Phase 4** (all run and passing on 2026-10-18):
- 121 unit tests, adding milestone states, path-aware recommendations, skills across paths, estimates and skill-map layout
- 136 browser checks across desktop, tablet and phone (35 skipped by design), including every new project's starter failing and reference solution passing, choosing and switching paths, project notes surviving a reload, and the skill map filter

**Bugs found by these tests and fixed:**
- Form exercises could never work: sandboxed iframes need `allow-forms` for submit events to fire ([D14](DECISIONS.md) updated)
- A check started within ~0.6 s of opening an exercise was silently cancelled by the live-preview run
- Finishing a generic lesson marked a path-specific lesson as "covered"; a Finance-only lesson would have blocked JavaScript basics for other paths

**Known limitations:**
- Only each path's first milestone has content. Later milestones show as planned.
- Time estimates use a fixed practice factor, not your real pace yet.

## Phase 5: Adaptive learning and review ✅

- [x] "How do you learn" check-in: helpful and frustrating formats, example-first or try-first, detail level, what got in the way before, first project and weekly hours; every question skippable, redo any time
- [x] Learning profile: stated preferences (including frustrating formats and detail level) kept separate from observed evidence, with help-effect bars; view, edit, reset, copy, download
- [x] Lesson controls on every lesson: simpler, analogy, step-by-step walkthrough, another example, diagram and compare (where available), experiment in the Code Lab, transfer challenge ([D19](DECISIONS.md))
- [x] Adaptive opening: evidence first, then stated preference, with a visible reason and a link to change it
- [x] Stuck detection: after two misses, offer a different explanation
- [x] Brief mode tucks away background text; detailed mode opens walkthroughs
- [x] Transfer challenges saved as evidence; help used is included in Learning Evidence
- [x] Observations about what helps, asked as "does this match?" and recorded; suggestion to try harder settings after five independent lessons
- [x] Spaced review and confidence tracking (from Phase 2) continue to feed observations

**Tests at end of Phase 5** (all run and passing on 2026-10-18):
- 137 unit and UI tests, adding help selection (stated, frustrating, evidence thresholds), experiments, recording help, stuck offers, transfer evidence, brief mode, the check-in, and sequential settings updates
- 145 browser checks across desktop, tablet and phone (35 skipped by design), including completing the check-in and seeing the chosen explanation open, opening lesson code in the Code Lab, and every lesson control working without sideways scroll

**Bugs found and fixed:** a stale-state overwrite when saving two settings in a row ([D20](DECISIONS.md)); one wrong number in a written explanation (caught by running the code it described).

**Known limitations:**
- Alternatives are authored, so there's one of each per lesson. On-demand explanations need a model (Phase 6).
- "What helps you" needs several uses before it's trusted; early on, stated preferences decide.

## Phase 6: AI Workshop and model integration ✅

- [x] Provider-independent model interface: simulated provider and local-server provider behind one hook ([D21](DECISIONS.md))
- [x] Simulated responses that are rule-based and say so, labeled **Simulated** everywhere; live ones labeled **Live**
- [x] Small local server holding the API key (official Anthropic SDK), bound to 127.0.0.1, origin check, input validation, server-side system prompts, daily limit, capped answer length, metadata-only logs ([D22](DECISIONS.md))
- [x] AI Workshop tools: mentor (5 modes), prompt coach, request and cost inspector with temperature demo, structured-output lab with an evaluation table, tool-calling stepper, prompt-injection lab ([D23](DECISIONS.md))
- [x] Rule-based code review in the Code Lab and the mentor ([D24](DECISIONS.md))
- [x] Settings → AI: simulated or local server, default mentor mode, live status and remaining requests
- [x] 6 AI lessons (prompts as specifications, model APIs, structured outputs, prompt injection, tool-calling loops, evaluation) and 4 AI Code Lab exercises; Automation milestones 3 and 4 now have content

**Tests at end of Phase 6** (all run and passing on 2026-10-18):
- 195 unit tests, adding the server (no key, key never returned, server-built prompts, rejected input, origin check, daily limit and reset, safe error messages, metadata-only logs), the providers and fallbacks, the simulated mentor, the prompt coach, the code reviewer, the structured-output pipeline, the injection lab, the tool loop and the Workshop screens
- 194 browser checks across desktop, tablet and phone (43 skipped by design), including simulated mode making no network requests, the real server reached through the proxy, the key never appearing in the page or storage, every new exercise's starter failing and solution passing, and Code Lab review jumping to the line

**Bugs found and fixed:** an oversized request closed the connection before the server could answer (it now drains the body and replies 413); the test setup assumed a browser environment, which broke the server tests.

**Known limitations:**
- Live mode is tested against a fake model client, never a real paid call. The SDK call itself (`server/anthropic.ts`) was type-checked against SDK 0.135 but not run with a real key here.
- The simulated mentor only explains glossary terms, and its quiz uses existing review questions.
- Token counts in the Workshop are estimates (about 4 characters per token). Prices were checked on 2026-10-18.
- The structured-output, tool-calling and injection labs use authored model outputs, so they show typical failures, not every possible one.

## Phase 7: Engineering progression and capstone ✅

- [x] Second milestones with content for every path:
  - Website: events and the DOM, accessible forms → accessible tabs, **accessible sign-up form**
  - Finance: writing tests, budget rules → **budget rules with tests**, budget alerts
  - Chess: move rules as functions → knight and rook moves, **pawn moves with tests**
  - Automation: SQL, a small service, secrets and least privilege → **idempotent webhook handler**, SQL for new leads and overdue follow-ups
- [x] Testing strand: a foundation lesson, and exercises that run your tests against deliberately broken versions ([D26](DECISIONS.md))
- [x] SQL strand: a foundation lesson and three SQL exercises running real SQLite in a worker, graded against reference queries ([D25](DECISIONS.md))
- [x] Backend and security strands: webhook signatures, status codes, idempotency, secrets, least privilege, tenant isolation
- [x] Capstone milestone (Automation 5): a white-label follow-up agent serving two synthetic businesses, with approved knowledge only, handoff for bookings and unknown questions, duplicate and cross-tenant refusal, injection resistance and logs
- [x] Code Lab grouped by path (your path first)

**Tests at end of Phase 7** (all run and passing on 2026-10-18):
- 204 unit tests, adding SQL grading (column, row and order comparisons, comments ignored, empty results) and every SQL exercise's solution passing while its starter fails, run against real SQLite
- 232 browser checks across desktop, tablet and phone (65 skipped by design), including every new exercise's starter failing and solution passing, a runaway recursive SQL query being stopped, SQL errors explained, and practice data staying fresh between runs

**Bugs found by these tests and fixed:** one exercise check expected the wrong total ($251.00 instead of $200.00); a webhook check depended on an earlier check's state, so it was made self-contained; a phone-only test typed too fast for the editor under load and now inserts text in one step.

**Known limitations:**
- The webhook handler and agent run in the browser sandbox as functions; a real server, database and accounts arrive in Phase 8.
- The webhook "signature" is a teaching stand-in and says so; real providers use HMAC-SHA256.
- Later milestones (Website 3–4, Finance 3–4, Chess 3–4) are still planned. Chess check and checkmate are not covered yet.
- SQL exercises use SQLite; other databases differ in details.

## Phase 8: Online readiness and collaboration

- [ ] Backend + database, accounts, authorization
- [ ] Server-side storage and migration from local data
- [ ] Private learning circles with permission-based sharing
- [ ] Data deletion, backup and recovery; isolation tests between users

## Phase 9: Hardening and release

- [ ] Accessibility and responsive review, security review, performance
- [ ] Deployment instructions and hosting path
