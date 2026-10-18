import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Play, CheckCheck, RotateCcw, Lightbulb, FileCode2, Palette, Braces, CircleCheck, CircleX, Loader2, AlertTriangle, Info, ArrowRight, Eye, PartyPopper, ChevronDown } from 'lucide-react';
import { getExperiment } from '@/content/experiments';
import type { Experiment, ExperimentFile } from '@/content/experiments/schema';
import { useSettings, useMediaQuery } from '@/core/settings/SettingsContext';
import { loadExperimentProgress, saveExperimentProgress, type ExperimentProgress } from '@/core/experiments/progressStore';
import type { LabFiles } from '@/core/lab/buildDocument';
import { Button, CodeBlock, Dialog, Segmented } from '@/design/components';
import { NotFoundPage } from '@/app/NotFoundPage';
import { useToast } from '@/app/Toast';
import { CodeEditor, type CodeEditorHandle } from '@/features/codelab/CodeEditor';
import { useLabRunner, type CheckResult } from '@/features/codelab/useLabRunner';
import '@/features/codelab/codelab.css';
import './experiments.css';

const FILES: { kind: ExperimentFile; name: string; icon: typeof FileCode2; role: string }[] = [
  { kind: 'html', name: 'index.html', icon: FileCode2, role: 'content' },
  { kind: 'css', name: 'style.css', icon: Palette, role: 'appearance' },
  { kind: 'js', name: 'script.js', icon: Braces, role: 'behavior' },
];
const FILE_NAME: Record<ExperimentFile, string> = { html: 'index.html', css: 'style.css', js: 'script.js' };

type Pane = 'steps' | 'code' | 'preview';
type Feedback = { ok: boolean; text: string } | null;

function fresh(x: Experiment): ExperimentProgress {
  return { files: { ...x.starter }, step: 0, completed: [], stepStart: { [x.steps[0]!.id]: { ...x.starter } }, choice: null, hintsUsed: 0, finishedAt: null };
}

export function ExperimentPage() {
  const { experimentId } = useParams();
  const x = experimentId ? getExperiment(experimentId) : undefined;
  if (!x) return <NotFoundPage />;
  return <ExperimentWorkspace key={x.id} x={x} />;
}

