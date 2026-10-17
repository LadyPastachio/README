/**
 * The one place the app reads and writes saved data.
 *
 * Everything goes through this small interface instead of calling
 * `localStorage` directly. Today the data lives in the browser; later a
 * server-backed adapter can implement the same interface (see DECISIONS.md, D4).
 */
export interface StorageAdapter {
  /** Returns the stored text for a key, or null if missing or unreadable. */
  read(key: string): string | null;
  /** Saves text under a key. Returns false if saving failed (e.g. storage blocked or full). */
  write(key: string, value: string): boolean;
  remove(key: string): void;
  /** Lists keys that belong to this app. */
  keys(): string[];
}

/** All app keys share this prefix so we never touch another site's data. */
export const KEY_PREFIX = 'academy:';

/** Browser storage. Every call is wrapped because private windows can block it. */
export function createLocalStorageAdapter(store: Storage | undefined = safeLocalStorage()): StorageAdapter {
  if (!store) return createMemoryAdapter();
  return {
    read(key) {
      try {
        return store.getItem(key);
      } catch {
        return null;
      }
    },
    write(key, value) {
      try {
        store.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        store.removeItem(key);
      } catch {
        /* nothing to clean up */
      }
    },
    keys() {
      try {
        const out: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k && k.startsWith(KEY_PREFIX)) out.push(k);
        }
        return out;
      } catch {
        return [];
      }
    },
  };
}

/** Keeps data in memory only. Used in tests and when browser storage is unavailable. */
export function createMemoryAdapter(initial: Record<string, string> = {}): StorageAdapter {
  const data = new Map(Object.entries(initial));
  return {
    read: (key) => data.get(key) ?? null,
    write: (key, value) => {
      data.set(key, value);
      return true;
    },
    remove: (key) => {
      data.delete(key);
    },
    keys: () => [...data.keys()].filter((k) => k.startsWith(KEY_PREFIX)),
  };
}

function safeLocalStorage(): Storage | undefined {
  try {
    const s = globalThis.localStorage;
    const probe = `${KEY_PREFIX}__probe`;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return undefined;
  }
}
