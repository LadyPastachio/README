# Security

How the academy protects learners and their data, what was reviewed for the 1.0 release, and what is still open. Report a problem by opening a private security advisory on the repository rather than a public issue.

## What needs protecting

| Asset | Where it lives | Main risks |
| --- | --- | --- |
| Progress, notes, code, learning profile | The browser (localStorage); optionally the learner's account on the academy server | Loss, silent overwrite, exposure to other people |
| Account passwords and sessions | Academy server (SQLite) | Password reuse attacks, stolen sessions, brute force |
| Circle content (shares, comments) | Academy server | Being read or changed by people outside the circle |
| Model API key | Server environment only | Exposure in the browser or logs; runaway spending |
| The learner's machine | — | Learner code (or pasted code) escaping the Code Lab sandbox |

## Defenses, by area

**Code Lab sandbox** ([D14](DECISIONS.md)). Learner HTML, CSS and JavaScript run in an iframe with `sandbox="allow-scripts allow-modals allow-forms"` and no `allow-same-origin`, so the browser gives it an opaque origin: it can't read the app, its storage or its cookies. A Content-Security-Policy inside the frame blocks every network request and form submission. Loops that run over a second are stopped. Browser tests try to reach the parent page, storage and the network from learner code and confirm each fails.

**SQL** ([D25](DECISIONS.md)). Queries run in SQLite compiled to WebAssembly, inside a Web Worker with no access to the page. Every run uses a fresh in-memory copy of the practice data. Runaway queries are stopped after 2 seconds by terminating the worker.

**API key** ([D22](DECISIONS.md)). Read from the server's environment (`.env.local`, ignored by git). Vite only exposes variables starting with `VITE_`, and none do. The browser can choose only a task and a mentor mode; system prompts are built on the server, learner text is wrapped as data, input is validated and size-limited, answers are length-capped, and a daily request limit stops runaway costs. Logs record sizes and timings, never content. Provider errors are mapped to safe messages that never include the key.

**Accounts and sessions** ([D27](DECISIONS.md)). Passwords: at least 10 characters, hashed with scrypt (N=16384, r=8, p=1) and a random salt each. Login failures are limited to 5 per email per 15 minutes; sign-ups to 10 per address per hour. Unknown emails and wrong passwords get the same message and take the same time (a dummy hash is checked). Sessions are 256-bit random tokens in an `HttpOnly; SameSite=Strict; Path=/api` cookie (add `Secure` with `COOKIE_SECURE=1` over HTTPS); only the token's SHA-256 hash is stored, and sessions expire after 30 days. Deleting an account requires the password.

**Cross-site requests.** Every state-changing API request must carry an `Origin` from the allowed list and a JSON content type, and no CORS headers are sent. Together with SameSite=Strict cookies, this stops other websites from acting as a signed-in learner.

**Authorization** ([D28](DECISIONS.md)). All rules are in one file (`server/academy.ts`) and each has a test that tries to break it as another user: you can only see your own account and saved progress; circle content is visible only to members (outsiders get 404, so circle ids can't be probed); only owners invite, remove members or delete circles; shares are removable by their author or the owner, comments only by their author; members see display names, never emails. Invite codes are random, stored hashed, expire after 7 days and work 5 times.

**Input validation everywhere** ([D6](DECISIONS.md)). Settings, backups, lessons, exercises, API requests and model outputs are parsed with Zod schemas. Restores and account downloads show what will change and ask before writing.

**Response headers** (`server/static.ts`). When the server hosts the app: a Content-Security-Policy (`default-src 'self'`, no third-party origins, no `unsafe-eval`, `object-src 'none'`, `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin` and a restrictive `Permissions-Policy`. The whole browser test suite runs against this exact setup. Static files are resolved strictly inside the build folder; traversal attempts are tested.

**Data deletion and export.** "Delete local data" clears the browser; deleting an account cascades through sessions, saved progress, owned circles (with their shares and comments), memberships, and the person's shares and comments elsewhere. "Download my account data" exports everything stored for the account.

## Review for 1.0 (2026-10-18)

Done:
- `npm audit`: 0 known vulnerabilities in runtime and development dependencies.
- No use of `eval`, `new Function` or `dangerouslySetInnerHTML` in the app; React escapes all text.
- Automated accessibility audit (axe-core, WCAG 2.1 AA) on 23 screens in both themes: 0 violations. Not a security item, but part of the release review.
- Reviewed every server route for authentication, authorization, validation and size limits; added tests for each rule.
- Confirmed no secrets in the repository or its history (`.env*` ignored except `.env.example`, which has no values).

Known trade-offs and open items:
- **CSP allows inline scripts.** The Code Lab's sandboxed preview is a `srcdoc` iframe, which inherits the page's policy, and learner code is inline by nature. The sandbox's opaque origin and its own stricter CSP are what protect the app. Moving the preview to a separate origin would allow removing `'unsafe-inline'`.
- **No email verification or password reset** (needs an email service). A forgotten password means a lost account (local progress is unaffected).
- **Rate limits are in memory**, so they reset when the server restarts and don't coordinate across several server processes.
- **The webhook "signature" in the Code Lab exercise is a teaching stand-in**, clearly labeled; real services use HMAC-SHA256.
- **Node's built-in SQLite is marked experimental** by Node.js.
- **Exercise checks run in the same sandbox as learner code**, so a learner can fool them on purpose. That only affects their own mastery record.
