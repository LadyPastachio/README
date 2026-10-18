import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

/**
 * Password hashing and session tokens.
 * Passwords: scrypt with a random salt per password (never stored as text).
 * Sessions: a random token in an HttpOnly cookie; only its SHA-256 hash is stored,
 * so a copy of the database can't be used to sign in.
 */

const N = 16384, R = 8, P = 1, KEYLEN = 64;

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, KEYLEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (err, key) => (err ? reject(err) : resolve(key))));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt);
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[4]!, 'base64');
  const expected = Buffer.from(parts[5]!, 'base64');
  const key = await scryptAsync(password, salt);
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** A dummy hash so failed logins for unknown emails take as long as real ones. */
export const DUMMY_HASH = 'scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64');

export function newToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

export function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

/** Counts failures per key in a time window (login attempts, sign-ups). */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private max: number;
  private windowMs: number;
  private now: () => number;
  constructor(max: number, windowMs: number, now: () => number = Date.now) {
    this.max = max;
    this.windowMs = windowMs;
    this.now = now;
  }
  private recent(key: string): number[] {
    const t = this.now();
    const list = (this.hits.get(key) ?? []).filter((x) => t - x < this.windowMs);
    this.hits.set(key, list);
    return list;
  }
  blocked(key: string): boolean {
    return this.recent(key).length >= this.max;
  }
  hit(key: string): void {
    this.recent(key).push(this.now());
  }
  reset(key: string): void {
    this.hits.delete(key);
  }
}
