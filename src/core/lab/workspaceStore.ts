import { z } from 'zod';
import type { StorageAdapter } from '../persistence/storage';
import type { LabFiles } from './buildDocument';

/** Your code for each Code Lab exercise, saved as you type. */

export const LAB_KEY = 'academy:lab';
const MAX_FILE = 100_000;

const filesSchema = z.object({ html: z.string().max(MAX_FILE), css: z.string().max(MAX_FILE), js: z.string().max(MAX_FILE) });
const workspaceSchema = z.object({ files: filesSchema, updatedAt: z.string(), prediction: z.string().max(2000).optional() });
const storeSchema = z.object({ version: z.literal(1), workspaces: z.record(z.string(), workspaceSchema) });
export type LabStore = z.infer<typeof storeSchema>;
export type Workspace = LabStore['workspaces'][string];

export function normalizeLabStore(input: unknown): LabStore {
  const raw = typeof input === 'object' && input !== null ? (input as { workspaces?: unknown }) : {};
  const out: LabStore = { version: 1, workspaces: {} };
  if (typeof raw.workspaces !== 'object' || raw.workspaces === null) return out;
  for (const [id, ws] of Object.entries(raw.workspaces as Record<string, unknown>)) {
    const r = workspaceSchema.safeParse(ws);
    if (r.success) out.workspaces[id] = r.data;
  }
  return out;
}

export function loadLabStore(storage: StorageAdapter): LabStore {
  const raw = storage.read(LAB_KEY);
  if (!raw) return { version: 1, workspaces: {} };
  try {
    return normalizeLabStore(JSON.parse(raw));
  } catch {
    return { version: 1, workspaces: {} };
  }
}

export function saveWorkspace(storage: StorageAdapter, id: string, ws: Partial<Workspace> & { files: LabFiles }): boolean {
  const store = loadLabStore(storage);
  const prev = store.workspaces[id];
  store.workspaces[id] = { ...prev, ...ws, files: clip(ws.files), updatedAt: new Date().toISOString() };
  return storage.write(LAB_KEY, JSON.stringify(store));
}

export function removeWorkspace(storage: StorageAdapter, id: string): void {
  const store = loadLabStore(storage);
  delete store.workspaces[id];
  storage.write(LAB_KEY, JSON.stringify(store));
}

const clip = (f: LabFiles): LabFiles => ({ html: f.html.slice(0, MAX_FILE), css: f.css.slice(0, MAX_FILE), js: f.js.slice(0, MAX_FILE) });
