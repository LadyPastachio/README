# Roadmap

The academy is built in phases. Each phase ends runnable, tested and documented. Time estimates for learning paths live in the app (Learn → a path); this file tracks building the app itself.

**Current status:** Phases 0–4 complete. Next: Phase 5 (adaptive learning and review).

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

## Phase 5: Adaptive learning and review

- [ ] Onboarding learning-preferences check-in (a few questions at a time, skippable)
- [ ] Personalized learning profile: stated preferences vs. observed evidence; view, edit, reset, export
- [ ] Lesson controls: diagram, simpler, step-by-step, example, experiment, challenge, compare
- [ ] Alternative explanations when you're stuck; spaced review and transfer challenges

## Phase 6: AI Workshop and model integration

- [ ] Simulated, clearly labeled model responses
- [ ] Provider-independent model interface
- [ ] Small local server holding API keys (never in the browser)
- [ ] Prompt coach, structured-output validation, tool-calling and injection exercises
- [ ] Usage limits and live/simulated indicators

## Phase 7: Engineering progression and capstone

- [ ] Second milestones for each path (chess rules and tests, budgets with tests, interactivity and components, a small backend service)

- [ ] Backend, SQL, testing and security strands
- [ ] Business automation project on synthetic data
- [ ] Toward the white-label follow-up agent: approved knowledge only, verified tool results, human handoff, logging, idempotency

## Phase 8: Online readiness and collaboration

- [ ] Backend + database, accounts, authorization
- [ ] Server-side storage and migration from local data
- [ ] Private learning circles with permission-based sharing
- [ ] Data deletion, backup and recovery; isolation tests between users

## Phase 9: Hardening and release

- [ ] Accessibility and responsive review, security review, performance
- [ ] Deployment instructions and hosting path
