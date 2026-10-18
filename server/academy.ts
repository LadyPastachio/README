import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomInt, randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Db } from './db.ts';
import { DUMMY_HASH, RateLimiter, hashPassword, newToken, sha256, verifyPassword } from './auth.ts';

/**
 * Accounts, sync and learning circles. Every route checks who is asking and
 * what they may see. The rules, in one place:
 *  - You can only read and change your own account and synced data.
 *  - Circle content is visible only to that circle's members.
 *  - Only the circle owner can invite, remove members or delete the circle.
 *  - A share can be deleted by its author or the circle owner; a comment only by its author.
 *  - Other members see your display name, never your email.
 */

export interface AcademyOptions {
  db: Db;
  now?: () => Date;
  /** Add the Secure flag to cookies (use when served over HTTPS). */
  secureCookies?: boolean;
  /** New accounts allowed per address per hour (default 10). */
  signupsPerHour?: number;
}

type Json = Record<string, unknown>;
interface Ctx {
  req: IncomingMessage;
  res: ServerResponse;
  url: URL;
  body: unknown;
  user: { id: string; email: string; name: string } | null;
}

const COOKIE = 'academy_session';
const SESSION_DAYS = 30;
export const LIMITS = { backupBytes: 3_000_000, shareBytes: 20_000, commentChars: 2000, circlesPerUser: 10, membersPerCircle: 12, inviteDays: 7, inviteUses: 5 };

const email = z.string().trim().toLowerCase().max(254).regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.');
const password = z.string().min(10, 'Use at least 10 characters for your password.').max(200);
const name = z.string().trim().min(1, 'Enter a display name.').max(60);
const registerSchema = z.object({ email, name, password }).strict();
const loginSchema = z.object({ email, password: z.string().min(1).max(200) }).strict();
const deleteSchema = z.object({ password: z.string().min(1).max(200) }).strict();
const backupSchema = z.object({ backup: z.object({ format: z.literal('atelier-academy-backup'), version: z.number().int().positive(), data: z.record(z.string(), z.unknown()) }).passthrough() }).strict();
const circleSchema = z.object({ name: z.string().trim().min(1, 'Name the circle.').max(60) }).strict();
const joinSchema = z.object({ code: z.string().trim().min(6).max(40) }).strict();
const shareSchema = z.object({ kind: z.enum(['progress', 'code', 'note']), title: z.string().trim().min(1).max(120), content: z.record(z.string(), z.unknown()) }).strict();
const commentSchema = z.object({ body: z.string().trim().min(1, 'Write a comment first.').max(LIMITS.commentChars) }).strict();

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string | string[]> = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(JSON.stringify(body));
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

function issues(e: z.ZodError): string {
  return e.issues.map((i) => i.message).join(' ');
}

