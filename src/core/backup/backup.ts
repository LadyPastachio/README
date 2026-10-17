import { z } from 'zod';
import type { StorageAdapter } from '../persistence/storage';
import { SETTINGS_KEY } from '../settings/store';
import { normalizeSettings } from '../settings/schema';

/**
 * Backup files: a portable copy of everything the app saves locally.
 *
 * Imports are validated before anything is written, and the caller must
 * show the person what will change and ask for confirmation first.
 */

export const BACKUP_FORMAT = 'atelier-academy-backup';
export const BACKUP_VERSION = 1;

/** Keys we know how to back up, with a validator for each. Grows as features are added. */
const KNOWN_KEYS: Record<string, (value: unknown) => unknown> = {
  [SETTINGS_KEY]: normalizeSettings,
};

const backupFileSchema = z.object({
  format: z.literal(BACKUP_FORMAT),
  version: z.number().int().positive(),
  exportedAt: z.string(),
  appVersion: z.string().optional(),
  data: z.record(z.string(), z.unknown()),
});

export type BackupFile = z.infer<typeof backupFileSchema>;

export function createBackup(storage: StorageAdapter, appVersion: string, now = new Date()): BackupFile {
  const data: Record<string, unknown> = {};
  for (const key of Object.keys(KNOWN_KEYS)) {
    const raw = storage.read(key);
    if (raw === null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      /* skip unreadable entries rather than exporting garbage */
    }
  }
  return { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now.toISOString(), appVersion, data };
}

export type ImportPlan =
  | { ok: true; exportedAt: string; entries: { key: string; value: unknown; replacesExisting: boolean }[]; ignoredKeys: string[] }
  | { ok: false; error: string };

/** Checks a backup file's text and describes what importing it would do. Writes nothing. */
export function planImport(text: string, storage: StorageAdapter): ImportPlan {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file isn't valid JSON, so it can't be a backup from this app." };
  }
  const parsed = backupFileSchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: "This file doesn't look like an Atelier Academy backup." };
  }
  const file = parsed.data;
  if (file.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: `This backup was made by a newer version of the app (format ${file.version}). Update the app, then try again.`,
    };
  }
  const entries: { key: string; value: unknown; replacesExisting: boolean }[] = [];
  const ignoredKeys: string[] = [];
  for (const [key, value] of Object.entries(file.data)) {
    const validate = KNOWN_KEYS[key];
    if (!validate) {
      ignoredKeys.push(key);
      continue;
    }
    entries.push({ key, value: validate(value), replacesExisting: storage.read(key) !== null });
  }
  if (entries.length === 0) {
    return { ok: false, error: 'This backup contains nothing this version of the app can restore.' };
  }
  return { ok: true, exportedAt: file.exportedAt, entries, ignoredKeys };
}

/** Writes a plan produced by planImport. Call only after the person confirms. */
export function applyImport(plan: Extract<ImportPlan, { ok: true }>, storage: StorageAdapter): boolean {
  return plan.entries.every((e) => storage.write(e.key, JSON.stringify(e.value)));
}

/** Removes every key this app owns. */
export function clearAllLocalData(storage: StorageAdapter): void {
  for (const key of storage.keys()) storage.remove(key);
}
