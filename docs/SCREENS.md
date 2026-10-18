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
  - **Lesson help panel ("See it another way"):** controls row; one explanation shown at a time; note when something was opened automatically and why; stuck offer inside activities after two misses.
  - **Lesson:** illustrated header with objective and status; "why this matters" callout; sections with highlighted code and diagrams; optional "Try this first" warm-up; Practice with hints box and activity cards (type icon, confidence check, feedback, Show solution per settings, "Last time" result); misconceptions; summary with evidence export and next lesson. Sticky guide on desktop (mastery requirement, progress dots, review plan), placed after the lesson on narrow screens.
  - **Glossary:** filterable list; search results scroll to and highlight the term.
- **States:** Unknown path or lesson shows the not-found page.

## Projects

- **Now (Phase 4):** one tab per project (your path first) with its picture and milestone count; the workspace shows the current deliverable (open in Code Lab, or "Checks pass"), the milestone tracker, and your notes (design notes, known issues, future improvements), saved as you type.

**Original Phase 1 notes:**

- **Purpose:** Workspaces for the four projects, separate from lessons.
- **Actions (now):** See each project's first milestone; open its milestones. **Planned (Phase 4):** requirements, files, known issues, review findings, evidence, sharing.
- **Layout:** Exercise / experiment / project explainer, then a 2-column (phone: 1) grid of project cards.
- **States:** "Not started" for all projects today.

## Code Lab

- **Purpose:** Write, run and debug real code safely.
- **Exercise list:** safety note; guided experiments first; exercise cards (type or SQL, skill, time, number of checks, status) grouped into shared exercises and one section per path, your path first; playground.
- **Workspace (desktop):** collapsible task panel (instructions, prediction box, acceptance criteria with live pass/fail, hints, solution, comparison after passing, certification prompt) | editor with file tabs, Run and Reset, and a footer showing how files connect and a Live preview toggle | resizable divider | preview above console.
- **Workspace (phone and tablet under 900px):** Task / Code / Preview / Console switcher, one panel at a time.
- **SQL workspace:** task panel (instructions, tables and columns, acceptance criteria, hints, solution) | query editor with Run and Reset above a results table (row count, timing). Phone and tablet: Task / Query / Results switcher. States: results; no rows; error with a tip; query stopped after 2 seconds.
- **Code review:** "Review my code" in the task panel lists findings by severity with links to the line; "Ask the model too" appears only when live.
- **States:** live preview; running checks; all passed (wording depends on hints or solution used); runtime error with explanation and line link; syntax error before running; unlinked file notice; loop stopped; checks timed out; reset confirmation.

## Guided experiment (/lab/experiment/:id)

- **Purpose:** A beginner's first hands-on coding, one small change at a time.
- **Desktop (1280px+):** three columns. Instructions (title, objective, progress bar, numbered steps with the current one highlighted, then the current step: concept, "File to edit", task, "You should see", words explained, Run Code, Check My Work, feedback, Next step, hints, common mistakes, Reset step, View starter code, Reset experiment) | editor with index.html / style.css / script.js tabs (the file for this step marked "Edit") and Run Code | live preview framed like a browser window, with Messages for errors below.
- **Tablet (900–1279px):** instructions on the left; editor above the preview on the right.
- **Phone:** Steps / Code / Preview switcher; the current step's task and file stay visible above the code and the preview. Run Code switches to the preview.
- **States:** not checked; check failed (specific, encouraging reason); passed (Next step); code error (explained in Messages and mentioned in the feedback); reset confirmations; starter code dialog; completion screen (what you practiced, where to go next, keep experimenting, start over).

## Certifications (under My Progress)

- **Purpose:** Recommend certifications as skills are demonstrated.
- **Layout:** what "ready to consider" means and the verification date; groups: Ready to consider, Building toward, Skills ready but not open yet, Later. Each card: provider, cost, level, value, format, effort, skill checklist, what else to prepare, availability warning, Visit provider, sources.
- **Elsewhere:** prompt after finishing a lesson or exercise that completes a certification's skills; card on Home; summary panel on My Progress.

## AI Workshop

- **Purpose:** Learn AI engineering hands-on: a workbench, not a chat box.
- **Overview:** connection status (Simulated / Live / server unavailable, with a link to Settings), six tool cards, six stages each linked to a lesson.
- **Tools (each at /ai/<tool>, with breadcrumbs and the status banner):**
  - **Mentor:** mode switch (Guide me, Explain, Review code, Debug with me, Quiz me), message box with character count, labeled response card; quiz answers lock after one choice and explain why.
  - **Prompt coach:** prompt editor beside an 8-part checklist that updates as you type; "Add missing parts" and "Try it".
  - **Requests, tokens and cost:** system prompt, message, model and max_tokens → live request JSON, token and cost estimates (with sources and date); temperature slider reshaping illustrative word probabilities.
  - **Structured outputs:** schema and six pipeline switches beside an evaluation table (correct / handed off / wrong / crashed) and expandable cases showing each step.
  - **Tool calling:** scenario switch, approval switch, numbered steps colored by actor, one step at a time with its message JSON, Back/Next.
  - **Prompt injection:** five defense switches (marked "in the prompt" or "enforced in code") beside six synthetic messages and their outcomes.
- **Phone:** every two-column tool stacks; switches and steps wrap.
- **States:** simulated (default); local server unavailable (reason shown, "Check again"); live (model and requests left today); fallback notice on a response when live failed.

## My Progress

- **Purpose:** Show what you can do, based on evidence.
- **Actions:** Read the mastery legend; jump to any skill (from search or chips elsewhere).
- **Layout:** Legend, then skills grouped by area, each with paths that use it, prerequisites and status. Rows stack on phone.
- **Layout now:** overview bar of all 29 skills by status, skill tiles grouped by area (status, three-step ladder, reason, lessons), misconceptions spotted, recent answers, Learning Evidence per started lesson.

## Learning Circles

- **Purpose:** Optional learning with friends, private by default.
- **Circles list:** four privacy principles; then, depending on state: "needs the academy server" (with Check again), "sign in to use circles" (link to Settings → Account), or your circles beside "Start a circle" and "Join with a code" (two columns, stacked under 900px).
- **Circle page (/circles/:id):** feed of shares (kind, title, author, date, remove for author or owner) with comments and a comment box; "Share something" composer (My progress / Code / A note) with a preview of exactly what members will see. Side: members (owner can remove), invite code (owner), Leave or Delete with confirmation.
- **States:** loading; not found (also shown to non-members); errors in an alert.

## Welcome check-in

- **Purpose:** Learn stated preferences in four short, skippable steps. Reached from a Home prompt or Settings → Learning profile.
- **Steps:** helpful and frustrating formats; example-first or try-first and detail level; what got in the way before; first project and weekly hours.

## Settings

- **Purpose:** Control appearance, accessibility and your data. Every control shown works.
- **Sections:** Appearance, Accessibility, Learning (daily load, lesson order, hints, solutions, confidence), Learning profile (stated vs. observed; copy, download, reset), AI (simulated or local server, default mentor mode, live status, what is sent), Account and sync (needs the server; sign in or create account; save to account and restore to device, each confirmed; download account data; sign out; delete account with password), Privacy and data, About.
- **Layout:** Section links on the left (desktop) or a scrolling chip row (phone/tablet); one panel per section.
- **States:** "All changes saved" / "Not saved: this browser is blocking storage"; restore preview dialog listing what will be replaced; invalid backup error; delete confirmation dialog; toasts for completed actions.

## Not found

- Plain explanation and a button back to Home.