export function createAcademy(opts: AcademyOptions) {
  const { db } = opts;
  const now = opts.now ?? (() => new Date());
  const iso = () => now().toISOString();
  const loginFailures = new RateLimiter(5, 15 * 60_000, () => now().getTime());
  const signups = new RateLimiter(opts.signupsPerHour ?? 10, 60 * 60_000, () => now().getTime());

  const q = {
    userByEmail: db.prepare('SELECT id, email, name, password_hash FROM users WHERE email = ?'),
    userById: db.prepare('SELECT id, email, name, password_hash FROM users WHERE id = ?'),
    insertUser: db.prepare('INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'),
    insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'),
    sessionUser: db.prepare('SELECT u.id, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?'),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    deleteUser: db.prepare('DELETE FROM users WHERE id = ?'),
    getSnapshot: db.prepare('SELECT data, updated_at FROM snapshots WHERE user_id = ?'),
    putSnapshot: db.prepare('INSERT INTO snapshots (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at'),
    deleteSnapshot: db.prepare('DELETE FROM snapshots WHERE user_id = ?'),
    myCircles: db.prepare('SELECT c.id, c.name, m.role, (SELECT COUNT(*) FROM memberships WHERE circle_id = c.id) AS members FROM circles c JOIN memberships m ON m.circle_id = c.id WHERE m.user_id = ? ORDER BY c.created_at, c.rowid'),
    membership: db.prepare('SELECT role FROM memberships WHERE circle_id = ? AND user_id = ?'),
    circle: db.prepare('SELECT id, name, owner_id FROM circles WHERE id = ?'),
    insertCircle: db.prepare('INSERT INTO circles (id, name, owner_id, created_at) VALUES (?, ?, ?, ?)'),
    insertMember: db.prepare('INSERT INTO memberships (circle_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)'),
    deleteMember: db.prepare('DELETE FROM memberships WHERE circle_id = ? AND user_id = ?'),
    memberCount: db.prepare('SELECT COUNT(*) AS n FROM memberships WHERE circle_id = ?'),
    circleCount: db.prepare('SELECT COUNT(*) AS n FROM memberships WHERE user_id = ?'),
    members: db.prepare('SELECT u.id, u.name, m.role FROM memberships m JOIN users u ON u.id = m.user_id WHERE m.circle_id = ? ORDER BY m.joined_at, m.rowid'),
    deleteCircle: db.prepare('DELETE FROM circles WHERE id = ?'),
    insertInvite: db.prepare('INSERT INTO invites (code_hash, circle_id, created_by, expires_at, uses_left) VALUES (?, ?, ?, ?, ?)'),
    invite: db.prepare('SELECT circle_id, expires_at, uses_left FROM invites WHERE code_hash = ?'),
    useInvite: db.prepare('UPDATE invites SET uses_left = uses_left - 1 WHERE code_hash = ?'),
    shares: db.prepare('SELECT s.id, s.user_id, u.name AS author, s.kind, s.title, s.content, s.created_at FROM shares s JOIN users u ON u.id = s.user_id WHERE s.circle_id = ? ORDER BY s.created_at DESC, s.rowid DESC'),
    comments: db.prepare('SELECT c.id, c.share_id, c.user_id, u.name AS author, c.body, c.created_at FROM comments c JOIN users u ON u.id = c.user_id JOIN shares s ON s.id = c.share_id WHERE s.circle_id = ? ORDER BY c.created_at, c.rowid'),
    share: db.prepare('SELECT id, circle_id, user_id FROM shares WHERE id = ?'),
    insertShare: db.prepare('INSERT INTO shares (id, circle_id, user_id, kind, title, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'),
    deleteShare: db.prepare('DELETE FROM shares WHERE id = ?'),
    comment: db.prepare('SELECT id, user_id FROM comments WHERE id = ?'),
    insertComment: db.prepare('INSERT INTO comments (id, share_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?)'),
    deleteComment: db.prepare('DELETE FROM comments WHERE id = ?'),
    myShares: db.prepare('SELECT id, circle_id, kind, title, content, created_at FROM shares WHERE user_id = ?'),
    myComments: db.prepare('SELECT id, share_id, body, created_at FROM comments WHERE user_id = ?'),
    deleteMemberships: db.prepare('DELETE FROM memberships WHERE user_id = ?'),
  };

  function sessionCookie(token: string, maxAge: number) {
    return `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${maxAge}${opts.secureCookies ? '; Secure' : ''}`;
  }

  function startSession(userId: string): string {
    const token = newToken();
    const expires = new Date(now().getTime() + SESSION_DAYS * 86_400_000).toISOString();
    q.insertSession.run(sha256(token), userId, iso(), expires);
    return sessionCookie(token, SESSION_DAYS * 86_400);
  }

  function currentUser(req: IncomingMessage) {
    const token = parseCookies(req.headers.cookie)[COOKIE];
    if (!token) return null;
    const row = q.sessionUser.get(sha256(token), iso()) as { id: string; email: string; name: string } | undefined;
    return row ?? null;
  }

  function role(circleId: string, userId: string): 'owner' | 'member' | null {
    const row = q.membership.get(circleId, userId) as { role: 'owner' | 'member' } | undefined;
    return row?.role ?? null;
  }

  function circleView(circleId: string, userId: string) {
    const c = q.circle.get(circleId) as { id: string; name: string; owner_id: string };
    const comments = q.comments.all(circleId) as { id: string; share_id: string; user_id: string; author: string; body: string; created_at: string }[];
    const shares = (q.shares.all(circleId) as { id: string; user_id: string; author: string; kind: string; title: string; content: string; created_at: string }[]).map((s) => ({
      id: s.id, author: s.author, mine: s.user_id === userId, kind: s.kind, title: s.title, content: JSON.parse(s.content), createdAt: s.created_at,
      comments: comments.filter((x) => x.share_id === s.id).map((x) => ({ id: x.id, author: x.author, mine: x.user_id === userId, body: x.body, createdAt: x.created_at })),
    }));
    const members = (q.members.all(circleId) as { id: string; name: string; role: string }[]).map((m) => ({ id: m.id, name: m.name, role: m.role, you: m.id === userId }));
    return { id: c.id, name: c.name, role: role(circleId, userId), members, shares };
  }

  type Route = { method: string; pattern: RegExp; auth: boolean; maxBody?: number; run: (ctx: Ctx, params: string[]) => Promise<void> | void };
  const routes: Route[] = [
    {
      method: 'GET', pattern: /^\/api\/auth\/me$/, auth: false,
      // 200 with user: null when signed out, so checking doesn't log errors in the browser.
      run: ({ res, user }) => send(res, 200, { user: user ? { name: user.name, email: user.email } : null }),
    },
    {
      method: 'POST', pattern: /^\/api\/auth\/register$/, auth: false,
      run: async ({ req, res, body }) => {
        const ip = req.socket.remoteAddress ?? 'unknown';
        if (signups.blocked(ip)) return send(res, 429, { error: 'Too many new accounts from here. Try again later.' });
        const p = registerSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: issues(p.error) });
        signups.hit(ip);
        if (q.userByEmail.get(p.data.email)) return send(res, 409, { error: 'An account with this email already exists. Sign in instead.' });
        const id = randomUUID();
        q.insertUser.run(id, p.data.email, p.data.name, await hashPassword(p.data.password), iso());
        send(res, 201, { user: { name: p.data.name, email: p.data.email } }, { 'Set-Cookie': startSession(id) });
      },
    },
    {
      method: 'POST', pattern: /^\/api\/auth\/login$/, auth: false,
      run: async ({ res, body }) => {
        const p = loginSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: 'Enter your email and password.' });
        const key = p.data.email;
        if (loginFailures.blocked(key)) return send(res, 429, { error: 'Too many attempts. Wait 15 minutes and try again.' });
        const row = q.userByEmail.get(key) as { id: string; email: string; name: string; password_hash: string } | undefined;
        const ok = await verifyPassword(p.data.password, row?.password_hash ?? DUMMY_HASH);
        if (!row || !ok) {
          loginFailures.hit(key);
          return send(res, 401, { error: 'Email or password is incorrect.' });
        }
        loginFailures.reset(key);
        send(res, 200, { user: { name: row.name, email: row.email } }, { 'Set-Cookie': startSession(row.id) });
      },
    },
    {
      method: 'POST', pattern: /^\/api\/auth\/logout$/, auth: false,
      run: ({ req, res }) => {
        const token = parseCookies(req.headers.cookie)[COOKIE];
        if (token) q.deleteSession.run(sha256(token));
        send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
      },
    },
    {
      method: 'GET', pattern: /^\/api\/account\/export$/, auth: true,
      run: ({ res, user }) => {
        const snap = q.getSnapshot.get(user!.id) as { data: string; updated_at: string } | undefined;
        send(res, 200, {
          exportedAt: iso(),
          account: { name: user!.name, email: user!.email },
          syncedBackup: snap ? { updatedAt: snap.updated_at, backup: JSON.parse(snap.data) } : null,
          circles: (q.myCircles.all(user!.id) as { id: string; name: string; role: string }[]).map((c) => ({ id: c.id, name: c.name, role: c.role })),
          shares: (q.myShares.all(user!.id) as { content: string }[]).map((s) => ({ ...s, content: JSON.parse(s.content) })),
          comments: q.myComments.all(user!.id),
        });
      },
    },
    {
      method: 'POST', pattern: /^\/api\/account\/delete$/, auth: true,
      run: async ({ res, body, user }) => {
        const p = deleteSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: 'Enter your password to confirm.' });
        const row = q.userById.get(user!.id) as { password_hash: string };
        if (!(await verifyPassword(p.data.password, row.password_hash))) return send(res, 401, { error: 'That password is incorrect.' });
        // Cascades remove sessions, synced data, owned circles (with their shares), memberships, shares and comments.
        q.deleteUser.run(user!.id);
        send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
      },
    },
    {
      method: 'GET', pattern: /^\/api\/sync$/, auth: true,
      run: ({ res, user }) => {
        const snap = q.getSnapshot.get(user!.id) as { data: string; updated_at: string } | undefined;
        send(res, 200, snap ? { backup: JSON.parse(snap.data), updatedAt: snap.updated_at, bytes: snap.data.length } : { backup: null, updatedAt: null, bytes: 0 });
      },
    },
    {
      method: 'PUT', pattern: /^\/api\/sync$/, auth: true, maxBody: LIMITS.backupBytes + 1000,
      run: ({ res, body, user }) => {
        const p = backupSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: 'That is not an academy backup.' });
        const text = JSON.stringify(p.data.backup);
        if (text.length > LIMITS.backupBytes) return send(res, 413, { error: 'This backup is too large to sync.' });
        const at = iso();
        q.putSnapshot.run(user!.id, text, at);
        send(res, 200, { updatedAt: at, bytes: text.length });
      },
    },
    {
      method: 'DELETE', pattern: /^\/api\/sync$/, auth: true,
      run: ({ res, user }) => {
        q.deleteSnapshot.run(user!.id);
        send(res, 200, { ok: true });
      },
    },
    {
      method: 'GET', pattern: /^\/api\/circles$/, auth: true,
      run: ({ res, user }) => send(res, 200, { circles: q.myCircles.all(user!.id) }),
    },
    {
      method: 'POST', pattern: /^\/api\/circles$/, auth: true,
      run: ({ res, body, user }) => {
        const p = circleSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: issues(p.error) });
        if ((q.circleCount.get(user!.id) as { n: number }).n >= LIMITS.circlesPerUser) return send(res, 409, { error: `You can be in up to ${LIMITS.circlesPerUser} circles.` });
        const id = randomUUID();
        q.insertCircle.run(id, p.data.name, user!.id, iso());
        q.insertMember.run(id, user!.id, 'owner', iso());
        send(res, 201, circleView(id, user!.id));
      },
    },
    {
      method: 'POST', pattern: /^\/api\/circles\/join$/, auth: true,
      run: ({ res, body, user }) => {
        const p = joinSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: 'Enter the invite code you were given.' });
        const hash = sha256(p.data.code.toUpperCase());
        const inv = q.invite.get(hash) as { circle_id: string; expires_at: string; uses_left: number } | undefined;
        if (!inv || inv.expires_at <= iso() || inv.uses_left <= 0) return send(res, 404, { error: 'That invite code is invalid or has expired.' });
        if (role(inv.circle_id, user!.id)) return send(res, 200, circleView(inv.circle_id, user!.id));
        if ((q.memberCount.get(inv.circle_id) as { n: number }).n >= LIMITS.membersPerCircle) return send(res, 409, { error: 'This circle is full.' });
        if ((q.circleCount.get(user!.id) as { n: number }).n >= LIMITS.circlesPerUser) return send(res, 409, { error: `You can be in up to ${LIMITS.circlesPerUser} circles.` });
        q.useInvite.run(hash);
        q.insertMember.run(inv.circle_id, user!.id, 'member', iso());
        send(res, 200, circleView(inv.circle_id, user!.id));
      },
    },
    {
      method: 'GET', pattern: /^\/api\/circles\/([\w-]+)$/, auth: true,
      run: ({ res, user }, [id]) => {
        // Non-members get the same 404 as a circle that doesn't exist, so ids can't be probed.
        if (!role(id!, user!.id)) return send(res, 404, { error: 'Circle not found.' });
        send(res, 200, circleView(id!, user!.id));
      },
    },
    {
      method: 'DELETE', pattern: /^\/api\/circles\/([\w-]+)$/, auth: true,
      run: ({ res, user }, [id]) => {
        const r = role(id!, user!.id);
        if (!r) return send(res, 404, { error: 'Circle not found.' });
        if (r !== 'owner') return send(res, 403, { error: 'Only the owner can delete this circle.' });
        q.deleteCircle.run(id!);
        send(res, 200, { ok: true });
      },
    },
    {
      method: 'POST', pattern: /^\/api\/circles\/([\w-]+)\/invites$/, auth: true,
      run: ({ res, user }, [id]) => {
        const r = role(id!, user!.id);
        if (!r) return send(res, 404, { error: 'Circle not found.' });
        if (r !== 'owner') return send(res, 403, { error: 'Only the owner can invite people.' });
        // 10 characters from an alphabet without look-alikes (no 0/O, 1/I/L).
        const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let code = '';
        while (code.length < 10) code += alphabet[randomInt(alphabet.length)];
        const expires = new Date(now().getTime() + LIMITS.inviteDays * 86_400_000).toISOString();
        q.insertInvite.run(sha256(code), id!, user!.id, expires, LIMITS.inviteUses);
        send(res, 201, { code, expiresAt: expires, uses: LIMITS.inviteUses });
      },
    },
    {
      method: 'POST', pattern: /^\/api\/circles\/([\w-]+)\/leave$/, auth: true,
      run: ({ res, user }, [id]) => {
        const r = role(id!, user!.id);
        if (!r) return send(res, 404, { error: 'Circle not found.' });
        if (r === 'owner') return send(res, 409, { error: 'Owners can\'t leave their own circle. Delete it instead.' });
        q.deleteMember.run(id!, user!.id);
        send(res, 200, { ok: true });
      },
    },
    {
      method: 'DELETE', pattern: /^\/api\/circles\/([\w-]+)\/members\/([\w-]+)$/, auth: true,
      run: ({ res, user }, [id, memberId]) => {
        const r = role(id!, user!.id);
        if (!r) return send(res, 404, { error: 'Circle not found.' });
        if (r !== 'owner') return send(res, 403, { error: 'Only the owner can remove members.' });
        if (memberId === user!.id) return send(res, 409, { error: 'You can\'t remove yourself. Delete the circle instead.' });
        if (!role(id!, memberId!)) return send(res, 404, { error: 'That person isn\'t in this circle.' });
        q.deleteMember.run(id!, memberId!);
        send(res, 200, { ok: true });
      },
    },
    {
      method: 'POST', pattern: /^\/api\/circles\/([\w-]+)\/shares$/, auth: true, maxBody: LIMITS.shareBytes + 2000,
      run: ({ res, body, user }, [id]) => {
        if (!role(id!, user!.id)) return send(res, 404, { error: 'Circle not found.' });
        const p = shareSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: 'That share is not valid.' });
        const content = JSON.stringify(p.data.content);
        if (content.length > LIMITS.shareBytes) return send(res, 413, { error: 'That is too large to share.' });
        const shareId = randomUUID();
        q.insertShare.run(shareId, id!, user!.id, p.data.kind, p.data.title, content, iso());
        send(res, 201, circleView(id!, user!.id));
      },
    },
    {
      method: 'DELETE', pattern: /^\/api\/shares\/([\w-]+)$/, auth: true,
      run: ({ res, user }, [id]) => {
        const s = q.share.get(id!) as { id: string; circle_id: string; user_id: string } | undefined;
        const r = s ? role(s.circle_id, user!.id) : null;
        if (!s || !r) return send(res, 404, { error: 'Not found.' });
        if (s.user_id !== user!.id && r !== 'owner') return send(res, 403, { error: 'Only the author or the circle owner can remove this.' });
        q.deleteShare.run(id!);
        send(res, 200, circleView(s.circle_id, user!.id));
      },
    },
    {
      method: 'POST', pattern: /^\/api\/shares\/([\w-]+)\/comments$/, auth: true,
      run: ({ res, body, user }, [id]) => {
        const s = q.share.get(id!) as { id: string; circle_id: string } | undefined;
        if (!s || !role(s.circle_id, user!.id)) return send(res, 404, { error: 'Not found.' });
        const p = commentSchema.safeParse(body);
        if (!p.success) return send(res, 400, { error: issues(p.error) });
        q.insertComment.run(randomUUID(), id!, user!.id, p.data.body, iso());
        send(res, 201, circleView(s.circle_id, user!.id));
      },
    },
    {
      method: 'DELETE', pattern: /^\/api\/comments\/([\w-]+)$/, auth: true,
      run: ({ res, user }, [id]) => {
        const c = q.comment.get(id!) as { id: string; user_id: string } | undefined;
        if (!c || c.user_id !== user!.id) return send(res, 404, { error: 'Not found.' });
        q.deleteComment.run(id!);
        send(res, 200, { ok: true });
      },
    },
  ];

  /** Returns true if the request was an academy route (handled here). */
  async function handle(req: IncomingMessage, res: ServerResponse, url: URL, readBody: (max: number) => Promise<string | null>): Promise<boolean> {
    const route = routes.find((r) => r.method === req.method && r.pattern.test(url.pathname));
    if (!route) {
      if (routes.some((r) => r.pattern.test(url.pathname))) {
        send(res, 405, { error: 'Method not allowed.' });
        return true;
      }
      return false;
    }
    const params = route.pattern.exec(url.pathname)!.slice(1);
    let body: unknown = undefined;
    if (req.method !== 'GET') {
      // State-changing requests must come from an allowed page (checked by the caller) and be JSON.
      if (!req.headers.origin) {
        send(res, 403, { error: 'Missing origin.' });
        return true;
      }
      const hasBody = req.method === 'POST' || req.method === 'PUT';
      if (hasBody) {
        if (!(req.headers['content-type'] ?? '').startsWith('application/json')) {
          send(res, 415, { error: 'Send JSON.' });
          return true;
        }
        const max = route.maxBody ?? 16 * 1024;
        if (Number(req.headers['content-length'] ?? 0) > max) {
          res.setHeader('Connection', 'close');
          send(res, 413, { error: 'Request is too large.' });
          return true;
        }
        const raw = await readBody(max);
        if (raw === null) {
          send(res, 413, { error: 'Request is too large.' });
          return true;
        }
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          send(res, 400, { error: 'Request body is not valid JSON.' });
          return true;
        }
      }
    }
    const user = currentUser(req);
    if (route.auth && !user) {
      send(res, 401, { error: 'Sign in first.' });
      return true;
    }
    await route.run({ req, res, url, body, user } as Ctx, params);
    return true;
  }

  return { handle };
}
export type Academy = ReturnType<typeof createAcademy>;
export type { Json };