function ExperimentWorkspace({ x }: { x: Experiment }) {
  const { storage } = useSettings();
  const toast = useToast();
  const narrow = useMediaQuery('(max-width: 899px)');
  const [p, setP] = useState<ExperimentProgress>(() => loadExperimentProgress(storage, x.id) ?? fresh(x));
  const step = x.steps[Math.min(p.step, x.steps.length - 1)]!;
  const choice = step.choices?.find((c) => c.id === p.choice) ?? null;
  const targetFile: ExperimentFile | null = step.file ?? choice?.file ?? null;
  const [active, setActive] = useState<ExperimentFile>(targetFile ?? 'html');
  const [pane, setPane] = useState<Pane>('steps');
  const [hintsShown, setHintsShown] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [confirm, setConfirm] = useState<null | 'step' | 'all'>(null);
  const [starterOpen, setStarterOpen] = useState(false);
  const editorHandle = useRef<CodeEditorHandle | null>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const allDone = x.steps.every((s) => p.completed.includes(s.id));
  const [showCompletion, setShowCompletion] = useState(allDone);

  // Save as the learner works (code, step, results). Saved straight away so closing the tab loses nothing.
  useEffect(() => {
    saveExperimentProgress(storage, x.id, p);
  }, [p, storage, x.id]);

  const checkingStep = useRef<string | null>(null);
  const entriesRef = useRef<ReturnType<typeof useLabRunner>['entries']>([]);
  const onChecks = useCallback(
    (results: CheckResult[]) => {
      const stepId = checkingStep.current;
      checkingStep.current = null;
      const s = x.steps.find((st) => st.id === stepId);
      if (!s) return;
      const r = results[0];
      if (r?.passed) {
        const c = s.choices?.find((ch) => ch.id === p.choice);
        setFeedback({ ok: true, text: c ? `${c.success} ${s.success}` : s.success });
        setP((prev) => {
          const completed = prev.completed.includes(s.id) ? prev.completed : [...prev.completed, s.id];
          const done = x.steps.every((st) => completed.includes(st.id));
          return { ...prev, completed, finishedAt: done ? (prev.finishedAt ?? new Date().toISOString()) : prev.finishedAt };
        });
      } else {
        const hasError = entriesRef.current.some((e) => e.kind === 'error');
        const base = r?.error && !/took too long/.test(r.error) ? r.error : 'Not quite yet. Compare your change with the task, then try again.';
        setFeedback({ ok: false, text: hasError ? `${base} Your code also has an error: see Messages under the preview.` : base });
      }
    },
    [x.steps, p.choice],
  );
  const runner = useLabRunner(onChecks);
  entriesRef.current = runner.entries;

  // Show the page once on open.
  useEffect(() => {
    runner.run(p.files);
  }, []);

  // When the step changes: open its file, reset hints and feedback, remember the code at its start.
  useEffect(() => {
    if (targetFile) setActive(targetFile);
    setHintsShown(0);
    setFeedback(null);
    setP((prev) => (prev.stepStart[step.id] ? prev : { ...prev, stepStart: { ...prev.stepStart, [step.id]: { ...prev.files } } }));
  }, [step.id]);
  useEffect(() => {
    if (choice) setActive(choice.file);
  }, [choice?.id]);

  // Bring new feedback into view (it can be below the fold in the instructions panel).
  useEffect(() => {
    if (feedback) feedbackRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
  }, [feedback]);

  const setFile = (kind: ExperimentFile, value: string) => setP((prev) => ({ ...prev, files: { ...prev.files, [kind]: value } }));
  const run = (files: LabFiles = p.files) => {
    runner.run(files);
    if (narrow) setPane('preview');
  };
  const check = () => {
    const test = step.test ?? choice?.test;
    if (!test) {
      setFeedback({ ok: false, text: 'First choose which change you want to make.' });
      return;
    }
    checkingStep.current = step.id;
    setFeedback(null);
    runner.run(p.files, [{ id: step.id, test }]);
  };
  const goTo = (i: number) => {
    setP((prev) => ({ ...prev, step: i }));
    setShowCompletion(false);
    if (narrow) setPane('steps');
  };
  const unlocked = (i: number) => i === 0 || p.completed.includes(x.steps[i - 1]!.id) || i <= p.step;
  const doReset = () => {
    if (confirm === 'step') {
      const snap = p.stepStart[step.id] ?? x.starter;
      setP((prev) => ({ ...prev, files: { ...snap }, completed: prev.completed.filter((id) => id !== step.id) }));
      runner.run(snap);
      toast('This step is back to how it started');
    } else if (confirm === 'all') {
      const f = fresh(x);
      setP(f);
      setShowCompletion(false);
      runner.run(f.files);
      toast('Experiment reset to the starter code');
    }
    setFeedback(null);
    setHintsShown(0);
    setConfirm(null);
  };
  const restoreFile = () => {
    const files = { ...p.files, [active]: x.starter[active] };
    setP((prev) => ({ ...prev, files }));
    setStarterOpen(false);
    runner.run(files);
    toast(`${FILE_NAME[active]} restored to the starter code`);
  };

  const stepDone = p.completed.includes(step.id);
  const errors = runner.entries.filter((e) => e.kind === 'error').length;
  const doneCount = x.steps.filter((s) => p.completed.includes(s.id)).length;

  const progress = (
    <div className="xp-progress" aria-label={`${doneCount} of ${x.steps.length} steps complete`}>
      <div className="xp-progress__bar"><span style={{ width: `${(doneCount / x.steps.length) * 100}%` }} /></div>
      <span className="subtle small tabular">{doneCount} of {x.steps.length} steps done</span>
    </div>
  );

  const stepList = (
    <ol className="xp-steps" aria-label="Steps">
      {x.steps.map((s, i) => {
        const done = p.completed.includes(s.id);
        const current = i === p.step && !showCompletion;
        return (
          <li key={s.id} data-state={done ? 'done' : current ? 'current' : 'todo'}>
            <button type="button" onClick={() => goTo(i)} disabled={!unlocked(i)} aria-current={current ? 'step' : undefined}>
              <span className="xp-steps__n" aria-hidden="true">{done ? <CircleCheck size={16} /> : i + 1}</span>
              <span>{s.title}</span>
              <span className="visually-hidden">{done ? ' (done)' : current ? ' (current step)' : ''}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  const instructions = showCompletion && allDone ? (
    <section className="xp-panel xp-done" aria-labelledby="xp-done-h">
      <PartyPopper size={28} className="xp-done__icon" aria-hidden="true" />
      <h2 id="xp-done-h">{x.completion.title}</h2>
      <p>{x.completion.summary}</p>
      <h3 className="lab-h">What you practiced</h3>
      <ul className="xp-done__list">{x.completion.practiced.map((t) => <li key={t}><CircleCheck size={16} aria-hidden="true" /> {t}</li>)}</ul>
      {p.hintsUsed > 0 && <p className="subtle small">You used {p.hintsUsed} hint{p.hintsUsed === 1 ? '' : 's'} along the way. That's what they're for.</p>}
      {x.completion.next.length > 0 && (
        <>
          <h3 className="lab-h">Where to go next</h3>
          <ul className="xp-next">{x.completion.next.map((n) => <li key={n.to}><Link to={n.to}>{n.label} <ArrowRight size={14} aria-hidden="true" /></Link></li>)}</ul>
        </>
      )}
      <div className="xp-actions">
        <Button variant="primary" onClick={() => setShowCompletion(false)}>Keep experimenting</Button>
        <Button variant="ghost" onClick={() => setConfirm('all')}><RotateCcw size={14} aria-hidden="true" /> Start over</Button>
      </div>
    </section>
  ) : (
    <section className="xp-panel" aria-labelledby="xp-step-h">
      <div className="xp-step-head">
        <span className="eyebrow">Step {p.step + 1} of {x.steps.length}</span>
        <h2 id="xp-step-h" className="xp-step-title">{step.title}</h2>
        <p className="xp-concept">{step.concept}</p>
      </div>
      {targetFile ? (
        <button type="button" className="xp-file" onClick={() => { setActive(targetFile); if (narrow) setPane('code'); }}>
          <span className="xp-file__label">File to edit</span>
          <strong>{FILE_NAME[targetFile]}</strong>
          <span className="subtle small">Open it</span>
        </button>
      ) : null}
      {step.choices && (
        <fieldset className="xp-choices">
          <legend className="field__label">Choose one change</legend>
          {step.choices.map((c) => (
            <label key={c.id} className="xp-choice">
              <input type="radio" name="xp-choice" value={c.id} checked={p.choice === c.id} onChange={() => { setP((prev) => ({ ...prev, choice: c.id })); setFeedback(null); }} />
              <span>{c.label} <span className="subtle small">in {FILE_NAME[c.file]}</span></span>
            </label>
          ))}
        </fieldset>
      )}
      <div>
        <h3 className="lab-h">Your task</h3>
        <ol className="xp-task">{step.task.map((t) => <li key={t}>{t}</li>)}</ol>
      </div>
      <p className="xp-expected"><Eye size={16} aria-hidden="true" /> <span><strong>You should see:</strong> {step.expected}</span></p>
      {step.terms.length > 0 && (
        <details className="xp-terms">
          <summary>Words in this step <ChevronDown size={14} aria-hidden="true" /></summary>
          <dl>{step.terms.map((t) => <div key={t.term}><dt>{t.term}</dt><dd>{t.meaning}</dd></div>)}</dl>
        </details>
      )}
      <div className="xp-actions">
        <Button onClick={() => run()}><Play size={15} aria-hidden="true" /> Run Code</Button>
        <Button variant="primary" onClick={check} disabled={runner.checking}>
          {runner.checking ? <Loader2 size={15} className="spin" aria-hidden="true" /> : <CheckCheck size={15} aria-hidden="true" />} Check My Work
        </Button>
      </div>
      <div aria-live="polite" ref={feedbackRef}>
        {feedback && (
          <div className="xp-feedback" data-ok={feedback.ok} role="status">
            {feedback.ok ? <CircleCheck size={18} aria-hidden="true" /> : <CircleX size={18} aria-hidden="true" />}
            <p>{feedback.text}</p>
          </div>
        )}
      </div>
      {stepDone && (
        <div className="xp-actions">
          {p.step < x.steps.length - 1
            ? <Button variant="primary" onClick={() => goTo(p.step + 1)}>Next step <ArrowRight size={15} aria-hidden="true" /></Button>
            : allDone && <Button variant="primary" onClick={() => setShowCompletion(true)}>Finish <PartyPopper size={15} aria-hidden="true" /></Button>}
        </div>
      )}
      <details className="xp-hints" open={hintsShown > 0}>
        <summary><Lightbulb size={15} aria-hidden="true" /> Need a hint?</summary>
        {hintsShown > 0 && <ol className="hints">{step.hints.slice(0, hintsShown).map((h) => <li key={h}>{h}</li>)}</ol>}
        {hintsShown < step.hints.length
          ? <Button size="sm" onClick={() => { setHintsShown((n) => n + 1); setP((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 })); }}>{hintsShown === 0 ? 'Show a small clue' : 'Show a clearer hint'}</Button>
          : <p className="subtle small">That's every hint. Still stuck? Compare with the starter code, or reset this step.</p>}
      </details>
      <details className="xp-mistakes">
        <summary>Common mistakes</summary>
        <ul>{x.mistakes.map((m) => <li key={m.problem}><strong>{m.problem}.</strong> {m.fix}</li>)}</ul>
      </details>
      <div className="xp-resets">
        <Button size="sm" variant="ghost" onClick={() => setConfirm('step')}><RotateCcw size={14} aria-hidden="true" /> Reset step</Button>
        <Button size="sm" variant="ghost" onClick={() => setStarterOpen(true)}><Eye size={14} aria-hidden="true" /> View starter code</Button>
        <Button size="sm" variant="ghost" className="btn--danger-ghost" onClick={() => setConfirm('all')}>Reset experiment</Button>
      </div>
    </section>
  );

  const tabs = (
    <div className="lab-tabs" role="tablist" aria-label="Files">
      {FILES.map((f) => {
        const target = f.kind === targetFile;
        return (
          <button key={f.kind} type="button" role="tab" aria-selected={active === f.kind} className="lab-tab xp-tab" data-target={target || undefined} onClick={() => setActive(f.kind)}>
            <f.icon size={14} aria-hidden="true" />
            {/* The name is always announced in full, whichever visible label fits. */}
            <span className="visually-hidden">{f.name} ({f.role})</span>
            <span className="lab-tab__full" aria-hidden="true">{f.name}</span><span className="lab-tab__short" aria-hidden="true">{f.kind.toUpperCase()}</span>
            {target && <span className="xp-tab__badge"><span aria-hidden="true">Edit</span><span className="visually-hidden">, edit this file for this step</span></span>}
          </button>
        );
      })}
    </div>
  );

  const editor = (
    <section className="lab-editor xp-editor" aria-label="Code editor">
      <div className="lab-bar">
        {tabs}
        <div className="lab-bar__actions">
          <Button size="sm" variant="primary" onClick={() => run()} title="Run Code (Ctrl+Enter)"><Play size={14} aria-hidden="true" /> Run Code</Button>
        </div>
      </div>
      <p className="xp-editing subtle small">
        Editing <strong>{FILE_NAME[active]}</strong>: the page's {FILES.find((f) => f.kind === active)!.role}.
        {targetFile && active !== targetFile && <> This step changes <button type="button" className="link-button" onClick={() => setActive(targetFile)}>{FILE_NAME[targetFile]}</button>.</>}
      </p>
      <div className="lab-editor__body">
        <CodeEditor key={active} file={active} value={p.files[active]} onChange={(v) => setFile(active, v)} onRun={() => run()} label={`${FILE_NAME[active]} editor`} handleRef={editorHandle} />
      </div>
    </section>
  );

  const preview = (
    <section className="xp-preview" aria-label="Live preview">
      <div className="xp-preview__chrome">
        <span className="xp-preview__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="xp-preview__title">Live preview</span>
        <span className="subtle small xp-preview__note">Your webpage, as of your last Run Code</span>
      </div>
      <iframe key={runner.frameKey} ref={runner.iframe} title="Live preview of your webpage" sandbox="allow-scripts allow-modals allow-forms" srcDoc={runner.srcDoc} className="xp-frame" />
      <div className="xp-messages" aria-label="Messages">
        <div className="lab-panel-head"><span>Messages {errors > 0 && <span className="lab-count">{errors}</span>}</span></div>
        <ol className="lab-log" aria-live="polite">
          {runner.entries.length === 0 && <li className="lab-log__empty">No problems found. Errors in your code would be explained here.</li>}
          {runner.entries.map((e) =>
            e.kind === 'log' ? (
              <li key={e.id} className="lab-log__line" data-level={e.level}><span className="lab-log__text">{e.text}</span></li>
            ) : e.kind === 'notice' ? (
              <li key={e.id} className="lab-log__notice"><Info size={14} aria-hidden="true" /><span>{e.text}</span></li>
            ) : (
              <li key={e.id} className="lab-log__error">
                <div className="lab-log__error-head"><AlertTriangle size={14} aria-hidden="true" /><strong>{e.explanation.title}</strong>
                  {e.line && <button type="button" className="lab-log__goto" onClick={() => { setActive('js'); setTimeout(() => editorHandle.current?.goToLine(e.line!), 30); if (narrow) setPane('code'); }}>script.js, line {e.line}</button>}
                </div>
                <p>{e.explanation.explanation}</p>
                <p className="lab-log__tip"><strong>Try:</strong> {e.explanation.tip}</p>
              </li>
            ),
          )}
        </ol>
      </div>
    </section>
  );

  // On phones, the current task stays visible above the code and the preview.
  const strip = !(showCompletion && allDone) && (
    <div className="xp-strip">
      <span className="eyebrow">Step {p.step + 1}: {step.title}</span>
      <p>{step.task.join(' ')}</p>
      <span className="small">{targetFile ? <>Edit <strong>{FILE_NAME[targetFile]}</strong>. </> : null}<button type="button" className="link-button" onClick={() => setPane('steps')}>Back to the step</button></span>
    </div>
  );

  const dialogs = (
    <>
      <Dialog open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === 'all' ? 'Reset the whole experiment?' : 'Reset this step?'} labelledBy="xp-reset-title"
        actions={<><Button onClick={() => setConfirm(null)}>Cancel</Button><Button variant="danger" onClick={doReset}>{confirm === 'all' ? 'Reset experiment' : 'Reset step'}</Button></>}>
        <p className="muted">{confirm === 'all' ? 'All three files go back to the starter code and your progress through the steps starts again.' : 'Your code goes back to how it was when this step started. Earlier steps keep their changes.'}</p>
      </Dialog>
      <Dialog open={starterOpen} onClose={() => setStarterOpen(false)} title={`Starter code: ${FILE_NAME[active]}`} labelledBy="xp-starter-title"
        actions={<><Button onClick={() => setStarterOpen(false)}>Close</Button><Button variant="danger" onClick={restoreFile}>Restore this file</Button></>}>
        <p className="muted">This is how {FILE_NAME[active]} started. Restoring replaces your version of this file only.</p>
        <div className="xp-starter"><CodeBlock code={x.starter[active]} label={FILE_NAME[active]} /></div>
      </Dialog>
    </>
  );

  const header = (
    <header className="xp-header">
      <nav aria-label="Breadcrumb" className="breadcrumbs"><Link to="/lab">Code Lab</Link><span aria-hidden="true">/</span><span>Guided experiment</span></nav>
      <h1 className="xp-title">{x.title}</h1>
      <p className="muted xp-objective">{x.objective}</p>
      {progress}
    </header>
  );

  if (narrow) {
    return (
      <div className="xp xp--narrow">
        {header}
        <div className="lab-panes-nav">
          <Segmented<Pane> label="Panel" value={pane} onChange={setPane} options={[{ value: 'steps', label: 'Steps' }, { value: 'code', label: 'Code' }, { value: 'preview', label: errors ? `Preview (${errors})` : 'Preview' }]} />
        </div>
        <div hidden={pane !== 'steps'} className="xp-narrow-steps">{stepList}{instructions}</div>
        <div hidden={pane !== 'code'}>{strip}{editor}</div>
        <div hidden={pane !== 'preview'}>{strip}{preview}</div>
        {dialogs}
      </div>
    );
  }

  return (
    <div className="xp">
      <div className="xp-grid">
        <aside className="xp-col xp-col--guide" aria-label="Guided instructions">
          {header}
          {stepList}
          {instructions}
        </aside>
        <div className="xp-col xp-col--editor">{editor}</div>
        <div className="xp-col xp-col--preview">{preview}</div>
      </div>
      {dialogs}
    </div>
  );
}
