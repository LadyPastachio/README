import { simulate } from './simulated';
import type { AIProvider, AIRequest, AIResponse, AIStatus } from './types';

/**
 * The browser side of real model calls. It talks only to our own local
 * server (/api/ai/...), which holds the key. If the server is missing or
 * fails, it answers in simulated mode and says why.
 */

type Fetch = typeof fetch;

export const OFFLINE_STATUS: AIStatus = { live: false, model: null, remainingToday: null, dailyLimit: null, reason: 'Simulated mode is on. Nothing is sent anywhere.' };

export async function fetchStatus(f: Fetch = fetch): Promise<AIStatus> {
  try {
    const res = await f('api/ai/status', { headers: { accept: 'application/json' } });
    if (!res.ok) return { ...OFFLINE_STATUS, reason: `The local AI server isn't reachable (status ${res.status}). Start it with npm run server.` };
    const s = (await res.json()) as Partial<AIStatus> & { reason?: string | null };
    return { live: !!s.live, model: s.model ?? null, remainingToday: s.remainingToday ?? null, dailyLimit: s.dailyLimit ?? null, reason: s.live ? 'Connected to the local server. Responses are live.' : (s.reason ?? 'The server has no API key, so responses are simulated.') };
  } catch {
    return { ...OFFLINE_STATUS, reason: 'The local AI server isn\'t running. Start it with npm run server, or switch to simulated mode.' };
  }
}

const MAX = 4000;

/** Folds code into the context string the server accepts, within its size limit. */
export function toServerBody(req: AIRequest) {
  const code = req.code
    ? (['html', 'css', 'js'] as const)
        .filter((k) => req.code![k].trim())
        .map((k) => `--- ${k === 'js' ? 'script.js' : k === 'css' ? 'style.css' : 'index.html'} ---\n${req.code![k]}`)
        .join('\n')
    : '';
  const context = [req.context ?? '', code].filter(Boolean).join('\n\n').slice(0, MAX);
  return { task: req.task, ...(req.task === 'mentor' ? { mode: req.mode ?? 'socratic' } : {}), input: req.input.slice(0, MAX), ...(context ? { context } : {}) };
}

export function serverProvider(f: Fetch = fetch): AIProvider {
  return {
    id: 'local-server',
    async complete(req): Promise<AIResponse> {
      const fallback = (notice: string): AIResponse => ({ ...simulate(req), notice });
      let res: Response;
      try {
        res = await f('api/ai/complete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(toServerBody(req)) });
      } catch {
        return fallback('The local AI server isn\'t reachable, so this answer is simulated.');
      }
      const body = (await res.json().catch(() => ({}))) as { text?: string; model?: string; inputTokens?: number; outputTokens?: number; remainingToday?: number; error?: string };
      if (!res.ok || typeof body.text !== 'string') return fallback(`${body.error ?? `The server answered with status ${res.status}.`} This answer is simulated.`);
      return { text: body.text, source: 'live', model: body.model, usage: { input: body.inputTokens ?? 0, output: body.outputTokens ?? 0 }, remainingToday: body.remainingToday };
    },
  };
}
