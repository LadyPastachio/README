import { useRef, useState, type ReactNode } from 'react';
import { useScrollToHash } from '@/app/useScrollToHash';
import { Sun, Moon, Monitor, Download, Upload, Trash2, Copy } from 'lucide-react';
import { PageHeader, Panel, Segmented, Switch, Range, Button, Notice, Planned, Dialog } from '@/design/components';
import { useSettings } from '@/core/settings/SettingsContext';
import { ACCENTS } from '@/core/settings/schema';
import { createBackup, planImport, applyImport, clearAllLocalData, type ImportPlan } from '@/core/backup/backup';
import { SETTINGS_KEY } from '@/core/settings/store';
import { useToast } from '@/app/Toast';
import { downloadText, copyText, dateStamp } from './fileHelpers';
import { buildDiagnostics } from './diagnostics';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'learning', label: 'Learning' },
  { id: 'ai', label: 'AI' },
  { id: 'data', label: 'Privacy and data' },
  { id: 'about', label: 'About' },
];

const ACCENT_LABELS: Record<(typeof ACCENTS)[number], string> = { teal: 'Teal', clay: 'Clay', indigo: 'Indigo', moss: 'Moss', plum: 'Plum' };
const ACCENT_SWATCH: Record<(typeof ACCENTS)[number], string> = { teal: '#1d6b64', clay: '#a9492f', indigo: '#4650a8', moss: '#44702f', plum: '#84417a' };
const KEY_NAMES: Record<string, string> = { [SETTINGS_KEY]: 'Settings' };

