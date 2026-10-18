import { createApp } from './app.ts';
import { anthropicClient } from './anthropic.ts';
import { createAcademy } from './academy.ts';
import { openDb } from './db.ts';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Start with: npm run server
 * Optional environment variables (see .env.example):
 *   ANTHROPIC_API_KEY  without it, the server runs and reports "simulated"
 *   AI_MODEL           default claude-opus-5-5
 *   AI_DAILY_LIMIT     default 50 requests per day
 *   AI_MAX_TOKENS      default 1024 output tokens per answer
 *   PORT               default 8787
 *   DATA_DIR           where the database file lives (default server/data)
 *   DATABASE_PATH      full path to the database file (":memory:" for a throwaway one)
 *   STATIC_DIR         serve the built app from this folder (e.g. dist), so one process hosts everything
 *   ALLOWED_ORIGINS    extra comma-separated origins allowed to call the API (your public address)
 *   HOST               address to listen on (default 127.0.0.1; use 0.0.0.0 inside a container)
 *   COOKIE_SECURE      set to 1 when served over HTTPS
 */

const key = process.env.ANTHROPIC_API_KEY?.trim() || null;
const port = Number(process.env.PORT ?? 8787);
const dataDir = process.env.DATA_DIR?.trim() || join(import.meta.dirname, 'data');
const db = openDb(process.env.DATABASE_PATH?.trim() || join(dataDir, 'academy.db'));
const app = createApp({
  client: key ? anthropicClient(key) : null,
  model: process.env.AI_MODEL?.trim() || 'claude-opus-5-5',
  dailyLimit: Math.max(1, Number(process.env.AI_DAILY_LIMIT ?? 50)),
  maxTokens: Math.min(4096, Math.max(64, Number(process.env.AI_MAX_TOKENS ?? 1024))),
  allowedOrigins: [
    'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173',
    `http://localhost:${port}`, `http://127.0.0.1:${port}`,
    ...(process.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean),
  ],
  // Serves the built app too when dist/ exists, so `npm run build` then `npm start` hosts everything on one address.
  staticDir: process.env.STATIC_DIR?.trim() || (existsSync(join(import.meta.dirname, '..', 'dist', 'index.html')) ? join(import.meta.dirname, '..', 'dist') : undefined),
  log: (line) => console.log(`[ai] ${new Date().toISOString()} ${line}`),
  academy: createAcademy({ db, secureCookies: process.env.COOKIE_SECURE === '1', signupsPerHour: Number(process.env.SIGNUPS_PER_HOUR ?? 10) }),
});

await app.listen(port, process.env.HOST?.trim() || '127.0.0.1');
console.log(`Academy server on http://${process.env.HOST?.trim() || '127.0.0.1'}:${port}. AI: ${key ? 'live (key loaded)' : 'simulated (no key)'}. Data: ${dataDir}`);
