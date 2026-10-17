# Roadmap

The academy is built in phases. Each phase ends runnable, tested and documented. Time estimates for learning paths live in the app (Learn → a path); this file tracks building the app itself.

**Current status:** Phases 0–2 complete. Next: Phase 3 (Code Lab).

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

## Phase 3: Functional Code Lab

- [ ] Editor with syntax highlighting (CodeMirror 6), file explorer, tabs
- [ ] Sandboxed iframe execution for HTML/CSS/JS (`sandbox="allow-scripts"`, no access to app storage)
- [ ] Console capture, plain-language errors, run/reset
- [ ] Code-reading, debugging and prediction exercises with automatic checks
- [ ] Tests for sandbox isolation and failure handling
- [ ] Phone layout: switch between edit, preview and console

## Phase 4: Competency map and four paths

- [ ] Prerequisite-aware competency map
- [ ] Path-specific lessons and real project milestones (Chess first: fastest to a playable result)
- [ ] Milestone tracking and switching paths without repeating mastered skills
- [ ] Project workspaces: requirements, acceptance criteria, known issues, review findings

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
