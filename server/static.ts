import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Serves the built app (dist/) from the academy server, so one process can
 * host everything. Paths are resolved inside the folder only, and every
 * response carries security headers.
 */

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
};

/**
 * The page's Content Security Policy. Notes:
 * - 'unsafe-inline' scripts: needed by the theme snippet in index.html and by the Code Lab, whose
 *   sandboxed srcdoc preview inherits this policy (it adds its own stricter one on top).
 * - 'wasm-unsafe-eval' and blob: workers: the SQL engine (SQLite compiled to WebAssembly).
 * - No 'unsafe-eval', no third-party origins, no framing by other sites.
 */
export const APP_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "frame-src 'self' blob: data:",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': APP_CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
};

/** Returns true if it served (or refused) the request. */
export async function serveStatic(req: IncomingMessage, res: ServerResponse, url: URL, root: string): Promise<boolean> {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  const base = resolve(root);
  let rel: string;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, SECURITY_HEADERS).end();
    return true;
  }
  if (rel.includes('\0')) {
    res.writeHead(400, SECURITY_HEADERS).end();
    return true;
  }
  if (rel === '/' || rel === '') rel = '/index.html';
  const file = resolve(join(base, normalize(rel)));
  // Never serve anything outside the folder (e.g. /../server/data/academy.db).
  if (file !== base && !file.startsWith(base + sep)) {
    res.writeHead(404, SECURITY_HEADERS).end();
    return true;
  }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error('not a file');
    const body = await readFile(file);
    const hashed = /\/assets\//.test(rel);
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
      'Cache-Control': hashed ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Length': String(body.length),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
  return true;
}