export function SettingsPage() {
  const { settings, saveState, updateAppearance, updateAccessibility, resetToDefaults, reload, storage } = useSettings();
  const toast = useToast();
  const a = settings.appearance;
  const x = settings.accessibility;

  useScrollToHash('start');

  /* Backup and restore ------------------------------------------------ */
  const fileRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const backupText = () => JSON.stringify(createBackup(storage, __APP_VERSION__), null, 2);
  const onExport = () => {
    if (downloadText(`atelier-academy-backup-${dateStamp()}.json`, backupText())) toast('Backup downloaded');
    else toast('Download was blocked. Use “Copy backup” instead.');
  };
  const onCopyBackup = async () => toast((await copyText(backupText())) ? 'Backup copied to clipboard' : 'Copy was blocked by the browser');
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) {
      setPlan({ ok: false, error: 'That file is larger than any backup this app makes (over 2 MB), so it was not read.' });
      return;
    }
    setPlan(planImport(await file.text(), storage));
    if (fileRef.current) fileRef.current.value = '';
  };
  const onConfirmImport = () => {
    if (plan?.ok && applyImport(plan, storage)) {
      reload();
      toast('Backup restored');
    } else toast('Restore failed: the browser refused to save. Nothing was changed.');
    setPlan(null);
  };
  const onReset = () => {
    clearAllLocalData(storage);
    reload();
    setConfirmReset(false);
    toast('Local data deleted. Settings are back to defaults.');
  };

  const onDiagnostics = async () => {
    const storageWorks = storage.write('academy:__probe', '1');
    storage.remove('academy:__probe');
    const text = JSON.stringify(buildDiagnostics(settings, storageWorks), null, 2);
    toast((await copyText(text)) ? 'Diagnostic report copied' : downloadText(`atelier-diagnostics-${dateStamp()}.json`, text) ? 'Diagnostic report downloaded' : 'The browser blocked both copy and download');
  };

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Settings"
        description="Changes apply immediately and are saved in this browser."
        actions={
          <span className={`save-indicator${saveState === 'failed' ? ' save-indicator--failed' : ''}`} role="status">
            {saveState === 'saved' ? 'All changes saved' : 'Not saved: this browser is blocking storage'}
          </span>
        }
      />

      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map((s) => <a key={s.id} href={`#/settings#${s.id}`}>{s.label}</a>)}
        </nav>

        <div className="settings-sections">
          <Panel title="Appearance" id="appearance">
            <Row label="Theme" hint="“System” follows your device's light or dark setting.">
              <Segmented
                label="Theme"
                value={a.theme}
                onChange={(theme) => updateAppearance({ theme })}
                options={[
                  { value: 'system', label: 'System', icon: <Monitor size={14} aria-hidden="true" /> },
                  { value: 'light', label: 'Light', icon: <Sun size={14} aria-hidden="true" /> },
                  { value: 'dark', label: 'Dark', icon: <Moon size={14} aria-hidden="true" /> },
                ]}
              />
            </Row>
            <Row label="Accent color" hint={`Used for buttons, links and the current page. Now: ${ACCENT_LABELS[a.accent]}.`}>
              <div className="swatches" role="radiogroup" aria-label="Accent color">
                {ACCENTS.map((c) => (
                  <button key={c} type="button" role="radio" aria-checked={a.accent === c} aria-label={ACCENT_LABELS[c]} title={ACCENT_LABELS[c]} className="swatch" style={{ background: ACCENT_SWATCH[c] }} onClick={() => updateAppearance({ accent: c })} />
                ))}
              </div>
            </Row>
            <Row label="Density" hint="Compact fits more on screen with tighter spacing.">
              <Segmented label="Density" value={a.density} onChange={(density) => updateAppearance({ density })} options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]} />
            </Row>
            <Row label="Editor font" hint="Used for code throughout the app.">
              <Segmented label="Editor font" value={a.editorFont} onChange={(editorFont) => updateAppearance({ editorFont })} options={[{ value: 'jetbrains', label: 'JetBrains Mono' }, { value: 'system', label: 'System mono' }]} />
            </Row>
            <Row label="Editor font size" hint="Size of code text.">
              <Range id="editor-size" label="Editor font size" min={12} max={22} value={a.editorFontSize} unit="px" onChange={(editorFontSize) => updateAppearance({ editorFontSize })} />
            </Row>
            <pre className="code-sample code-sample--small" aria-label="Code font preview"><code><span className="tok-k">const</span> greeting = <span className="tok-s">'Hello, world'</span>; <span className="tok-c">{'// preview'}</span></code></pre>
          </Panel>

          <Panel title="Accessibility" id="accessibility">
            <Row label="Text size" hint="Scales all text and spacing in the app.">
              <Range id="text-scale" label="Text size" min={90} max={130} step={5} value={x.textScale} unit="%" onChange={(textScale) => updateAccessibility({ textScale })} />
            </Row>
            <Row label="Reduce motion" hint="Turns off animations and transitions.">
              <Segmented label="Reduce motion" value={x.reducedMotion} onChange={(reducedMotion) => updateAccessibility({ reducedMotion })} options={[{ value: 'system', label: 'System' }, { value: 'reduce', label: 'Reduce' }, { value: 'allow', label: 'Allow' }]} />
            </Row>
            <Row label="High contrast" hint="Darker text and stronger borders.">
              <Switch label="High contrast" checked={x.highContrast} onChange={(highContrast) => updateAccessibility({ highContrast })} />
            </Row>
            <p className="subtle footnote">Every screen works with the keyboard: Tab moves between controls, and <kbd>/</kbd> or <kbd>Ctrl K</kbd> opens search.</p>
          </Panel>

          <Panel title="Learning" id="learning">
            <Planned phase={2}>
              Daily learning load, review reminders, default hint level and when solutions can be revealed. Changing your load will
              never lower what counts as mastery.
            </Planned>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <Planned phase={5}>
                Your personalized learning profile: how you prefer explanations, what seems to help you retain things, and the
                evidence behind it. You'll be able to view, edit, reset and export it.
              </Planned>
            </div>
          </Panel>

          <Panel title="AI" id="ai">
            <div className="mode-banner">
              <span className="mode-dot" aria-hidden="true" />
              <div><strong>Simulated only.</strong> <span className="muted">No AI provider is connected, and nothing you write leaves this device.</span></div>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <Planned phase={6}>Mentor mode, provider choice, usage estimates and data-handling details, once a provider can be configured.</Planned>
            </div>
          </Panel>

          <Panel title="Privacy and data" id="data">
            <div className="data-facts">
              <div><span className="eyebrow">Stored on this device</span><p>Your settings. Nothing else is saved yet.</p></div>
              <div><span className="eyebrow">Sent to a server</span><p>Nothing. There is no server or account yet.</p></div>
              <div><span className="eyebrow">Shared with circles</span><p>Nothing. Circles don't exist yet.</p></div>
            </div>
            <div className="data-actions">
              <div className="data-action">
                <div><strong>Back up</strong><p className="subtle">Save a copy of your data as a file you can restore later or on another device.</p></div>
                <div className="btn-row">
                  <Button onClick={onExport}><Download size={16} aria-hidden="true" /> Download backup</Button>
                  <Button variant="ghost" onClick={onCopyBackup}><Copy size={16} aria-hidden="true" /> Copy backup</Button>
                </div>
              </div>
              <div className="data-action">
                <div><strong>Restore</strong><p className="subtle">The file is checked first, and you'll see what will be replaced before anything changes.</p></div>
                <div className="btn-row">
                  <input ref={fileRef} id="import-file" type="file" accept="application/json,.json" className="visually-hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                  <Button onClick={() => fileRef.current?.click()}><Upload size={16} aria-hidden="true" /> Choose backup file</Button>
                </div>
              </div>
              <div className="data-action">
                <div><strong>Delete local data</strong><p className="subtle">Removes everything this app saved in this browser.</p></div>
                <div className="btn-row">
                  <Button variant="ghost" className="btn--danger-ghost" onClick={() => setConfirmReset(true)}><Trash2 size={16} aria-hidden="true" /> Delete…</Button>
                </div>
              </div>
            </div>
            {plan && !plan.ok && <div style={{ marginTop: 'var(--space-4)' }}><Notice kind="danger"><strong>Couldn't restore.</strong> {plan.error}</Notice></div>}
          </Panel>

          <Panel title="About" id="about">
            <dl className="about-list">
              <div><dt>Version</dt><dd className="tabular">{__APP_VERSION__}</dd></div>
              <div><dt>Release</dt><dd>Phase 1: design system and navigation</dd></div>
              <div><dt>Built so far</dt><dd>Navigation, search, glossary, a sample lesson, these settings, backup and restore</dd></div>
            </dl>
            <div className="data-action" style={{ marginTop: 'var(--space-4)' }}>
              <div><strong>Diagnostic report</strong><p className="subtle">For troubleshooting. Contains app version, settings and browser details. Never your answers, notes or keys.</p></div>
              <div className="btn-row"><Button onClick={onDiagnostics}><Copy size={16} aria-hidden="true" /> Copy report</Button></div>
            </div>
            <div style={{ marginTop: 'var(--space-4)' }}>
              <Button variant="ghost" size="sm" onClick={() => { resetToDefaults(); toast('Settings reset to defaults'); }}>
                Reset settings to defaults
              </Button>
            </div>
          </Panel>
        </div>
      </div>

      <Dialog
        open={!!plan?.ok}
        onClose={() => setPlan(null)}
        title="Restore this backup?"
        labelledBy="restore-title"
        actions={<><Button onClick={() => setPlan(null)}>Cancel</Button><Button variant="primary" onClick={onConfirmImport}>Restore</Button></>}
      >
        {plan?.ok && (
          <>
            <p className="muted">Backup made {new Date(plan.exportedAt).toLocaleString()}.</p>
            <ul className="plan-list">
              {plan.entries.map((e) => (
                <li key={e.key}><strong>{KEY_NAMES[e.key] ?? e.key}</strong> — {e.replacesExisting ? 'will replace what you have now' : 'will be added'}</li>
              ))}
            </ul>
            {plan.ignoredKeys.length > 0 && <Notice kind="warn">{plan.ignoredKeys.length} item(s) in the file aren't recognized by this version and will be skipped.</Notice>}
          </>
        )}
      </Dialog>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Delete all local data?"
        labelledBy="reset-title"
        actions={<><Button onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={onReset}>Delete everything</Button></>}
      >
        <p className="muted">This removes everything Atelier Academy saved in this browser. It can't be undone. Download a backup first if you might want it back.</p>
      </Dialog>
    </>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div className="setting-row__text">
        <span className="field__label">{label}</span>
        {hint && <span className="field__hint">{hint}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}
