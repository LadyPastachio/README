/**
 * Talks to the academy server (npm run server) for accounts, sync and circles.
 * The session lives in an HttpOnly cookie the browser sends automatically:
 * page scripts can't read it, so nothing secret is kept in browser storage.
 */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; status: number; error: string };

export interface AccountUser {
  name: string;
  email: string;
}

export async function api<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, body?: unknown): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`api/${path}`, {
      method,
      credentials: 'same-origin',
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return { ok: false, status: 0, error: 'The academy server isn\'t reachable. Start it with npm run server.' };
  }
  const json = (await res.json().catch(() => null)) as (T & { error?: string }) | null;
  if (json === null) return { ok: false, status: res.status || 0, error: 'The academy server isn\'t reachable here. Start it with npm run server.' };
  if (!res.ok) return { ok: false, status: res.status, error: json.error ?? `The server answered with status ${res.status}.` };
  return { ok: true, data: json };
}

export interface CircleSummary {
  id: string;
  name: string;
  role: 'owner' | 'member';
  members: number;
}

export interface ShareContent {
  text?: string;
  exerciseId?: string;
  files?: Partial<Record<'html' | 'css' | 'js', string>>;
}

export interface CircleDetail {
  id: string;
  name: string;
  role: 'owner' | 'member';
  members: { id: string; name: string; role: 'owner' | 'member'; you: boolean }[];
  shares: {
    id: string;
    author: string;
    mine: boolean;
    kind: 'progress' | 'code' | 'note';
    title: string;
    content: ShareContent;
    createdAt: string;
    comments: { id: string; author: string; mine: boolean; body: string; createdAt: string }[];
  }[];
}
