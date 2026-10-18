import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { StorageAdapter } from '../persistence/storage';
import { type Settings, type Appearance, type Accessibility, type LearningPrefs, type Profile, normalizeSettings, DEFAULT_SETTINGS } from './schema';
import { loadSettings, saveSettings } from './store';

type SaveState = 'saved' | 'failed';

interface SettingsContextValue {
  settings: Settings;
  saveState: SaveState;
  updateAppearance: (patch: Partial<Appearance>) => void;
  updateAccessibility: (patch: Partial<Accessibility>) => void;
  updateLearning: (patch: Partial<LearningPrefs>) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  resetProfile: () => void;
  resetToDefaults: () => void;
  /** Re-reads settings from storage (after an import or reset). */
  reload: () => void;
  storage: StorageAdapter;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ storage, children }: { storage: StorageAdapter; children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings(storage));
  const [saveState, setSaveState] = useState<SaveState>('saved');
  // Always build updates on the latest settings, so two updates in a row never overwrite each other.
  const latest = useRef(settings);

  const commit = useCallback(
    (make: (current: Settings) => Settings) => {
      const next = normalizeSettings(make(latest.current));
      latest.current = next;
      setSettings(next);
      setSaveState(saveSettings(storage, next) ? 'saved' : 'failed');
    },
    [storage],
  );

  const updateAppearance = useCallback((patch: Partial<Appearance>) => commit((c) => ({ ...c, appearance: { ...c.appearance, ...patch } })), [commit]);
  const updateAccessibility = useCallback((patch: Partial<Accessibility>) => commit((c) => ({ ...c, accessibility: { ...c.accessibility, ...patch } })), [commit]);
  const updateLearning = useCallback((patch: Partial<LearningPrefs>) => commit((c) => ({ ...c, learning: { ...c.learning, ...patch } })), [commit]);
  const updateProfile = useCallback((patch: Partial<Profile>) => commit((c) => ({ ...c, profile: { ...c.profile, ...patch } })), [commit]);
  const resetProfile = useCallback(() => commit((c) => ({ ...c, profile: DEFAULT_SETTINGS.profile })), [commit]);
  /** Resets display and learning preferences. The learning profile is kept; it has its own reset. */
  const resetToDefaults = useCallback(() => commit((c) => ({ ...DEFAULT_SETTINGS, profile: c.profile })), [commit]);
  const reload = useCallback(() => {
    const fresh = loadSettings(storage);
    latest.current = fresh;
    setSettings(fresh);
  }, [storage]);

  useApplySettingsToDocument(settings);

  const value = useMemo(
    () => ({ settings, saveState, updateAppearance, updateAccessibility, updateLearning, updateProfile, resetProfile, resetToDefaults, reload, storage }),
    [settings, saveState, updateAppearance, updateAccessibility, updateLearning, updateProfile, resetProfile, resetToDefaults, reload, storage],
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
