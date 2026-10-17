import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { StorageAdapter } from '../persistence/storage';
import { type Settings, type Appearance, type Accessibility, normalizeSettings, DEFAULT_SETTINGS } from './schema';
import { loadSettings, saveSettings } from './store';

type SaveState = 'saved' | 'failed';

interface SettingsContextValue {
  settings: Settings;
  saveState: SaveState;
  updateAppearance: (patch: Partial<Appearance>) => void;
  updateAccessibility: (patch: Partial<Accessibility>) => void;
  resetToDefaults: () => void;
  /** Re-reads settings from storage (after an import or reset). */
  reload: () => void;
  storage: StorageAdapter;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ storage, children }: { storage: StorageAdapter; children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings(storage));
  const [saveState, setSaveState] = useState<SaveState>('saved');

  const commit = useCallback(
    (next: Settings) => {
      setSettings(next);
      setSaveState(saveSettings(storage, next) ? 'saved' : 'failed');
    },
    [storage],
  );

  const updateAppearance = useCallback(
    (patch: Partial<Appearance>) => commit(normalizeSettings({ ...settings, appearance: { ...settings.appearance, ...patch } })),
    [settings, commit],
  );
  const updateAccessibility = useCallback(
    (patch: Partial<Accessibility>) =>
      commit(normalizeSettings({ ...settings, accessibility: { ...settings.accessibility, ...patch } })),
    [settings, commit],
  );
  const resetToDefaults = useCallback(() => commit(DEFAULT_SETTINGS), [commit]);
  const reload = useCallback(() => setSettings(loadSettings(storage)), [storage]);

  useApplySettingsToDocument(settings);

  const value = useMemo(
    () => ({ settings, saveState, updateAppearance, updateAccessibility, resetToDefaults, reload, storage }),
    [settings, saveState, updateAppearance, updateAccessibility, resetToDefaults, reload, storage],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

/** Mirrors settings onto <html> attributes; the CSS reads those attributes. */
function useApplySettingsToDocument(settings: Settings) {
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const systemReduce = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { appearance: a, accessibility: x } = settings;

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = a.theme === 'system' ? (systemDark ? 'dark' : 'light') : a.theme;
    root.dataset.accent = a.accent;
    root.dataset.density = a.density;
    root.dataset.editorFont = a.editorFont;
    root.dataset.motion = x.reducedMotion === 'system' ? (systemReduce ? 'reduce' : 'allow') : x.reducedMotion;
    root.dataset.contrast = x.highContrast ? 'high' : 'normal';
    root.style.setProperty('--editor-font-size', `${a.editorFontSize}px`);
    root.style.fontSize = `${x.textScale}%`;
  }, [a, x, systemDark, systemReduce]);
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}
