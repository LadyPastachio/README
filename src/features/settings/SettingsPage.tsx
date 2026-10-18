import { useRef, useState, type ReactNode } from 'react';
import { useScrollToHash } from '@/app/useScrollToHash';
import { Sun, Moon, Monitor, Download, Upload, Trash2, Copy } from 'lucide-react';
import { PageHeader, Panel, Segmented, Switch, Range, Button, Notice, Planned, Dialog } from '@/design/components';
import { useSettings } from '@/core/settings/SettingsContext';
import { ACCENTS, EXPLANATION_FORMATS, FORMAT_LABELS } from '@/core/settings/schema';
import { useLearning } from '@/core/learning/LearningContext';
import { RECORDS_KEY } from '@/core/learning/records';
import { observe } from '@/core/learning/observations';
import { helpEffects, HELP_LABELS } from '@/core/learning/help';
import { Link } from 'react-router-dom';
import { LESSONS } from '@/content/lessons';
import { PATHS } from '@/content/paths';
import { createBackup, planImport, applyImport, clearAllLocalData, type ImportPlan } from '@/core/backup/backup';
import { SETTINGS_KEY } from '@/core/settings/store';
import { useToast } from '@/app/Toast';
import { downloadText, copyText, dateStamp } from './fileHelpers';
import { buildDiagnostics } from './diagnostics';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'accessibility', label: 'Accessibility' },
  { id: 'learning', label: 'Learning' },
  { id: 'profile', label: 'Learning profile' },
  { id: 'ai', label: 'AI' },
  { id: 'data', label: 'Privacy and data' },
  { id: 'about', label: 'About' },
];

const ACCENT_LABELS: Record<(typeof ACCENTS)[number], string> = { teal: 'Teal', clay: 'Clay', indigo: 'Indigo', moss: 'Moss', plum: 'Plum' };
const ACCENT_SWATCH: Record<(typeof ACCENTS)[number], string> = { teal: '#1d6b64', clay: '#a9492f', indigo: '#4650a8', moss: '#44702f', plum: '#84417a' };
const KEY_NAMES: Record<string, string> = {
  [SETTINGS_KEY]: 'Settings and learning profile',
  [RECORDS_KEY]: 'Learning records (answers, hints, reviews)',
  'academy:lab': 'Your Code Lab code',
  'academy:projects': 'Your project notes',
};

