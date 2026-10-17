import type { StorageAdapter } from '../persistence/storage';
import { normalizeSettings, type Settings } from './schema';

export const SETTINGS_KEY = 'academy:settings';

export function loadSettings(storage: StorageAdapter): Settings {
  const raw = storage.read(SETTINGS_KEY);
  if (!raw) return normalizeSettings({});
  try {
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return normalizeSettings({});
  }
}

export function saveSettings(storage: StorageAdapter, settings: Settings): boolean {
  return storage.write(SETTINGS_KEY, JSON.stringify(settings));
}
