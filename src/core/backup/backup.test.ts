import { createBackup, planImport, applyImport, clearAllLocalData, BACKUP_FORMAT } from './backup';
import { createMemoryAdapter } from '../persistence/storage';
import { SETTINGS_KEY, loadSettings } from '../settings/store';

const settingsJson = JSON.stringify({ version: 1, appearance: { theme: 'dark', accent: 'moss' } });

describe('backup export', () => {
  it('includes known keys and records format, version and time', () => {
    const storage = createMemoryAdapter({ [SETTINGS_KEY]: settingsJson, 'academy:unknown': '1' });
    const b = createBackup(storage, '0.1.0', new Date('2026-10-17T10:00:00Z'));
    expect(b.format).toBe(BACKUP_FORMAT);
    expect(b.exportedAt).toBe('2026-10-17T10:00:00.000Z');
    expect(Object.keys(b.data)).toEqual([SETTINGS_KEY]);
  });
});

describe('backup import', () => {
  it('round-trips into a fresh browser', () => {
    const source = createMemoryAdapter({ [SETTINGS_KEY]: settingsJson });
    const text = JSON.stringify(createBackup(source, '0.1.0'));
    const target = createMemoryAdapter();
    const plan = planImport(text, target);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.entries[0]?.replacesExisting).toBe(false);
    expect(applyImport(plan, target)).toBe(true);
    expect(loadSettings(target).appearance.accent).toBe('moss');
  });

  it('planning writes nothing, and flags data it would replace', () => {
    const target = createMemoryAdapter({ [SETTINGS_KEY]: '{"version":1}' });
    const text = JSON.stringify(createBackup(createMemoryAdapter({ [SETTINGS_KEY]: settingsJson }), '0.1.0'));
    const plan = planImport(text, target);
    expect(plan.ok && plan.entries[0]?.replacesExisting).toBe(true);
    expect(target.read(SETTINGS_KEY)).toBe('{"version":1}');
  });

  it('rejects non-JSON, foreign files and newer formats with clear messages', () => {
    const s = createMemoryAdapter();
    expect(planImport('hello', s)).toMatchObject({ ok: false, error: expect.stringContaining('valid JSON') });
    expect(planImport('{"some":"thing"}', s)).toMatchObject({ ok: false, error: expect.stringContaining("doesn't look like") });
    const future = { format: BACKUP_FORMAT, version: 99, exportedAt: 'x', data: {} };
    expect(planImport(JSON.stringify(future), s)).toMatchObject({ ok: false, error: expect.stringContaining('newer version') });
  });

  it('skips unknown keys and repairs invalid values', () => {
    const file = { format: BACKUP_FORMAT, version: 1, exportedAt: 'x', data: { [SETTINGS_KEY]: { appearance: { theme: 'purple' } }, 'academy:evil': 'x' } };
    const plan = planImport(JSON.stringify(file), createMemoryAdapter());
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.ignoredKeys).toEqual(['academy:evil']);
    expect((plan.entries[0]?.value as { appearance: { theme: string } }).appearance.theme).toBe('system');
  });

  it('refuses a backup with nothing restorable', () => {
    const file = { format: BACKUP_FORMAT, version: 1, exportedAt: 'x', data: { other: 1 } };
    expect(planImport(JSON.stringify(file), createMemoryAdapter()).ok).toBe(false);
  });
});

describe('clearAllLocalData', () => {
  it('removes only this app’s keys', () => {
    const s = createMemoryAdapter({ [SETTINGS_KEY]: '{}', 'academy:other': '1', 'not-ours': 'keep' });
    clearAllLocalData(s);
    expect(s.read(SETTINGS_KEY)).toBeNull();
    expect(s.read('not-ours')).toBe('keep');
  });
});
