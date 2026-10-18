// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createApp } from './app.ts';
import { createAcademy, LIMITS } from './academy.ts';
import { openDb, type Db } from './db.ts';
import { hashPassword, verifyPassword, RateLimiter } from './auth.ts';

const ORIGIN = 'http://localhost:5173';
let server: Server | null = null;
let db: Db;
let clock = new Date('2026-10-18T10:00:00Z');

async function start() {
  db = openDb(':memory:');
  clock = new Date('2026-10-18T10:00:00Z');
  const app = createApp({ client: null, model: 'm', dailyLimit: 5, maxTokens: 64, allowedOrigins: [ORIGIN], academy: createAcademy({ db, now: () => clock }) });
  server = await app.listen(0);
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

afterEach(async () => {
  await new Promise<void>((r) => (server ? server.close(() => r()) : r()));
  server = null;
});

/** A browser-like client with its own cookie jar. */
function client(base: string) {
  let cookie = '';
  const call = async (method: string, path: string, body?: unknown, extra: Record<string, string> = {}) => {
    const res = await fetch(base + path, {
      method,
      headers: { origin: ORIGIN, ...(body !== undefined ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...extra },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0]!.endsWith('=') ? '' : set.split(';')[0]!;
    const json = (await res.json().catch(() => ({}))) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    return { status: res.status, json, setCookie: set };
  };
  return {
    call,
    get cookie() { return cookie; },
    register: (email: string, name = 'Learner', password = 'correct horse battery') => call('POST', '/api/auth/register', { email, name, password }),
  };
}

const BACKUP = { format: 'atelier-academy-backup', version: 1, exportedAt: '2026-10-18T00:00:00Z', data: { 'academy:settings': { version: 1 } } };

describe('passwords and limits', () => {
  it('hashes with a salt and verifies', async () => {
    const a = await hashPassword('correct horse battery');
    const b = await hashPassword('correct horse battery');
    expect(a).not.toBe(b);
    expect(a).not.toContain('correct horse');
    expect(await verifyPassword('correct horse battery', a)).toBe(true);
    expect(await verifyPassword('wrong password!!', a)).toBe(false);
    expect(await verifyPassword('x', 'garbage')).toBe(false);
  });
  it('rate limiter blocks after the maximum and recovers after the window', () => {
    let t = 0;
    const rl = new RateLimiter(2, 1000, () => t);
    rl.hit('k'); rl.hit('k');
    expect(rl.blocked('k')).toBe(true);
    t = 1001;
    expect(rl.blocked('k')).toBe(false);
  });
});

describe('accounts', () => {
  it('signs up, stays signed in with an HttpOnly cookie, and signs out', async () => {
    const base = await start();
    const a = client(base);
    const reg = await a.register('Ana@Example.com', 'Ana');
    expect(reg.status).toBe(201);
    expect(reg.setCookie).toMatch(/HttpOnly/);
    expect(reg.setCookie).toMatch(/SameSite=Strict/);
    expect((await a.call('GET', '/api/auth/me')).json.user).toEqual({ name: 'Ana', email: 'ana@example.com' });
    await a.call('POST', '/api/auth/logout', {});
    expect((await a.call('GET', '/api/auth/me')).json.user).toBeNull();
  });

  it('stores only hashes: no plain passwords or session tokens in the database', async () => {
    const base = await start();
    const a = client(base);
    await a.register('ana@example.com');
    const token = a.cookie.split('=')[1]!;
    const dump = JSON.stringify([db.prepare('SELECT * FROM users').all(), db.prepare('SELECT * FROM sessions').all()]);
    expect(dump).not.toContain('correct horse battery');
    expect(dump).not.toContain(token);
  });

  it('validates sign-up input and refuses duplicate emails', async () => {
    const base = await start();
    const a = client(base);
    expect((await a.register('not-an-email')).status).toBe(400);
    expect((await a.call('POST', '/api/auth/register', { email: 'a@b.co', name: 'A', password: 'short' })).json.error).toMatch(/at least 10/);
    expect((await a.call('POST', '/api/auth/register', { email: 'a@b.co', name: 'A', password: 'long enough pw', admin: true })).status).toBe(400);
    expect((await a.register('dup@example.com')).status).toBe(201);
    expect((await client(base).register('DUP@example.com')).status).toBe(409);
  });

  it('gives the same answer for a wrong password and an unknown email, and limits attempts', async () => {
    const base = await start();
    await client(base).register('ana@example.com');
    const b = client(base);
    const wrong = await b.call('POST', '/api/auth/login', { email: 'ana@example.com', password: 'nope nope nope' });
    const unknown = await b.call('POST', '/api/auth/login', { email: 'nobody@example.com', password: 'nope nope nope' });
    expect(wrong.status).toBe(401);
    expect(unknown.json.error).toBe(wrong.json.error);
    for (let i = 0; i < 4; i++) await b.call('POST', '/api/auth/login', { email: 'ana@example.com', password: 'nope nope nope' });
    expect((await b.call('POST', '/api/auth/login', { email: 'ana@example.com', password: 'correct horse battery' })).status).toBe(429);
    clock = new Date(clock.getTime() + 16 * 60_000);
    expect((await b.call('POST', '/api/auth/login', { email: 'ana@example.com', password: 'correct horse battery' })).status).toBe(200);
  });

  it('expires sessions after 30 days', async () => {
    const base = await start();
    const a = client(base);
    await a.register('ana@example.com');
    clock = new Date(clock.getTime() + 31 * 86_400_000);
    expect((await a.call('GET', '/api/auth/me')).json.user).toBeNull();
    expect((await a.call('GET', '/api/sync')).status).toBe(401);
  });

  it('refuses state changes without an allowed origin, or not as JSON', async () => {
    const base = await start();
    const a = client(base);
    expect((await a.call('POST', '/api/auth/register', { email: 'x@y.co', name: 'X', password: 'long enough pw' }, { origin: '' })).status).toBe(403);
    expect((await a.call('POST', '/api/auth/register', { email: 'x@y.co', name: 'X', password: 'long enough pw' }, { origin: 'https://evil.example' })).status).toBe(403);
    expect((await a.call('POST', '/api/auth/register', { email: 'x@y.co', name: 'X', password: 'long enough pw' }, { 'content-type': 'text/plain' })).status).toBe(415);
  });
});

describe('sync', () => {
  it('keeps one backup per account, readable only by its owner', async () => {
    const base = await start();
    const a = client(base);
    const b = client(base);
    await a.register('a@example.com');
    await b.register('b@example.com');
    expect((await a.call('GET', '/api/sync')).json.backup).toBeNull();
    expect((await a.call('PUT', '/api/sync', { backup: BACKUP })).status).toBe(200);
    expect((await a.call('GET', '/api/sync')).json.backup).toEqual(BACKUP);
    expect((await b.call('GET', '/api/sync')).json.backup).toBeNull();
    expect((await client(base).call('GET', '/api/sync')).status).toBe(401);
  });
  it('accepts only academy backups within the size limit', async () => {
    const base = await start();
    const a = client(base);
    await a.register('a@example.com');
    expect((await a.call('PUT', '/api/sync', { backup: { hello: 1 } })).status).toBe(400);
    const big = { ...BACKUP, data: { x: 'y'.repeat(LIMITS.backupBytes) } };
    expect((await a.call('PUT', '/api/sync', { backup: big })).status).toBe(413);
  });
});

describe('circles and isolation', () => {
  async function three(base: string) {
    const owner = client(base), member = client(base), outsider = client(base);
    await owner.register('owner@example.com', 'Olu');
    await member.register('member@example.com', 'Mei');
    await outsider.register('out@example.com', 'Oz');
    const circle = (await owner.call('POST', '/api/circles', { name: 'Study buddies' })).json;
    const code = (await owner.call('POST', `/api/circles/${circle.id}/invites`, {})).json.code as string;
    const joined = await member.call('POST', '/api/circles/join', { code: code.toLowerCase() });
    return { owner, member, outsider, id: circle.id as string, code, joined };
  }

  it('joins with an invite code; members see names but never emails', async () => {
    const base = await start();
    const { joined, id, owner } = await three(base);
    expect(joined.status).toBe(200);
    expect(joined.json.members.map((m: { name: string }) => m.name)).toEqual(['Olu', 'Mei']);
    expect(JSON.stringify((await owner.call('GET', `/api/circles/${id}`)).json)).not.toMatch(/@example\.com/);
  });

  it('outsiders get 404 for everything in a circle', async () => {
    const base = await start();
    const { member, outsider, id } = await three(base);
    const share = (await member.call('POST', `/api/circles/${id}/shares`, { kind: 'note', title: 'My notes', content: { text: 'hello' } })).json.shares[0];
    expect((await outsider.call('GET', `/api/circles/${id}`)).status).toBe(404);
    expect((await outsider.call('POST', `/api/circles/${id}/shares`, { kind: 'note', title: 'x', content: { text: 'x' } })).status).toBe(404);
    expect((await outsider.call('POST', `/api/shares/${share.id}/comments`, { body: 'hi' })).status).toBe(404);
    expect((await outsider.call('DELETE', `/api/shares/${share.id}`)).status).toBe(404);
    expect((await outsider.call('POST', `/api/circles/${id}/invites`, {})).status).toBe(404);
    expect((await outsider.call('GET', '/api/circles')).json.circles).toEqual([]);
  });

  it('only the owner can invite, remove members or delete the circle', async () => {
    const base = await start();
    const { owner, member, id } = await three(base);
    expect((await member.call('POST', `/api/circles/${id}/invites`, {})).status).toBe(403);
    expect((await member.call('DELETE', `/api/circles/${id}`)).status).toBe(403);
    const ownerId = (await owner.call('GET', `/api/circles/${id}`)).json.members.find((m: { you: boolean }) => m.you).id;
    expect((await member.call('DELETE', `/api/circles/${id}/members/${ownerId}`)).status).toBe(403);
    const memberId = (await member.call('GET', `/api/circles/${id}`)).json.members.find((m: { you: boolean }) => m.you).id;
    expect((await owner.call('DELETE', `/api/circles/${id}/members/${memberId}`)).status).toBe(200);
    expect((await member.call('GET', `/api/circles/${id}`)).status).toBe(404);
  });

  it('shares: authors and owners can delete; comments: only their authors', async () => {
    const base = await start();
    const { owner, member, id } = await three(base);
    const v1 = (await member.call('POST', `/api/circles/${id}/shares`, { kind: 'code', title: 'Counter', content: { files: { js: 'let n = 0;' } } })).json;
    const share = v1.shares[0];
    expect(share.mine).toBe(true);
    const v2 = (await owner.call('POST', `/api/shares/${share.id}/comments`, { body: 'Nice: try const here.' })).json;
    const comment = v2.shares[0].comments[0];
    expect(comment.author).toBe('Olu');
    expect((await member.call('DELETE', `/api/comments/${comment.id}`)).status).toBe(404);
    expect((await owner.call('DELETE', `/api/comments/${comment.id}`)).status).toBe(200);
    const ownShare = (await owner.call('POST', `/api/circles/${id}/shares`, { kind: 'note', title: 'Owner note', content: { text: 'x' } })).json.shares.find((x: { title: string }) => x.title === 'Owner note');
    expect((await member.call('DELETE', `/api/shares/${ownShare.id}`)).status).toBe(403);
    expect((await owner.call('DELETE', `/api/shares/${share.id}`)).status).toBe(200);
  });

  it('invite codes expire, run out, and can\'t be guessed from the database', async () => {
    const base = await start();
    const { code, id } = await three(base);
    expect(JSON.stringify(db.prepare('SELECT * FROM invites').all())).not.toContain(code);
    for (let i = 0; i < 4; i++) {
      const c = client(base);
      await c.register(`extra${i}@example.com`);
      expect((await c.call('POST', '/api/circles/join', { code })).status).toBe(200);
    }
    const late = client(base);
    await late.register('late@example.com');
    expect((await late.call('POST', '/api/circles/join', { code })).status).toBe(404);
    const owner = client(base);
    await owner.call('POST', '/api/auth/login', { email: 'owner@example.com', password: 'correct horse battery' });
    const fresh = (await owner.call('POST', `/api/circles/${id}/invites`, {})).json.code;
    clock = new Date(clock.getTime() + 8 * 86_400_000);
    expect((await late.call('POST', '/api/circles/join', { code: fresh })).status).toBe(404);
  });

  it('owners can\'t leave (they delete instead); members can leave', async () => {
    const base = await start();
    const { owner, member, id } = await three(base);
    expect((await owner.call('POST', `/api/circles/${id}/leave`, {})).status).toBe(409);
    expect((await member.call('POST', `/api/circles/${id}/leave`, {})).status).toBe(200);
    expect((await member.call('GET', '/api/circles')).json.circles).toEqual([]);
  });

  it('validates share and comment content and size', async () => {
    const base = await start();
    const { member, id } = await three(base);
    expect((await member.call('POST', `/api/circles/${id}/shares`, { kind: 'secret', title: 'x', content: {} })).status).toBe(400);
    expect((await member.call('POST', `/api/circles/${id}/shares`, { kind: 'note', title: 'x', content: { text: 'y'.repeat(LIMITS.shareBytes + 10) } })).status).toBe(413);
    const s = (await member.call('POST', `/api/circles/${id}/shares`, { kind: 'note', title: 'ok', content: { text: 'fine' } })).json.shares[0];
    expect((await member.call('POST', `/api/shares/${s.id}/comments`, { body: '   ' })).status).toBe(400);
  });
});

describe('export and deletion', () => {
  it('exports your own data', async () => {
    const base = await start();
    const a = client(base);
    await a.register('a@example.com', 'Ana');
    await a.call('PUT', '/api/sync', { backup: BACKUP });
    await a.call('POST', '/api/circles', { name: 'Mine' });
    const ex = (await a.call('GET', '/api/account/export')).json;
    expect(ex.account).toEqual({ name: 'Ana', email: 'a@example.com' });
    expect(ex.syncedBackup.backup).toEqual(BACKUP);
    expect(ex.circles).toHaveLength(1);
  });

  it('deleting an account needs the password and removes everything it owns', async () => {
    const base = await start();
    const owner = client(base), member = client(base);
    await owner.register('owner@example.com', 'Olu');
    await member.register('member@example.com', 'Mei');
    await owner.call('PUT', '/api/sync', { backup: BACKUP });
    const id = (await owner.call('POST', '/api/circles', { name: 'Gone soon' })).json.id;
    const code = (await owner.call('POST', `/api/circles/${id}/invites`, {})).json.code;
    await member.call('POST', '/api/circles/join', { code });
    const other = (await member.call('POST', '/api/circles', { name: 'Mei circle' })).json.id;
    const code2 = (await member.call('POST', `/api/circles/${other}/invites`, {})).json.code;
    await owner.call('POST', '/api/circles/join', { code: code2 });
    const share = (await owner.call('POST', `/api/circles/${other}/shares`, { kind: 'note', title: 'From Olu', content: { text: 'x' } })).json;
    expect(share.shares).toHaveLength(1);

    expect((await owner.call('POST', '/api/account/delete', { password: 'wrong password' })).status).toBe(401);
    const del = await owner.call('POST', '/api/account/delete', { password: 'correct horse battery' });
    expect(del.status).toBe(200);
    for (const table of ['users', 'sessions', 'snapshots', 'circles', 'memberships', 'shares', 'invites']) {
      const rows = db.prepare(`SELECT * FROM ${table}`).all();
      expect(JSON.stringify(rows), table).not.toMatch(/owner@example|Gone soon|From Olu/);
    }
    expect((await member.call('GET', `/api/circles/${id}`)).status).toBe(404);
    const mine = (await member.call('GET', `/api/circles/${other}`)).json;
    expect(mine.members.map((m: { name: string }) => m.name)).toEqual(['Mei']);
    expect(mine.shares).toEqual([]);
    expect((await owner.call('GET', '/api/auth/me')).json.user).toBeNull();
  });
});
