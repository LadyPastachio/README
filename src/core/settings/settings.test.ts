import { normalizeSettings, DEFAULT_SETTINGS } from './schema';
import { loadSettings, saveSettings, SETTINGS_KEY } from './store';
import { createMemoryAdapter, createLocalStorageAdapter } from '../persistence/storage';

describe('settings schema', () => {
  it('gives full defaults for empty or garbage input', () => {
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings('nonsense')).toEqual(DEFAULT_SETTINGS);
  });

  it('keeps valid fields and repairs invalid ones individually', () => {
    const s = normalizeSettings({ appearance: { theme: 'dark', accent: 'neon', editorFontSize: 400 } });
    expect(s.appearance.theme).toBe('dark');
    expect(s.appearance.accent).toBe('teal');
    expect(s.appearance.editorFontSize).toBe(14);
    expect(s.accessibility).toEqual(DEFAULT_SETTINGS.accessibility);
  });

  it('rejects out-of-range text scale', () => {
    expect(normalizeSettings({ accessibility: { textScale: 300 } }).accessibility.textScale).toBe(100);
    expect(normalizeSettings({ accessibility: { textScale: 120 } }).accessibility.textScale).toBe(120);
  });
});

describe('settings store', () => {
  it('round-trips through storage', () => {
    const storage = createMemoryAdapter();
    const s = normalizeSettings({ appearance: { theme: 'light', accent: 'plum' } });
    expect(saveSettings(storage, s)).toBe(true);
    expect(loadSettings(storage)).toEqual(s);
  });

  it('falls back to defaults when stored JSON is corrupt', () => {
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: '{not json' });
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
  });
});

describe('local storage adapter', () => {
  it('reports failure instead of throwing when the browser blocks storage', () => {
    const blocked = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('quota'); },
      removeItem: () => { throw new Error('blocked'); },
      key: () => null,
      get length(): number { throw new Error('blocked'); },
      clear: () => {},
    } as unknown as Storage;
    const adapter = createLocalStorageAdapter(blocked);
    expect(adapter.read('academy:x')).toBeNull();
    expect(adapter.write('academy:x', '1')).toBe(false);
    expect(() => adapter.remove('academy:x')).not.toThrow();
    expect(adapter.keys()).toEqual([]);
  });

  it('only lists keys that belong to this app', () => {
    localStorage.clear();
    localStorage.setItem('academy:settings', '{}');
    localStorage.setItem('other-site', 'x');
    expect(createLocalStorageAdapter(localStorage).keys()).toEqual(['academy:settings']);
  });
});
