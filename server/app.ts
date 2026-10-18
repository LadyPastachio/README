import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { z } from 'zod';
import { MODES, TASKS, systemPrompt, userContent } from './prompts.ts';

/**
 * A tiny local server for real model calls. It exists so the API key stays
 * here and never reaches the browser. The model client is injected, so tests
 * use a fake and never spend money.
 */

export interface ModelReply {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  stopReason: string | null;
}

/** What the server needs from a model provider. Swapping providers means writing one of these. */
export interface ModelClient {
  complete(args: { model: string; system: string; user: string; maxTokens: number }): Promise<ModelReply>;
}

export interface ServerOptions {
  client: ModelClient | null;
  model: string;
  /** Requests allowed per day before the server refuses (protects your bill). */
  dailyLimit: number;
  maxTokens: number;
  /** Browser origins allowed to call the server. */
  allowedOrigins: string[];
  now?: () => Date;
  log?: (line: string) => void;
}

export const requestSchema = z
  .object({
    task: z.enum(TASKS),
    mode: z.enum(MODES).optional(),
    input: z.string().trim().min(1, 'input is empty').max(4000, 'input is longer than 4,000 characters'),
    context: z.string().max(4000, 'context is longer than 4,000 characters').optional(),
  })
  .strict();

const MAX_BODY = 16 * 1024;

export class UsageCounter {
  private day = '';
  private count = 0;
  private limit: number;
  private now: () => Date;
  constructor(limit: number, now: () => Date) {
    this.limit = limit;
    this.now = now;
  }
  private roll() {
    const today = this.now().toISOString().slice(0, 10);
    if (today !== this.day) {
      this.day = today;
      this.count = 0;
    }
  }
  remaining(): number {
    this.roll();
    return Math.max(0, this.limit - this.count);
  }
  take(): boolean {
    this.roll();
    if (this.count >= this.limit) return false;
    this.count++;
    return true;
  }
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_BODY) tooLarge = true; // keep draining so the reply still reaches the caller
      else chunks.push(c);
    });
    req.on('end', () => resolve(tooLarge ? null : Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Maps provider errors to messages that are safe to show (never the key, never raw internals). */
export function friendlyError(err: unknown): { status: number; message: string } {
  const status = typeof err === 'object' && err !== null && 'status' in err ? Number((err as { status: unknown }).status) : 0;
  if (status === 401 || status === 403) return { status: 502, message: 'The provider rejected the API key. Check ANTHROPIC_API_KEY on the server.' };
  if (status === 429) return { status: 429, message: 'The provider is rate limiting requests. Wait a minute and try again.' };
  if (status === 400) return { status: 502, message: 'The provider refused the request as invalid.' };
  if (status >= 500) return { status: 502, message: 'The provider had a temporary problem. Try again shortly.' };
  return { status: 502, message: 'Could not reach the model provider.' };
}

export function createApp(opts: ServerOptions) {
  const now = opts.now ?? (() => new Date());
  const usage = new UsageCounter(opts.dailyLimit, now);
  const log = opts.log ?? (() => {});

  async function handle(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const origin = req.headers.origin;
    // Other websites open in your browser could otherwise call this server. No CORS headers are sent, and unknown origins are refused.
    if (origin && !opts.allowedOrigins.includes(origin)) return send(res, 403, { error: 'Origin not allowed.' });

    if (req.method === 'GET' && url.pathname === '/api/ai/status') {
      return send(res, 200, {
        live: opts.client !== null,
        provider: opts.client ? 'anthropic' : null,
        model: opts.client ? opts.model : null,
        remainingToday: usage.remaining(),
        dailyLimit: opts.dailyLimit,
        reason: opts.client ? null : 'No API key is set on the server, so responses are simulated.',
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/ai/complete') {
      if (!(req.headers['content-type'] ?? '').startsWith('application/json')) return send(res, 415, { error: 'Send JSON.' });
      if (Number(req.headers['content-length'] ?? 0) > MAX_BODY) {
        res.setHeader('Connection', 'close');
        return send(res, 413, { error: 'Request is too large.' });
      }
      const raw = await readBody(req);
      if (raw === null) return send(res, 413, { error: 'Request is too large.' });
      let json: unknown;
      try {
        json = JSON.parse(raw);
      } catch {
        return send(res, 400, { error: 'Request body is not valid JSON.' });
      }
      const parsed = requestSchema.safeParse(json);
      if (!parsed.success) return send(res, 400, { error: parsed.error.issues.map((i) => i.message).join('; ') });
      if (!opts.client) return send(res, 503, { error: 'No API key is set on the server.' });
      if (!usage.take()) return send(res, 429, { error: `Daily limit of ${opts.dailyLimit} requests reached. It resets at midnight UTC.` });

      const { task, mode, input, context } = parsed.data;
      const started = Date.now();
      try {
        const reply = await opts.client.complete({ model: opts.model, system: systemPrompt(task, mode), user: userContent(input, context), maxTokens: opts.maxTokens });
        // Metadata only: what was asked is never written to the log.
        log(`ok task=${task} mode=${mode ?? '-'} in=${reply.inputTokens} out=${reply.outputTokens} ms=${Date.now() - started}`);
        return send(res, 200, { ...reply, remainingToday: usage.remaining() });
      } catch (err) {
        const f = friendlyError(err);
        log(`error task=${task} status=${f.status}`);
        return send(res, f.status, { error: f.message });
      }
    }

    return send(res, 404, { error: 'Not found.' });
  }

  return {
    usage,
    handle,
    listen(port: number, host = '127.0.0.1'): Promise<Server> {
      const server = createServer((req, res) => {
        handle(req, res).catch(() => send(res, 500, { error: 'Unexpected server error.' }));
      });
      return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
    },
  };
}
