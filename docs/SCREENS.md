# Screen inventory

Each screen's purpose, main actions, layout at each size, and important states. "Phone" is under 768px, "tablet" 768–1023px, "desktop" 1024px and up.

## App shell (every screen)

- **Purpose:** Get anywhere in one or two taps; always show where you are.
- **Desktop:** Fixed sidebar with name, search box, eight labeled destinations, version.
- **Tablet:** Icon rail with short labels; search as an icon.
- **Phone:** Top bar (name + search) and a bottom bar: Home, Learn, Projects, Lab, More. "More" opens a sheet with AI Workshop, My Progress, Learning Circles, Settings.
- **Global:** Search (`/` or `Ctrl K`), skip link, focus moves to the page on navigation, toasts for confirmations.

## Home: "What to work on next"

- **Purpose:** Answer "what should I work on next, and why?"
- **Actions:** Start the recommended activity; open a path; see reviews due; open Code Lab.
- **Layout:** Recommendation (wide) + reviews (narrow) side by side on desktop, stacked on phone; four path cards (4 → 2 → 1 columns).
- **States:** No history yet (current): recommends the shared first lesson and explains why. With history (Phase 2+): recommendation based on evidence and due reviews. No streaks, totals or completion percentages.

## Learn

- **Purpose:** Browse paths, shared skills and lessons.
- **Actions:** Open a path, open a lesson, open the glossary, jump to a skill in the map.
- **Layout:** Path list with timelines (timelines move under the text on narrow screens); foundations and shared skills side by side, stacked on phone.
- **Sub-screens:**
  - **Path:** pitch, AI feature, three-stage timeline, milestones with skills, where to begin.
  - **Lesson:** reading column + sticky guide (objective, hints, mastery requirement, review plan). The guide moves above the lesson on narrow screens. States: unanswered, incorrect with specific feedback, correct; hints revealed one at a time.
  - **Glossary:** filterable list; search results scroll to and highlight the term.
- **States:** Unknown path or lesson shows the not-found page.

## Projects

- **Purpose:** Workspaces for the four projects, separate from lessons.
- **Actions (now):** See each project's first milestone; open its milestones. **Planned (Phase 4):** requirements, files, known issues, review findings, evidence, sharing.
- **Layout:** Exercise / experiment / project explainer, then a 2-column (phone: 1) grid of project cards.
- **States:** "Not started" for all projects today.

## Code Lab

- **Purpose:** Write, run and debug code safely.
- **Now:** Explains the four parts being built and shows a live preview of the editor font settings. No imitation editor.
- **Planned (Phase 3):** Desktop: explorer | editor | preview + console, resizable. Phone: one panel at a time with Edit / Preview / Console tabs.
- **States (planned):** running, runtime error with line, console output, reset confirmation.

## AI Workshop

- **Purpose:** Learn AI engineering hands-on.
- **Now:** Connection status (no provider; simulated only) and the six stages.
- **Planned (Phase 6):** Prompt coach, request/response experiments, structured outputs, tool calling, injection challenges. Every response labeled Simulated or Live.

## My Progress

- **Purpose:** Show what you can do, based on evidence.
- **Actions:** Read the mastery legend; jump to any skill (from search or chips elsewhere).
- **Layout:** Legend, then skills grouped by area, each with paths that use it, prerequisites and status. Rows stack on phone.
- **States:** All skills "Not introduced" until Phase 2 records evidence.

## Learning Circles

- **Purpose:** Optional learning with friends.
- **Now:** The privacy principles that will govern circles.
- **Planned (Phase 8):** Private circles, invitations, shared projects, code review comments, optional challenges. Nothing shared unless chosen.

## Settings

- **Purpose:** Control appearance, accessibility and your data. Every control shown works.
- **Sections:** Appearance, Accessibility, Learning (planned, Phases 2 and 5), AI (status; planned, Phase 6), Privacy and data, About.
- **Layout:** Section links on the left (desktop) or a scrolling chip row (phone/tablet); one panel per section.
- **States:** "All changes saved" / "Not saved: this browser is blocking storage"; restore preview dialog listing what will be replaced; invalid backup error; delete confirmation dialog; toasts for completed actions.

## Not found

- Plain explanation and a button back to Home.
