# Atelier Academy

A personal, project-based academy for learning software engineering and AI systems engineering, built as a real application you can use, read and improve.

> **Status: 1.0. All nine phases complete.** See [ROADMAP.md](ROADMAP.md) for what is built, what is planned, and what comes next. "Atelier Academy" is a working name; change it in `src/app/navigation.ts` and `index.html`.

## What works today

- **Optional accounts** on the academy server you run: save your progress to your account and restore it on another device (each step shows what will change first), download your account data, delete your account
- **Private learning circles**: create a circle, invite friends with a one-time code, share your progress summary, Code Lab code or a note on purpose, and comment on each other's work. Members see names, never emails; only the owner can invite or remove people
- **AI Workshop**: a mentor with five modes (guide me, explain, review code, debug with me, quiz me), a prompt coach, a request and cost inspector with a temperature demo, a structured-output lab with an evaluation table, a step-by-step tool-calling walkthrough, and a prompt-injection lab. Everything works with no paid API, clearly labeled **Simulated**
- **Optional real model**: a small local server holds your API key (never the browser), with a daily limit and capped answer length. Answers from it are labeled **Live**
- **Code review in the Code Lab**: rule checks for likely bugs, security and accessibility problems, linked to the line
- **Code Lab**: write real HTML, CSS and JavaScript with a proper editor, live preview, console and plain-language errors that link to the line. Code runs in a sealed sandbox, and runaway loops are stopped automatically. exercises (build, debug, predict, refactor) with automatic checks
- **Certification recommendations**: 12 certifications (freeCodeCamp, GitHub, Anthropic, AWS, Microsoft, Meta, IAAP, CompTIA) matched to your demonstrated skills, with cost, format, effort, what else to prepare, and sources. You're prompted when you've demonstrated every skill one needs
- **Four distinct project paths**, each with its own lessons and Code Lab projects and milestones that end in working software. First milestones: a responsive profile page (Website), a transaction tracker with a monthly summary (Finance), a board where pieces move with clicks (Chess), and a simulated lead workflow that answers only from approved knowledge (Automation)
- **Milestone tracking** with time estimates at your weekly hours, a "Make this my path" choice, and switching paths without losing anything
- **32 lessons**: 15 shared foundations (including testing and SQL), plus path lessons: Website 4, Finance 3, Chess 3, Automation 7
- **32 Code Lab exercises** with automatic checks, plus a playground, grouped by path
- **SQL in the Code Lab**: real SQLite (compiled to WebAssembly) in a background worker; every run uses a fresh copy of the practice data, and runaway queries are stopped after 2 seconds
- **Tests that are tested**: some exercises run your tests against deliberately broken versions of the code (mutation testing)
- **Second milestones for every path** and an Automation capstone: a white-label follow-up agent with approved knowledge only, human handoff, idempotency, tenant isolation and logs, on synthetic data
- **Skill map**: all 31 skills arranged by what builds on what, colored by your status
- **Lessons that adapt to you**: "See it another way" controls on every lesson (simpler, analogy, step by step, another example, diagram, compare, experiment in the Code Lab, transfer challenge). What you said helps, or what has actually helped you, opens automatically, with a note saying why. After two misses, a different explanation is offered
- **A short "how do you learn" check-in** (skippable), and occasional "does this match?" questions about patterns in your learning
- **Six activity types**: predict the output, find the bug, fill the gap, put steps in order, check your understanding, explain it yourself
- **Everything you do is saved**: answers, hints used, confidence, solutions shown, your explanations
- **Mastery calculated from evidence**: five statuses from "Not introduced" to "Retained over time", each with a plain-language reason
- **Spaced review**: a new question on each finished lesson after 2, 7, 21 and 60 days; a missed review comes back the next day
- **Home recommends what to do next, and says why**: due reviews, then retries, then unfinished lessons, then the next lesson whose prerequisites you've finished
- **Learning Evidence export** (Markdown or JSON) and a prompt to get quizzed by a separate, independent AI
- **Learning profile**: what you say helps, kept separate from what your activity shows
- **Learning settings**: daily load, lesson order (explain first or try first), when hints and solutions appear, confidence check
- **Illustrated, responsive design**: a drawn scene for each project and a concept picture for each lesson, highlighted code panels; warm off-white and deep teal, with a teal-black dark mode
- **Accessible**: automated WCAG 2.1 AA audit of 23 screens in both themes with no violations, keyboard support throughout, screen-reader labels and announcements
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
| `npm run server` | Starts the optional academy server on port 8787: accounts, sync, circles and live AI (see below) |
| `npm start` | After `npm run build`: the whole academy (app and server) on http://localhost:8787 |
| `npm run build:preview` | Builds a single script, for the one-file shareable preview |

### The academy server (optional)

`npm run server` starts one small server for everything that can't live in the browser alone: accounts, saved progress, learning circles and live AI. Its data is a SQLite file in `server/data/` (ignored by git), using Node's built-in SQLite, so there is nothing else to install. Passwords are hashed with scrypt; sessions use HttpOnly, SameSite=Strict cookies; requests from other websites are refused. To share circles with friends, the server has to be reachable by them (see Phase 9 for hosting).

### Connecting a real model (optional)

The app works fully without this. To get live answers:

1. Copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`. `.env.local` is ignored by git, and the browser never sees it (Vite only exposes variables starting with `VITE_`).
2. Run `npm run server` in one terminal and `npm run dev` in another.
3. In the app, open Settings → AI and choose **Local server**.

The server only listens on your own computer (127.0.0.1), refuses other websites, builds the system prompts itself (the browser can only pick a mode), stops after 50 requests a day by default (`AI_DAILY_LIMIT`), caps answers at 1,024 tokens (`AI_MAX_TOKENS`), and logs request sizes but never their content. It uses `claude-opus-5-5` by default; set `AI_MODEL=claude-haiku-5-5` for a much cheaper model. Each request costs money on your Anthropic account.

## How the code is organized

```
src/
  app/            The shell: navigation, routing, search, toasts
  core/           Logic with no screens: storage, settings, backups
  content/        Curriculum as plain data: paths, skills, glossary, lessons
  design/         Design tokens (colors, type, spacing) and reusable components
  features/       One folder per destination (home, learn, settings, …)
server/           The optional local AI server (holds the API key)
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
7. `server/app.ts`: how the AI server keeps the key safe and limits use

## Privacy

Everything stays in your browser by default: settings, your learning profile and your learning records. There is no analytics. Data leaves the browser only when you choose: AI requests in Local server mode, saving progress to your account, and items you share with a circle. Settings → Privacy and data lists exactly what goes where, and you can delete your account and everything on it. Settings → Privacy and data lists exactly what is stored, and backups include all of it.

## Project documents

- [ROADMAP.md](ROADMAP.md): phases, current status and next steps
- [DECISIONS.md](DECISIONS.md): architecture decisions and why they were made
- [docs/SCREENS.md](docs/SCREENS.md): screen inventory
- [DEPLOY.md](DEPLOY.md): running it as static files, on your computer, or in a container behind HTTPS
- [SECURITY.md](SECURITY.md): threat model, defenses, the 1.0 review and open items
