import { createApp } from './app.ts';
import { anthropicClient } from './anthropic.ts';
import { createAcademy } from './academy.ts';
import { openDb } from './db.ts';
import { join } from 'node:path';

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
  allowedOrigins: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173', 'http://127.0.0.1:4173'],
  log: (line) => console.log(`[ai] ${new Date().toISOString()} ${line}`),
  academy: createAcademy({ db, secureCookies: process.env.COOKIE_SECURE === '1', signupsPerHour: Number(process.env.SIGNUPS_PER_HOUR ?? 10) }),
});

await app.listen(port);
console.log(`Academy server on http://127.0.0.1:${port}. AI: ${key ? 'live (key loaded)' : 'simulated (no key)'}. Data: ${dataDir}`);
