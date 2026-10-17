import type { Settings } from '@/core/settings/schema';

/**
 * A troubleshooting report. It deliberately contains no learning content,
 * answers, notes or keys: only the app version, display settings and
 * basic browser facts.
 */
export function buildDiagnostics(settings: Settings, storageWorks: boolean) {
  return {
    report: 'atelier-academy-diagnostics',
    appVersion: __APP_VERSION__,
    createdAt: new Date().toISOString(),
    browser: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixelRatio: window.devicePixelRatio,
    prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    localStorageAvailable: storageWorks,
    settings,
    excluded: ['learning records', 'answers and explanations', 'notes', 'API keys'],
  };
}