export function SettingsPage() {
  const { settings, saveState, updateAppearance, updateAccessibility, updateLearning, updateProfile, resetProfile, resetToDefaults, reload, storage } = useSettings();
  const learning = useLearning();
  const l = settings.learning;
  const pr = settings.profile;
  const obs = observe(learning.events, LESSONS);
  const helpFx = helpEffects(learning.events);
  const [confirmProfileReset, setConfirmProfileReset] = useState(false);
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
      learning.reload();
      toast('Backup restored');
    } else toast('Restore failed: the browser refused to save. Nothing was changed.');
    setPlan(null);
  };
  const onReset = () => {
    clearAllLocalData(storage);
    reload();
    learning.reload();
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
            <Row label="Current path" hint="The project you're focusing on. Home suggests its next steps. Switching keeps everything you've done.">
              <select id="current-path" className="input select" value={l.currentPath ?? ''} onChange={(e) => updateLearning({ currentPath: (e.target.value || null) as typeof l.currentPath })} aria-label="Current path">
                <option value="">Not chosen yet</option>
                {PATHS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Row>
            <Row label="Hours a week" hint="Used only for time estimates on milestones.">
              <Range id="weekly-hours" label="Hours a week" min={1} max={20} value={l.weeklyHours} unit=" h" onChange={(weeklyHours) => updateLearning({ weeklyHours })} />
            </Row>
            <Row label="Daily learning load" hint="How many activities Home suggests each day. It never changes what counts as mastery.">
              <Segmented label="Daily learning load" value={String(l.dailyLoad) as '1' | '2' | '3'} onChange={(v) => updateLearning({ dailyLoad: Number(v) })} options={[{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }]} />
            </Row>
            <Row label="Lesson order" hint="Try a question before the explanation, or read first. Your records will show which works better for you.">
              <Segmented label="Lesson order" value={l.lessonOrder} onChange={(lessonOrder) => updateLearning({ lessonOrder })} options={[{ value: 'explain-first', label: 'Explain first' }, { value: 'try-first', label: 'Try first' }]} />
            </Row>
            <Row label="Hints" hint="When the hint button becomes available in a lesson.">
              <Segmented label="Hints" value={l.hintTiming} onChange={(hintTiming) => updateLearning({ hintTiming })} options={[{ value: 'anytime', label: 'Any time' }, { value: 'after-attempt', label: 'After my first try' }]} />
            </Row>
            <Row label="Show solution" hint="When the “Show solution” button appears. Using it is recorded and marks the skill as needing another challenge.">
              <Segmented label="Show solution" value={l.solutionReveal} onChange={(solutionReveal) => updateLearning({ solutionReveal })} options={[{ value: 'after-1', label: 'After 1 miss' }, { value: 'after-2', label: 'After 2 misses' }, { value: 'never', label: 'Never' }]} />
            </Row>
            <Row label="Ask how sure I am" hint="A quick confidence check before each answer. Being sure and wrong often points to a misunderstanding worth fixing.">
              <Switch label="Ask how sure I am" checked={l.askConfidence} onChange={(askConfidence) => updateLearning({ askConfidence })} />
            </Row>
          </Panel>

          <Panel title="Learning profile" id="profile">
            <p className="muted small profile-intro">
              What you tell us is kept separate from what your activity shows. Neither is a fixed “learning style”: enjoying a format isn't always the same as learning best from it, so both are worth checking now and then.
            </p>
            <div className="profile-cols">
              <div className="profile-col">
                <h3 className="profile-h">What you say helps</h3>
                <fieldset className="format-picks">
                  <legend className="field__label">Explanations I find helpful</legend>
                  {EXPLANATION_FORMATS.map((f) => (
                    <label key={f} className="check">
                      <input type="checkbox" checked={pr.preferredFormats.includes(f)} onChange={() => updateProfile({ preferredFormats: pr.preferredFormats.includes(f) ? pr.preferredFormats.filter((x) => x !== f) : [...pr.preferredFormats, f] })} />
                      <span>{FORMAT_LABELS[f]}</span>
                    </label>
                  ))}
                </fieldset>
                <fieldset className="format-picks">
                  <legend className="field__label">Explanations I find frustrating</legend>
                  {EXPLANATION_FORMATS.map((f) => (
                    <label key={f} className="check">
                      <input type="checkbox" checked={pr.frustratingFormats.includes(f)} onChange={() => updateProfile({ frustratingFormats: pr.frustratingFormats.includes(f) ? pr.frustratingFormats.filter((x) => x !== f) : [...pr.frustratingFormats, f], preferredFormats: pr.preferredFormats.filter((x) => x !== f) })} />
                      <span>{FORMAT_LABELS[f]}</span>
                    </label>
                  ))}
                </fieldset>
                <div className="field">
                  <span className="field__label">Detail before trying something</span>
                  <Segmented label="Detail level" value={pr.detailLevel} onChange={(detailLevel) => updateProfile({ detailLevel })} options={[{ value: 'brief', label: 'Brief' }, { value: 'standard', label: 'Standard' }, { value: 'detailed', label: 'Detailed' }]} />
                  <span className="field__hint">Brief tucks away background text. Detailed opens step-by-step walkthroughs automatically.</span>
                </div>
                <div className="field">
                  <label htmlFor="confusing" className="field__label">Topics I find confusing</label>
                  <textarea id="confusing" className="input textarea textarea--sm" maxLength={1000} value={pr.confusingTopics} onChange={(e) => updateProfile({ confusingTopics: e.target.value })} placeholder="e.g. when to use return, or what JSON.parse does" />
                </div>
                <div className="field">
                  <label htmlFor="notes" className="field__label">Anything else about how you learn</label>
                  <textarea id="notes" className="input textarea textarea--sm" maxLength={1000} value={pr.notes} onChange={(e) => updateProfile({ notes: e.target.value })} placeholder="e.g. I like to see a working example before I try" />
                </div>
                <p className="subtle small">Used to choose which explanation opens first in a lesson, and included in your Learning Evidence and assessor prompts. <Link to="/welcome">Redo the check-in</Link></p>
              </div>
              <div className="profile-col profile-col--observed">
                <h3 className="profile-h">What your activity shows</h3>
                {obs.answered === 0 ? (
                  <p className="muted small">Nothing yet. This fills in as you answer questions.</p>
                ) : (
                  <>
                    <dl className="obs-list">
                      <div><dt>Answers recorded</dt><dd className="tabular">{obs.answered}</dd></div>
                      <div><dt>Right first time</dt><dd className="tabular">{obs.firstTryRate}%</dd></div>
                      <div><dt>With a hint open</dt><dd className="tabular">{obs.hintRate}%</dd></div>
                      <div><dt>Solutions shown</dt><dd className="tabular">{obs.revealCount}</dd></div>
                      <div><dt>Sure, but wrong</dt><dd className="tabular">{obs.confidentlyWrong}</dd></div>
                    </dl>
                    {obs.byFormat.length > 0 && (
                      <ul className="format-bars" aria-label="First-try accuracy by activity type">
                        {obs.byFormat.map((f) => (
                          <li key={f.label}>
                            <span className="format-bars__label">{f.label} <span className="subtle tabular">({f.attempts})</span></span>
                            <span className="format-bars__track"><span style={{ width: `${f.firstTryRate}%` }} /></span>
                            <span className="tabular small">{f.firstTryRate}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {helpFx.length > 0 && (
                      <ul className="format-bars" aria-label="How often each kind of help was used, and first-try accuracy afterwards">
                        {helpFx.map((h) => (
                          <li key={h.kind}>
                            <span className="format-bars__label">After “{HELP_LABELS[h.kind]}” <span className="subtle tabular">({h.uses}×)</span></span>
                            <span className="format-bars__track"><span style={{ width: `${h.after}%` }} /></span>
                            <span className="tabular small">{h.after}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {pr.observationFeedback.filter((f) => !f.statement.startsWith('suggest:')).length > 0 && (
                      <p className="subtle small">You've confirmed {pr.observationFeedback.filter((f) => f.agreed && !f.statement.startsWith('suggest:')).length} and disagreed with {pr.observationFeedback.filter((f) => !f.agreed && !f.statement.startsWith('suggest:')).length} observations.</p>
                    )}
                    {obs.statements.length > 0 ? (
                      <ul className="obs-statements">{obs.statements.map((t) => <li key={t}>{t}</li>)}</ul>
                    ) : (
                      <p className="subtle small">Patterns are only suggested once there are at least 8 answers and a clear difference. Does this match your experience? You can note it on the left.</p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="btn-row profile-actions">
              <Button size="sm" onClick={async () => toast((await copyText(JSON.stringify({ stated: pr, observed: obs, exportedAt: new Date().toISOString() }, null, 2))) ? 'Profile copied' : 'Copy was blocked by the browser')}>
                <Copy size={14} aria-hidden="true" /> Copy profile
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast(downloadText(`learning-profile-${dateStamp()}.json`, JSON.stringify({ stated: pr, observed: obs, exportedAt: new Date().toISOString() }, null, 2)) ? 'Profile downloaded' : 'Download was blocked. Use Copy instead.')}>
                <Download size={14} aria-hidden="true" /> Download
              </Button>
              <Button size="sm" variant="ghost" className="btn--danger-ghost" onClick={() => setConfirmProfileReset(true)}>Reset what I said</Button>
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
              <div><span className="eyebrow">Stored on this device</span><p>Settings, your learning profile, learning records (answers, explanations, hints, reviews), your Code Lab code and project notes.</p></div>
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
              <div><dt>Release</dt><dd>Phase 2: learning engine</dd></div>
              <div><dt>Built so far</dt><dd>10 lessons, saved progress, mastery from evidence, spaced review, Learning Evidence export, learning profile, settings, backup and restore</dd></div>
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
        <p className="muted">This removes everything Atelier Academy saved in this browser, including all your learning records. It can't be undone. Download a backup first if you might want it back.</p>
      </Dialog>

      <Dialog
        open={confirmProfileReset}
        onClose={() => setConfirmProfileReset(false)}
        title="Reset what you said about how you learn?"
        labelledBy="profile-reset-title"
        actions={<><Button onClick={() => setConfirmProfileReset(false)}>Cancel</Button><Button variant="danger" onClick={() => { resetProfile(); setConfirmProfileReset(false); toast('Profile reset'); }}>Reset</Button></>}
      >
        <p className="muted">This clears your preferred formats, confusing topics and notes. Your learning records and what they show are not affected.</p>
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
