# Atelier Academy

A personal, project-based academy for learning software engineering and AI systems engineering, built as a real application you can use, read and improve.

> **Status: Phase 4 complete (four distinct paths with milestones).** See [ROADMAP.md](ROADMAP.md) for what is built, what is planned, and what comes next. "Atelier Academy" is a working name; change it in `src/app/navigation.ts` and `index.html`.

## What works today

- **Code Lab**: write real HTML, CSS and JavaScript with a proper editor, live preview, console and plain-language errors that link to the line. Code runs in a sealed sandbox, and runaway loops are stopped automatically. exercises (build, debug, predict, refactor) with automatic checks
- **Certification recommendations**: 12 certifications (freeCodeCamp, GitHub, Anthropic, AWS, Microsoft, Meta, IAAP, CompTIA) matched to your demonstrated skills, with cost, format, effort, what else to prepare, and sources. You're prompted when you've demonstrated every skill one needs
- **Four distinct project paths**, each with its own lessons and Code Lab projects and a first milestone that ends in working software: a responsive profile page (Website), a transaction tracker with a monthly summary (Finance), a board where pieces move with clicks (Chess), and a simulated lead workflow that answers only from approved knowledge (Automation)
- **Milestone tracking** with time estimates at your weekly hours, a "Make this my path" choice, and switching paths without losing anything
- **18 lessons**: 10 shared foundations plus 2 per path
- **17 Code Lab exercises** with automatic checks, plus a playground
- **Skill map**: all 31 skills arranged by what builds on what, colored by your status
- **Six activity types**: predict the output, find the bug, fill the gap, put steps in order, check your understanding, explain it yourself
- **Everything you do is saved**: answers, hints used, confidence, solutions shown, your explanations
- **Mastery calculated from evidence**: five statuses from "Not introduced" to "Retained over time", each with a plain-language reason
- **Spaced review**: a new question on each finished lesson after 2, 7, 21 and 60 days; a missed review comes back the next day
- **Home recommends what to do next, and says why**: due reviews, then retries, then unfinished lessons, then the next lesson whose prerequisites you've finished
- **Learning Evidence export** (Markdown or JSON) and a prompt to get quizzed by a separate, independent AI
- **Learning profile**: what you say helps, kept separate from what your activity shows
- **Learning settings**: daily load, lesson order (explain first or try first), when hints and solutions appear, confidence check
- **Illustrated, responsive design**: a drawn scene for each project and a concept picture for each lesson, highlighted code panels, light and dark themes
- Search, glossary (26 terms), project notes (design, known issues, improvements), appearance and accessibility settings, backup and restore, delete local data

Anything not built yet is marked with a **Phase N** label in the app. Nothing pretends to work.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer (this was built with Node 22).

```bash
npm install          # once: downloads the libraries the app uses
npm run dev          # starts the app; open the address it prints (usually http://localhost:5173)
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the unit tests (logic and components) |
| `npm run typecheck` | Checks the TypeScript types without running anything |
| `npm run build` | Builds the production version into `dist/` |
| `npm run test:e2e` | Runs the browser tests at desktop, tablet and phone sizes. Run `npx playwright install chromium` once first. |

## How the code is organized

```
src/
  app/            The shell: navigation, routing, search, toasts
  core/           Logic with no screens: storage, settings, backups
  content/        Curriculum as plain data: paths, skills, glossary, lessons
  design/         Design tokens (colors, type, spacing) and reusable components
  features/       One folder per destination (home, learn, settings, …)
e2e/              Browser tests (Playwright)
docs/SCREENS.md   Screen inventory: purpose, actions, layout and states of each screen
```

Good files to read first:

1. `src/design/tokens.css`: every color, size and font in one place, including dark mode
2. `src/core/persistence/storage.ts`: why the app never calls `localStorage` directly
3. `src/core/backup/backup.ts`: how an import is checked before anything is written
4. `src/content/schema.ts` and `src/content/lessons/functions.ts`: the lesson format, and a complete lesson written in it
5. `src/core/learning/mastery.ts`: the rules that turn your answers into mastery statuses
6. `src/core/lab/buildDocument.ts`: how your lab code is run safely

## Privacy

Everything stays in your browser: settings, your learning profile and your learning records. There is no server, account, analytics or AI provider yet. Settings → Privacy and data lists exactly what is stored, and backups include all of it.

## Project documents

- [ROADMAP.md](ROADMAP.md): phases, current status and next steps
- [DECISIONS.md](DECISIONS.md): architecture decisions and why they were made
- [docs/SCREENS.md](docs/SCREENS.md): screen inventory
