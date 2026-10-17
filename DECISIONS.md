# Architecture decisions

Short records of decisions that shape the project. Each says what was decided, why, and how hard it would be to change. When a decision changes, add a new entry rather than editing the old one.

---

## D1. React + TypeScript + Vite

**Decision:** Build the app with React 19, TypeScript (strict mode) and Vite.

**Why:** React is the most widely used interface library, so documentation, examples and AI help are plentiful, and it's a curriculum topic in Path A. TypeScript catches mistakes before code runs and documents the shape of data. Vite starts instantly and needs little configuration.

**Alternatives considered:** Next.js (adds server rendering we don't need yet, and more concepts at once); Svelte (pleasant, but a smaller ecosystem and less aligned with the curriculum).

**Cost to reverse:** High. This is the foundation.

## D2. Plain CSS with design tokens, no CSS framework

**Decision:** Styles are ordinary CSS files. All colors, spacing, type and radii are CSS variables in `src/design/tokens.css`. Settings change attributes on `<html>` (`data-theme`, `data-accent`, `data-density`, …) and the CSS reacts.

**Why:** You're learning CSS, so the styles should be readable CSS. Tokens make dark mode, accents, density and high contrast one-place changes.

**Alternatives considered:** Tailwind (fast, but hides CSS behind class names a beginner must translate); CSS-in-JS (extra runtime and concepts).

**Cost to reverse:** Medium. Components would need restyling, but the tokens carry over.

## D3. Hash-based URLs (`#/learn`)

**Decision:** Use React Router's hash router.

**Why:** Works on any static host (GitHub Pages, a shared preview, a folder on disk) with no server configuration, because the server only ever serves `index.html`.

**Trade-off:** URLs look less clean, and in-page `#anchor` scrolling needs a small helper (`src/app/useScrollToHash.ts`).

**Cost to reverse:** Low. Switch to `createBrowserRouter` and configure the host to serve `index.html` for every path.

## D4. All saved data goes through a storage interface

**Decision:** Code never calls `localStorage` directly. It uses the `StorageAdapter` interface (`read`, `write`, `remove`, `keys`) in `src/core/persistence/storage.ts`. The browser version is wrapped so blocked or full storage reports failure instead of crashing. Tests use an in-memory version.

**Why:** Phase 8 adds accounts and server storage; swapping the adapter shouldn't mean touching every feature. It also turns "storage was blocked" into a visible state ("Not saved") instead of silent data loss.

**Next step:** Learning records (Phase 2) will likely need asynchronous storage (IndexedDB, later a server). The interface will gain async methods then. This is a planned, small migration.

**Cost to reverse:** Low.

## D5. Curriculum is data, separate from screens

**Decision:** Paths, skills, glossary terms and lessons live in `src/content/` as typed data. Screens render whatever the data contains.

**Why:** Lessons can be written, reviewed and tested without touching interface code. `src/content/content.test.ts` already checks that every skill reference exists and that prerequisites contain no cycles.

**Next step:** Phase 2 adds runtime schemas (Zod) for lessons so new or generated lessons are validated automatically, and gives each lesson its own file.

**Cost to reverse:** Medium.

## D6. Validate everything that comes from outside

**Decision:** Settings and backups are parsed with Zod schemas. Every settings field has a default, and invalid fields fall back individually. Backup imports are checked, summarized for the person, and written only after confirmation. Unknown keys are skipped, and backups from newer app versions are refused with an explanation.

**Why:** Stored data can be old, corrupted or hand-edited. The app should repair what it can and never silently overwrite progress.

**Cost to reverse:** Low, but don't.

## D7. Mastery is a status, not a percentage

**Decision:** Skills have one of five statuses: Not introduced, Practiced with support, Needs another challenge, Demonstrated independently, Retained over time. There are no completion percentages, streaks or points.

**Why:** Opening a lesson isn't learning. Statuses based on evidence (independent work, hints used, recall later) describe what you can actually do.

**Cost to reverse:** High once learning records exist, which is why it's decided now.

## D8. No server and no AI provider until they're needed

**Decision:** Phases 0–5 run entirely in the browser. A small server arrives in Phase 6 so model API keys never reach the browser. Accounts and a database arrive in Phase 8.

**Why:** Free to run, nothing to secure yet, fewer moving parts. AI features start with clearly labeled simulated responses.

## D9. Self-hosted fonts

**Decision:** Fonts (Bricolage Grotesque for headings, Instrument Sans for text, JetBrains Mono for code) are npm packages bundled with the app.

**Why:** Works offline, sends no requests to third parties, and looks the same everywhere.

**Cost to reverse:** Low.

## D10. Mastery is calculated from an event log, not stored

**Decision:** Every answer, solution reveal and explanation is saved as an event (`src/core/learning/records.ts`). Lesson status, skill status, review dates, recommendations and observations are pure functions of that log (`mastery.ts`, `schedule.ts`, `recommend.ts`, `observations.ts`).

**Why:** Every status can be traced back to the attempts behind it, which is what Learning Evidence needs. Changing a rule (for example, how many retries still count as independent) immediately applies to past records with no migration. Pure functions are easy to test: 38 tests cover these rules.

**Rules in short:** first try with no hints → independent (one retry allowed); hints or more retries → practiced with support; solution shown or unsolved → needs another challenge; a spaced review passed at least 2 days later → retained; a missed review → needs another challenge until relearned. The most recent visit to an activity is what counts, so relearning works.

**Cost to reverse:** Medium. The log format is versioned and validated per entry.

## D11. Learning records stay in browser storage for now

**Decision:** Records use the same synchronous storage adapter as settings, capped at 5,000 events (about 2 MB). This updates the note in D4: moving to IndexedDB isn't needed yet.

**Why:** Each event is small, the cap is far above a year of daily use, and staying synchronous keeps the code simpler while you're learning it. Records are re-read before each save so two open tabs don't erase each other's work.

**When to revisit:** When accounts arrive (Phase 8) or the cap gets close. The adapter interface means only the storage layer changes.

## D12. Illustrations are drawn in code

**Decision:** Project and lesson illustrations are SVG components (`src/design/illustrations/`) that use the theme's color tokens. No image files or stock art.

**Why:** They adapt to light, dark and high-contrast themes automatically, stay sharp at any size, weigh almost nothing, and each one shows the concept it illustrates (indexed cells for arrays, a fork for conditions) rather than decorating.

**Cost to reverse:** Low.

## D13. Lessons are validated at load time

**Decision:** Every lesson file is parsed with the Zod schema in `src/content/schema.ts` when the app starts. An invalid lesson throws an error naming the lesson and the problem. The test suite checks the same, plus cross-references (skills, prerequisites, review questions that differ from lesson questions).

**Why:** Content will grow in batches, sometimes drafted with AI help. Mistakes like two correct options, a fill-in with no gap, or a duplicate id should fail loudly before anyone sees a broken lesson.
