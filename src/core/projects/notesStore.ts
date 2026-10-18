import { z } from 'zod';
import type { StorageAdapter } from '../persistence/storage';

/** Your own notes for each project: design notes, known issues, future improvements. */

export const PROJECTS_KEY = 'academy:projects';
const note = z.string().max(5000).catch('');
const projectNotesSchema = z.object({ design: note, issues: note, improvements: note });
export type ProjectNotes = z.infer<typeof projectNotesSchema>;
export const EMPTY_NOTES: ProjectNotes = { design: '', issues: '', improvements: '' };

export function normalizeProjects(input: unknown): { version: 1; notes: Record<string, ProjectNotes> } {
  const out: { version: 1; notes: Record<string, ProjectNotes> } = { version: 1, notes: {} };
  const raw = typeof input === 'object' && input !== null ? (input as { notes?: unknown }).notes : undefined;
  if (typeof raw !== 'object' || raw === null) return out;
  for (const [id, n] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^[a-z-]+$/.test(id)) continue;
    const r = projectNotesSchema.safeParse(n);
    if (r.success) out.notes[id] = r.data;
  }
  return out;
}

export function loadProjectNotes(storage: StorageAdapter, pathId: string): ProjectNotes {
  try {
    return normalizeProjects(JSON.parse(storage.read(PROJECTS_KEY) ?? '{}')).notes[pathId] ?? EMPTY_NOTES;
  } catch {
    return EMPTY_NOTES;
  }
}

export function saveProjectNotes(storage: StorageAdapter, pathId: string, notes: ProjectNotes): boolean {
  let store = normalizeProjects({});
  try {
    store = normalizeProjects(JSON.parse(storage.read(PROJECTS_KEY) ?? '{}'));
  } catch {
    /* start fresh */
  }
  store.notes[pathId] = notes;
  return storage.write(PROJECTS_KEY, JSON.stringify(store));
}
