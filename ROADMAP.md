# Roadmap

The academy is built in phases. Each phase ends runnable, tested and documented. Time estimates for learning paths live in the app (Learn → a path); this file tracks building the app itself.

**Current status:** Phase 0 and Phase 1 complete. Next: Phase 2.

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

**Known limitations:**
- Lesson answers, hints used and explanations are not saved (Phase 2).
- On phones, the lesson guide (objective, hints) sits above the lesson text, so the first section starts further down. Revisit with the Phase 5 lesson controls.
- Browser tests were run in Chromium only.

---

## Phase 2: Working learning engine ⏭ next

Goal: lessons that remember what you did and turn it into evidence.

- [ ] Lesson schemas with runtime validation (Zod); one file per lesson
- [ ] Learning records: attempts, hints used, solution reveals, confidence, explanations
- [ ] Mastery state machine (the five statuses) with tested transitions
- [ ] Async storage for learning records (IndexedDB), included in backups
- [ ] Learning settings: daily load, hint level, solution reveal rules (load never lowers mastery requirements)
- [ ] Learning Evidence export (Markdown and JSON) + optional independent-assessor prompt
- [ ] Home recommendations and spaced review driven by real records
- [ ] 6–10 more complete foundation lessons using different activity types (predict the output, find the bug, fill the gap)

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
