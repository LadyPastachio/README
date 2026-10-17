# Screen inventory

Each screen's purpose, main actions, layout at each size, and important states. "Phone" is under 768px, "tablet" 768–1023px, "desktop" 1024px and up.

## App shell (every screen)

- **Purpose:** Get anywhere in one or two taps; always show where you are.
- **Desktop:** Fixed sidebar with name, search box, eight labeled destinations, version.
- **Tablet:** Icon rail with short labels; search as an icon.
- **Phone:** Top bar (name + search) and a bottom bar: Home, Learn, Projects, Lab, More. "More" opens a sheet with AI Workshop, My Progress, Learning Circles, Settings.
- **Global:** Search (`/` or `Ctrl K`), skip link, focus moves to the page on navigation, toasts for confirmations.

## Home: "Today's plan"

- **Purpose:** Answer "what should I work on next, and why?"
- **Actions:** Start the top recommendation; open other suggestions; start a review; open a project.
- **Layout:** Illustrated feature card for the top pick + compact rows for the rest (count = daily load); Reviews and "Needs another try" panels alongside (stacked on phone); four illustrated project cards (4 → 2 → 1 columns).
- **States:** New learner ("Welcome. Here's where to start."); due reviews (count + Start review); nothing due (next dates listed); skills flagged after a failed activity or missed review; misconceptions seen. No streaks, totals or completion percentages.

## Review

- **Purpose:** Spaced retrieval: one new question per due lesson.
- **Layout:** Progress strip, one question card at a time, Next button after answering.
- **States:** Nothing due (next date shown); no reviews scheduled yet; in progress; finished. No hints; only the first answer counts.

## Learn

- **Purpose:** Browse paths, shared skills and lessons.
- **Actions:** Open a path, open a lesson, open the glossary, jump to a skill in the map.
- **Layout:** Path list with timelines (timelines move under the text on narrow screens); foundations and shared skills side by side, stacked on phone.
- **Sub-screens:**
  - **Path:** pitch, AI feature, three-stage timeline, milestones with skills, where to begin.
  - **Lesson:** illustrated header with objective and status; "why this matters" callout; sections with highlighted code and diagrams; optional "Try this first" warm-up; Practice with hints box and activity cards (type icon, confidence check, feedback, Show solution per settings, "Last time" result); misconceptions; summary with evidence export and next lesson. Sticky guide on desktop (mastery requirement, progress dots, review plan), placed after the lesson on narrow screens.
  - **Glossary:** filterable list; search results scroll to and highlight the term.
- **States:** Unknown path or lesson shows the not-found page.

## Projects

- **Purpose:** Workspaces for the four projects, separate from lessons.
- **Actions (now):** See each project's first milestone; open its milestones. **Planned (Phase 4):** requirements, files, known issues, review findings, evidence, sharing.
- **Layout:** Exercise / experiment / project explainer, then a 2-column (phone: 1) grid of project cards.
- **States:** "Not started" for all projects today.

## Code Lab

- **Purpose:** Write, run and debug real code safely.
- **Exercise list:** safety note; exercise cards (type, skill, time, number of checks, status); playground.
- **Workspace (desktop):** collapsible task panel (instructions, prediction box, acceptance criteria with live pass/fail, hints, solution, comparison after passing, certification prompt) | editor with file tabs, Run and Reset, and a footer showing how files connect and a Live preview toggle | resizable divider | preview above console.
- **Workspace (phone and tablet under 900px):** Task / Code / Preview / Console switcher, one panel at a time.
- **States:** live preview; running checks; all passed (wording depends on hints or solution used); runtime error with explanation and line link; syntax error before running; unlinked file notice; loop stopped; checks timed out; reset confirmation.

## Certifications (under My Progress)

- **Purpose:** Recommend certifications as skills are demonstrated.
- **Layout:** what "ready to consider" means and the verification date; groups: Ready to consider, Building toward, Skills ready but not open yet, Later. Each card: provider, cost, level, value, format, effort, skill checklist, what else to prepare, availability warning, Visit provider, sources.
- **Elsewhere:** prompt after finishing a lesson or exercise that completes a certification's skills; card on Home; summary panel on My Progress.

## AI Workshop

- **Purpose:** Learn AI engineering hands-on.
- **Now:** Connection status (no provider; simulated only) and the six stages.
- **Planned (Phase 6):** Prompt coach, request/response experiments, structured outputs, tool calling, injection challenges. Every response labeled Simulated or Live.

## My Progress

- **Purpose:** Show what you can do, based on evidence.
- **Actions:** Read the mastery legend; jump to any skill (from search or chips elsewhere).
- **Layout:** Legend, then skills grouped by area, each with paths that use it, prerequisites and status. Rows stack on phone.
- **Layout now:** overview bar of all 29 skills by status, skill tiles grouped by area (status, three-step ladder, reason, lessons), misconceptions spotted, recent answers, Learning Evidence per started lesson.

## Learning Circles

- **Purpose:** Optional learning with friends.
- **Now:** The privacy principles that will govern circles.
- **Planned (Phase 8):** Private circles, invitations, shared projects, code review comments, optional challenges. Nothing shared unless chosen.

## Settings

- **Purpose:** Control appearance, accessibility and your data. Every control shown works.
- **Sections:** Appearance, Accessibility, Learning (daily load, lesson order, hints, solutions, confidence), Learning profile (stated vs. observed; copy, download, reset), AI (status; planned, Phase 6), Privacy and data, About.
- **Layout:** Section links on the left (desktop) or a scrolling chip row (phone/tablet); one panel per section.
- **States:** "All changes saved" / "Not saved: this browser is blocking storage"; restore preview dialog listing what will be replaced; invalid backup error; delete confirmation dialog; toasts for completed actions.

## Not found

- Plain explanation and a button back to Home.
