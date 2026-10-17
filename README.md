# Atelier Academy

A personal, project-based academy for learning software engineering and AI systems engineering, built as a real application you can use, read and improve.

> **Status: Phase 1 complete (design system and navigation).** See [ROADMAP.md](ROADMAP.md) for what is built, what is planned, and what comes next. "Atelier Academy" is a working name; change it in `src/app/navigation.ts` and `index.html`.

## What works today

- All eight destinations: Home, Learn, Projects, Code Lab, AI Workshop, My Progress, Learning Circles, Settings
- Responsive navigation: sidebar on desktop, icon rail on tablet, bottom bar + "More" on phones
- Search across pages, paths, skills, the lesson and glossary terms (`/` or `Ctrl K`)
- A glossary of 26 plain-language terms
- One complete sample lesson with a diagram and three working activities (answers are not saved yet)
- The four project paths with provisional timelines and milestones
- A shared skills framework (29 skills) linking all four paths
- Settings that all work: theme, accent, density, editor font and size, text size, reduced motion, high contrast
- Backup (download or copy), validated restore with a confirmation step, delete local data, diagnostic report

Anything not built yet is marked **"Planned for Phase N"** in the app. Nothing pretends to work.

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
4. `src/content/lessons/how-the-web-works.ts`: what a complete lesson looks like as data

## Privacy

Everything stays in your browser. There is no server, account, analytics or AI provider yet. Settings → Privacy and data lists exactly what is stored.

## Project documents

- [ROADMAP.md](ROADMAP.md): phases, current status and next steps
- [DECISIONS.md](DECISIONS.md): architecture decisions and why they were made
- [docs/SCREENS.md](docs/SCREENS.md): screen inventory
