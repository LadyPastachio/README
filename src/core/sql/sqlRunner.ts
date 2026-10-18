import sqlJsSource from 'sql.js/dist/sql-wasm.js?raw';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { WORKER_HANDLER } from './workerSource';

/**
 * Runs SQL with SQLite compiled to WebAssembly (sql.js), inside a Web
 * Worker. The worker has no access to the page, storage or network, and a
 * query that runs too long is stopped by terminating the worker.
 */

export interface ResultSet {
  columns: string[];
  values: (string | number | null | Uint8Array)[][];
}
export type SqlOutcome = { ok: true; results: ResultSet[]; ms: number } | { ok: false; error: string; ms: number };

export const SQL_TIMEOUT_MS = 2000;

declare global {
  interface Window {
    /** Set by the single-file preview build, which can't load separate files. */
    __SQL_WASM_B64__?: string;
  }
}

let wasmPromise: Promise<ArrayBuffer> | null = null;
function loadWasm(): Promise<ArrayBuffer> {
  wasmPromise ??= (async () => {
    if (typeof window !== 'undefined' && window.__SQL_WASM_B64__) {
      const bin = atob(window.__SQL_WASM_B64__);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes.buffer;
    }
    const res = await fetch(wasmUrl);
    if (!res.ok) throw new Error(`Could not load the SQL engine (status ${res.status}).`);
    return res.arrayBuffer();
  })();
  wasmPromise.catch(() => (wasmPromise = null));
  return wasmPromise;
}

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
let nextId = 1;
const pending = new Map<number, (o: { ok: true; results: ResultSet[] } | { ok: false; error: string }) => void>();

function startWorker(): Promise<void> {
  if (ready) return ready;
  ready = (async () => {
    const wasm = await loadWasm();
    const blob = new Blob([sqlJsSource, '\n', WORKER_HANDLER], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const w = new Worker(url);
    URL.revokeObjectURL(url);
    worker = w;
    await new Promise<void>((resolve, reject) => {
      w.onmessage = (e) => {
        const m = e.data;
        if (m.type === 'ready') resolve();
        else if (m.type === 'result') {
          pending.get(m.id)?.(m.ok ? { ok: true, results: m.results } : { ok: false, error: m.error });
          pending.delete(m.id);
        }
      };
      w.onerror = (e) => reject(new Error(e.message || 'The SQL engine failed to start.'));
      w.postMessage({ type: 'init', wasm });
    });
  })();
  ready.catch(() => stopWorker());
  return ready;
}

function stopWorker() {
  worker?.terminate();
  worker = null;
  ready = null;
  for (const [, done] of pending) done({ ok: false, error: 'The SQL engine was restarted.' });
  pending.clear();
}

/** Runs setup (schema and data), then the learner's query, on a fresh database. */
export async function runSql(setup: string, query: string, timeoutMs = SQL_TIMEOUT_MS): Promise<SqlOutcome> {
  const started = performance.now();
  const ms = () => Math.round(performance.now() - started);
  try {
    await startWorker();
  } catch (e) {
    return { ok: false, error: (e as Error).message || 'The SQL engine could not start in this browser.', ms: ms() };
  }
  const id = nextId++;
  return new Promise<SqlOutcome>((resolve) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      stopWorker();
      resolve({ ok: false, error: `The query ran for more than ${timeoutMs / 1000} seconds, so it was stopped. Check for a recursive query that never ends.`, ms: ms() });
    }, timeoutMs);
    pending.set(id, (o) => {
      clearTimeout(timer);
      resolve({ ...o, ms: ms() });
    });
    worker!.postMessage({ type: 'run', id, setup, query });
  });
}
