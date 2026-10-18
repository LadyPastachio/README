# Deploying the academy

Three ways to run it, from simplest to most capable. None needs paid services: the app runs without an AI key, and the server needs only Node.js.

## 1. Just the learning app, as static files

Everything except accounts, circles and live AI runs in the browser.

```bash
npm ci
npm run build        # creates dist/
```

Upload the contents of `dist/` to any static host (GitHub Pages, or any web server or host that serves files). It works from a subfolder and needs no server configuration, because pages use `#/` addresses and asset paths are relative ([D3](DECISIONS.md)). Progress is saved in each visitor's browser.

For a single self-contained HTML file (as used for the shared preview): `npm run build:preview` builds one script instead of several, which a small script then inlines into one page.

## 2. The whole academy on your own computer

```bash
npm ci
npm run build
npm start            # http://localhost:8787
```

The academy server serves the built app and the API on one address. Accounts, saved progress and circles are stored in `server/data/academy.db`. Add an API key in `.env.local` for live AI (see the README); without one, AI stays simulated.

**Friends on the same Wi-Fi:** start it with `HOST=0.0.0.0 ALLOWED_ORIGINS=http://<your-computer's-local-IP>:8787 npm start` and share that address. Only do this on a network you trust: without HTTPS, passwords travel unencrypted over the local network.

## 3. On a server, with a container

```bash
docker build -t atelier-academy .
docker run -d --name academy -p 8787:8787 \
  -v academy-data:/data \
  -e ALLOWED_ORIGINS=https://academy.example.org \
  -e COOKIE_SECURE=1 \
  atelier-academy
```

Checked on 2026-10-18: the image builds, serves the app with its security headers, keeps accounts across restarts in the `/data` volume, and runs as the unprivileged `node` user.

Put it behind a reverse proxy that provides HTTPS. For example, with Caddy (which obtains certificates automatically), a complete `Caddyfile` is:

```
academy.example.org {
  reverse_proxy localhost:8787
}
```

Then:
- Set `ALLOWED_ORIGINS` to your public address and `COOKIE_SECURE=1`, so session cookies are only sent over HTTPS.
- Run **one** instance. Rate limits live in memory and SQLite suits a single process.
- **Back up** the database: stop the container and copy the volume, or use SQLite's online backup (`sqlite3 /data/academy.db ".backup /backup/academy.db"`) from a container with the sqlite3 tool. Test restoring once.
- To enable live AI, pass `-e ANTHROPIC_API_KEY=...` (or an env file kept out of version control) and keep `AI_DAILY_LIMIT` low.

Any host that runs a container with a persistent disk works. Some providers have free tiers; check their current terms, especially whether disks persist across restarts, because the database lives there.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | 8787 | Port to listen on |
| `HOST` | 127.0.0.1 | Address to listen on (`0.0.0.0` in a container) |
| `STATIC_DIR` | `dist/` if it exists | Folder with the built app to serve |
| `DATA_DIR` | `server/data` | Folder for the SQLite database |
| `DATABASE_PATH` | `DATA_DIR/academy.db` | Full database path (`:memory:` for a throwaway one) |
| `ALLOWED_ORIGINS` | localhost addresses | Extra comma-separated origins allowed to call the API |
| `COOKIE_SECURE` | off | Set to `1` behind HTTPS |
| `SIGNUPS_PER_HOUR` | 10 | New accounts per address per hour |
| `ANTHROPIC_API_KEY` | none | Enables live AI; without it, AI is simulated |
| `AI_MODEL` | `claude-opus-5-5` | Model for live AI (`claude-haiku-5-5` is much cheaper) |
| `AI_DAILY_LIMIT` | 50 | AI requests per day |
| `AI_MAX_TOKENS` | 1024 | Longest AI answer |

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request: type check, unit and server tests, the browser tests at desktop, tablet and phone sizes against the production server (with its security headers), and a container build.
