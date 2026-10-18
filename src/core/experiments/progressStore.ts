import { z } from 'zod';
import type { StorageAdapter } from '../persistence/storage';

/**
 * Saved state for guided experiments: the learner's code, where they are,
 * which steps passed, and a snapshot of the code at the start of each step
 * (so "Reset step" can undo just that step). Included in backups.
 */

export const EXPERIMENTS_KEY = 'academy:experiments';

const files = z.object({ html: z.string(), css: z.string(), js: z.string() });
const progressSchema = z.object({
  files,
  step: z.number().int().min(0),
  completed: z.array(z.string()).default([]),
  stepStart: z.record(z.string(), files).default({}),
  choice: z.string().nullable().default(null),
  hintsUsed: z.number().int().min(0).default(0),
  finishedAt: z.string().nullable().default(null),
});
export type ExperimentProgress = z.infer<typeof progressSchema>;

const storeSchema = z.object({ version: z.literal(1), experiments: z.record(z.string(), z.unknown()) });

export function normalizeExperiments(input: unknown): { version: 1; experiments: Record<string, ExperimentProgress> } {
  const parsed = storeSchema.safeParse(input);
  const out: Record<string, ExperimentProgress> = {};
  if (parsed.success) {
    for (const [id, value] of Object.entries(parsed.data.experiments)) {
      const p = progressSchema.safeParse(value);
      if (p.success) out[id] = p.data;
    }
  }
  return { version: 1, experiments: out };
}

export function loadExperimentProgress(storage: StorageAdapter, id: string): ExperimentProgress | null {
  try {
    const raw = storage.read(EXPERIMENTS_KEY);
    return raw ? (normalizeExperiments(JSON.parse(raw)).experiments[id] ?? null) : null;
  } catch {
    return null;
  }
}

export function saveExperimentProgress(storage: StorageAdapter, id: string, progress: ExperimentProgress | null): boolean {
  let store = { version: 1 as const, experiments: {} as Record<string, ExperimentProgress> };
  try {
    const raw = storage.read(EXPERIMENTS_KEY);
    if (raw) store = normalizeExperiments(JSON.parse(raw));
  } catch {
    /* start fresh if damaged */
  }
  if (progress) store.experiments[id] = progress;
  else delete store.experiments[id];
  return storage.write(EXPERIMENTS_KEY, JSON.stringify(store));
}
