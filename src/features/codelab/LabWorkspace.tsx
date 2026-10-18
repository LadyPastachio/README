import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, RotateCcw, CheckCheck, PanelLeftClose, PanelLeftOpen, Lightbulb, Eye, FileCode2, Palette, Braces, Trash2, AlertTriangle, Info, CircleCheck, CircleX, Loader2, Link2, Link2Off } from 'lucide-react';
import type { LabExercise } from '@/content/lab/schema';
import { getSkill } from '@/content/skills';
import { Button, Notice, CodeBlock, Dialog, Segmented } from '@/design/components';
import { useSettings } from '@/core/settings/SettingsContext';
import { useLearning } from '@/core/learning/LearningContext';
import { newId } from '@/core/learning/records';
import { labResult } from '@/core/learning/mastery';
import { loadLabStore, saveWorkspace, removeWorkspace } from '@/core/lab/workspaceStore';
import { findLinks, type LabFiles } from '@/core/lab/buildDocument';
import { useMediaQuery } from '@/core/settings/SettingsContext';
import { useToast } from '@/app/Toast';
import { CodeEditor, type FileKind, type CodeEditorHandle } from './CodeEditor';
import { useLabRunner, type CheckResult } from './useLabRunner';
import { CertPrompt } from '@/features/certifications/CertPrompt';
import { ReviewBox } from './ReviewBox';

const FILES: { kind: FileKind; name: string; icon: typeof FileCode2 }[] = [
  { kind: 'html', name: 'index.html', icon: FileCode2 },
  { kind: 'css', name: 'style.css', icon: Palette },
  { kind: 'js', name: 'script.js', icon: Braces },
];
const KIND_LABEL = { build: 'Build', debug: 'Debug', predict: 'Predict', refactor: 'Refactor', playground: 'Playground' } as const;

type Pane = 'task' | 'code' | 'preview' | 'console';

export function LabWorkspace({ exercise }: { exercise: LabExercise }) {
  const { settings, storage } = useSettings();
  const { record, events } = useLearning();
  const toast = useToast();
  const narrow = useMediaQuery('(max-width: 899px)');
  const saved = useMemo(() => loadLabStore(storage).workspaces[exercise.id], [storage, exercise.id]);

  const [files, setFiles] = useState<LabFiles>(() => saved?.files ?? exercise.starter);
  const [active, setActive] = useState<FileKind>(exercise.openFile);
  const [showTask, setShowTask] = useState(true);
  const [pane, setPane] = useState<Pane>('task');
  const [autoRun, setAutoRun] = useState(!exercise.predict);
  const [sessionId] = useState(() => newId('lab'));
  const [hintsShown, setHintsShown] = useState(0);
  const [failedChecks, setFailedChecks] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [prediction, setPrediction] = useState(saved?.prediction ?? '');
  const [predictionLocked, setPredictionLocked] = useState(!!saved?.prediction);
  const [split, setSplit] = useState(0.55);
  const editorHandle = useRef<CodeEditorHandle | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const graded = exercise.kind !== 'playground';
  const result = labResult(events, exercise.id);

  const onChecks = useCallback(
    (results: CheckResult[]) => {
      const passed = results.filter((r) => r.passed).length;
      const all = passed === results.length && results.length > 0;
      record({
        type: 'answer', context: 'lab', sessionId, lessonId: exercise.id, activityId: 'checks', kind: 'lab',
        correct: all, answer: `${passed} of ${results.length} checks passed`, hintsShown,
        confidence: null, misconception: null, lessonOrder: null, selfCheck: null,
      });
      if (!all) setFailedChecks((n) => n + 1);
    },
    [record, sessionId, exercise.id, hintsShown],
  );
  const runner = useLabRunner(onChecks);

  const runPreview = useCallback(() => runner.run(files), [runner, files]);
  // Results appear next to the criteria, so the view stays where it is.
  const runChecks = useCallback(() => {
    runner.run(files, exercise.checks.map((c) => ({ id: c.id, test: c.test })));
  }, [runner, files, exercise.checks]);

  // First run on open, so the preview isn't empty (predict exercises wait for a prediction).
  useEffect(() => {
    if (!exercise.predict || predictionLocked) runPreview();
  }, []);

  // Live preview: re-run shortly after typing stops. Save as you type.
  // Skips the first render: re-running then would cancel a check started right after opening.
  const lastFiles = useRef(files);
  useEffect(() => {
    if (lastFiles.current === files) return;
    lastFiles.current = files;
    const t = setTimeout(() => {
      saveWorkspace(storage, exercise.id, { files, prediction: predictionLocked ? prediction : undefined });
      if (autoRun && (!exercise.predict || predictionLocked)) runner.run(files);
    }, 650);
    return () => clearTimeout(t);
  }, [files]);

  const setFile = (kind: FileKind, value: string) => setFiles((f) => ({ ...f, [kind]: value }));
  const reset = () => {
    removeWorkspace(storage, exercise.id);
    setFiles(exercise.starter);
    setPrediction('');
    setPredictionLocked(false);
    setConfirmReset(false);
    runner.run(exercise.starter);
    toast('Reset to the starting code');
  };
  const reveal = () => {
    record({ type: 'reveal', context: 'lab', sessionId, lessonId: exercise.id, activityId: 'checks', kind: 'lab', correct: null, answer: 'Solution shown', hintsShown, confidence: null, misconception: null, lessonOrder: null, selfCheck: null });
    setRevealed(true);
  };
  const loadSolution = () => {
    if (!exercise.solution) return;
    setFiles((f) => ({ ...f, ...exercise.solution }));
    toast('Solution loaded into the editor');
  };

  const policy = settings.learning.solutionReveal;
  const canReveal = graded && !!exercise.solution && !revealed && policy !== 'never' && failedChecks >= (policy === 'after-1' ? 1 : 2);
  const hintsLocked = settings.learning.hintTiming === 'after-attempt' && runner.checks === null && failedChecks === 0;
  const allPassed = !!runner.checks && runner.checks.length > 0 && runner.checks.every((c) => c.passed);
  const links = findLinks(files.html);
  const errorCount = runner.entries.filter((e) => e.kind === 'error' || (e.kind === 'log' && e.level === 'error')).length;

  // Drag the divider between editor and preview.
  const startDrag = (e: React.PointerEvent) => {
    const grid = gridRef.current;
    if (!grid) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const rect = grid.getBoundingClientRect();
    const move = (ev: PointerEvent) => setSplit(Math.min(0.75, Math.max(0.25, (ev.clientX - rect.left) / rect.width)));
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const task = (
    <section className="lab-task" aria-label="Task">
      <div className="lab-task__head">
        <span className="lab-kind" data-kind={exercise.kind}>{KIND_LABEL[exercise.kind]}</span>
        {exercise.skill && <span className="chip">{getSkill(exercise.skill)?.name}</span>}
        {result.status === 'independent' && <span className="chip chip--status" data-status="independent"><span className="chip__dot" aria-hidden="true" />Passed on your own</span>}
      </div>
      <h1 className="lab-task__title">{exercise.title}</h1>
      <div className="lab-task__body">{exercise.instructions.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}</div>

      {exercise.predict && (
        <div className="lab-predict">
          <label htmlFor="prediction" className="field__label">{exercise.predict.question}</label>
          <textarea id="prediction" className="input textarea textarea--sm" value={prediction} readOnly={predictionLocked} onChange={(e) => setPrediction(e.target.value)} placeholder="Write what you expect to see…" />
          {!predictionLocked ? (
            <Button size="sm" variant="primary" disabled={prediction.trim().length < 1} onClick={() => {
              setPredictionLocked(true);
              record({ type: 'answer', context: 'lab', sessionId, lessonId: exercise.id, activityId: 'prediction', kind: 'lab', correct: null, answer: prediction.trim(), hintsShown, confidence: null, misconception: null, lessonOrder: null, selfCheck: null });
              setAutoRun(true);
              runner.run(files);
            }}>Lock in and run</Button>
          ) : (
            <div className="lab-predict__answer">
              <span className="eyebrow">Actual output</span>
              <pre className="lab-predict__pre">{exercise.predict.answer}</pre>
              <p className="subtle small">{exercise.predict.explanation}</p>
            </div>
          )}
        </div>
      )}

      {graded && (
        <div className="lab-criteria">
          <h2 className="lab-h">Acceptance criteria</h2>
          <ul>
            {exercise.checks.map((c) => {
              const r = runner.checks?.find((x) => x.id === c.id);
              const state = runner.checking ? 'running' : r ? (r.passed ? 'pass' : 'fail') : 'idle';
              return (
                <li key={c.id} data-state={state}>
                  {state === 'pass' ? <CircleCheck size={16} aria-label="Passed" /> : state === 'fail' ? <CircleX size={16} aria-label="Not yet" /> : state === 'running' ? <Loader2 size={16} className="spin" aria-label="Checking" /> : <span className="lab-criteria__dot" aria-hidden="true" />}
                  <span>{c.criterion}{r?.error && <span className="subtle small"> ({r.error})</span>}</span>
                </li>
              );
            })}
          </ul>
          <Button variant="primary" onClick={runChecks} disabled={runner.checking || (!!exercise.predict && !predictionLocked)}>
            <CheckCheck size={16} aria-hidden="true" /> Check my work
          </Button>
        </div>
      )}

      {allPassed && graded && (
        <div className="lab-success" role="status">
          <CircleCheck size={20} aria-hidden="true" />
          <div>
            <strong>All checks pass.</strong>{' '}
            {revealed ? 'You used the solution, so this counts as practice. Try it again later from the starting code.' : hintsShown > 0 ? 'Nice work. You used hints, so it counts as practiced with support.' : 'You did this on your own. It counts as evidence for this skill.'}
          </div>
        </div>
      )}
      {allPassed && exercise.compare && (
        <div className="lab-compare">
          <h2 className="lab-h">{exercise.compare.title}</h2>
          <CodeBlock code={exercise.compare.code} label="Alternative" />
          <ul>{exercise.compare.points.map((p) => <li key={p}>{p}</li>)}</ul>
        </div>
      )}
      {allPassed && exercise.skill && <CertPrompt skillId={exercise.skill} />}

      {exercise.hints.length > 0 && (
        <div className="hint-box">
          <div className="hint-box__head"><Lightbulb size={16} aria-hidden="true" /><strong>Hints</strong><span className="subtle">{hintsShown} of {exercise.hints.length} used</span></div>
          {hintsShown > 0 && <ol className="hints">{exercise.hints.slice(0, hintsShown).map((h) => <li key={h}>{h}</li>)}</ol>}
          {hintsShown < exercise.hints.length && (
            <Button size="sm" disabled={hintsLocked} onClick={() => setHintsShown((n) => n + 1)}>{hintsLocked ? 'Available after your first check' : hintsShown === 0 ? 'Show a hint' : 'Show another hint'}</Button>
          )}
        </div>
      )}
      {exercise.kind !== 'predict' && (
        <ReviewBox files={files} title={exercise.title} onGoTo={(f) => { setActive(f.file); setTimeout(() => editorHandle.current?.goToLine(f.line), 30); if (narrow) setPane('code'); }} />
      )}
      {canReveal && <Button variant="ghost" onClick={reveal}><Eye size={16} aria-hidden="true" /> Show solution</Button>}
      {revealed && exercise.solution && (
        <div className="lab-solution">
          <Notice kind="info">Solution shown. That's recorded honestly: this exercise will count as needing another try. Compare it with your code before loading it.</Notice>
          {(Object.keys(exercise.solution) as FileKind[]).map((k) => <CodeBlock key={k} code={exercise.solution![k]!} label={FILES.find((f) => f.kind === k)!.name} />)}
          <Button size="sm" onClick={loadSolution}>Load solution into the editor</Button>
        </div>
      )}
    </section>
  );

  const fileTabs = (
    <div className="lab-tabs" role="tablist" aria-label="Files">
      {FILES.map((f) => (
        <button key={f.kind} type="button" role="tab" aria-selected={active === f.kind} aria-label={f.name} title={f.name} className="lab-tab" onClick={() => setActive(f.kind)}>
          <f.icon size={14} aria-hidden="true" /><span className="lab-tab__full">{f.name}</span><span className="lab-tab__short" aria-hidden="true">{f.kind.toUpperCase()}</span>
          {f.kind !== 'html' && (links[f.kind] ? <Link2 size={12} className="lab-tab__link" aria-label="linked from index.html" /> : <Link2Off size={12} className="lab-tab__unlinked" aria-label="not linked from index.html" />)}
        </button>
      ))}
    </div>
  );

  const editor = (
    <section className="lab-editor" aria-label="Code editor">
      <div className="lab-bar">
        {fileTabs}
        <div className="lab-bar__actions">
          <Button size="sm" variant="primary" onClick={() => { runPreview(); if (narrow) setPane('preview'); }} disabled={!!exercise.predict && !predictionLocked} title="Run (Ctrl+Enter)" aria-label="Run">
            <Play size={14} aria-hidden="true" /><span className="lab-run-label">Run</span>
          </Button>
          <Button size="sm" variant="ghost" icon onClick={() => setConfirmReset(true)} aria-label="Reset to starting code" title="Reset to starting code"><RotateCcw size={15} aria-hidden="true" /></Button>
        </div>
      </div>
      <div className="lab-editor__body">
        <CodeEditor key={active} file={active} value={files[active]} onChange={(v) => setFile(active, v)} onRun={runPreview} label={`${FILES.find((f) => f.kind === active)!.name} editor`} handleRef={editorHandle} />
      </div>
      <div className="lab-relations" aria-label="How the files connect">
        <span><FileCode2 size={12} aria-hidden="true" /> index.html</span>
        <span className={links.css ? 'ok' : 'off'}>{links.css ? '→ links' : '✕ doesn\'t link'} style.css</span>
        <span className={links.js ? 'ok' : 'off'}>{links.js ? '→ runs' : '✕ doesn\'t run'} script.js</span>
        <label className="lab-auto"><input type="checkbox" checked={autoRun} onChange={(e) => setAutoRun(e.target.checked)} disabled={!!exercise.predict && !predictionLocked} /> Live preview</label>
      </div>
    </section>
  );

  const preview = (
    <section className="lab-preview" aria-label="Preview">
      <div className="lab-panel-head"><span>Preview</span><span className="subtle small" title="Your code can't read your saved data, the app or the internet">{runner.lastRunAt ? 'Sandboxed' : 'Press Run'}</span></div>
      <iframe key={runner.frameKey} ref={runner.iframe} title="Preview of your page" sandbox="allow-scripts allow-modals allow-forms" srcDoc={runner.srcDoc} className="lab-frame" />
    </section>
  );

  const consolePanel = (
    <section className="lab-console" aria-label="Console">
      <div className="lab-panel-head"><span>Console {errorCount > 0 && <span className="lab-count">{errorCount}</span>}</span><Button size="sm" variant="ghost" icon onClick={runner.clear} aria-label="Clear console"><Trash2 size={14} aria-hidden="true" /></Button></div>
      <ol className="lab-log" aria-live="polite">
        {runner.entries.length === 0 && <li className="lab-log__empty">console.log output and errors appear here.</li>}
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
              <code className="lab-log__raw">{e.name}: {e.message}</code>
            </li>
          ),
        )}
      </ol>
      <p className="lab-console__foot subtle small">New to errors? <Link to="/learn/lesson/reading-errors">Reading an error message</Link></p>
    </section>
  );

  const dialog = (
    <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset to the starting code?" labelledBy="lab-reset-title"
      actions={<><Button onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={reset}>Reset</Button></>}>
      <p className="muted">Your changes to all three files in this exercise will be replaced. Your learning records are kept.</p>
    </Dialog>
  );

  if (narrow) {
    return (
      <div className="lab lab--narrow">
        <div className="lab-panes-nav">
          <Segmented<Pane> label="Panel" value={pane} onChange={setPane} options={[
            { value: 'task', label: 'Task' }, { value: 'code', label: 'Code' }, { value: 'preview', label: 'Preview' },
            { value: 'console', label: errorCount ? `Console (${errorCount})` : 'Console' },
          ]} />
        </div>
        <div hidden={pane !== 'task'}>{task}</div>
        <div hidden={pane !== 'code'} className="lab-narrow-panel">{editor}</div>
        <div hidden={pane !== 'preview'} className="lab-narrow-panel">{preview}{runner.entries.length > 0 && <button type="button" className="lab-peek" onClick={() => setPane('console')}>{runner.entries.length} console message{runner.entries.length === 1 ? '' : 's'} →</button>}</div>
        <div hidden={pane !== 'console'} className="lab-narrow-panel">{consolePanel}</div>
        {dialog}
      </div>
    );
  }

  return (
    <div className="lab" data-task={showTask ? 'open' : 'closed'}>
      <div className="lab-top">
        <nav aria-label="Breadcrumb" className="breadcrumbs"><Link to="/lab">Code Lab</Link><span aria-hidden="true">/</span><span aria-current="page">{exercise.title}</span></nav>
        <Button size="sm" variant="ghost" onClick={() => setShowTask((v) => !v)} aria-expanded={showTask}>
          {showTask ? <PanelLeftClose size={15} aria-hidden="true" /> : <PanelLeftOpen size={15} aria-hidden="true" />} {showTask ? 'Hide task' : 'Show task'}
        </Button>
      </div>
      <div className="lab-grid" style={{ ['--split' as string]: `${split * 100}%` }}>
        {showTask && <aside className="lab-col lab-col--task">{task}</aside>}
        <div className="lab-work" ref={gridRef}>
          <div className="lab-col lab-col--editor">{editor}</div>
          <div className="lab-split" role="separator" aria-orientation="vertical" aria-label="Resize editor and preview" tabIndex={0}
            aria-valuenow={Math.round(split * 100)} aria-valuemin={25} aria-valuemax={75} aria-valuetext={`Editor ${Math.round(split * 100)}% wide`}
            onPointerDown={startDrag}
            onKeyDown={(e) => { if (e.key === 'ArrowLeft') setSplit((s) => Math.max(0.25, s - 0.05)); if (e.key === 'ArrowRight') setSplit((s) => Math.min(0.75, s + 0.05)); }} />
          <div className="lab-col lab-col--output">{preview}{consolePanel}</div>
        </div>
      </div>
      {dialog}
    </div>
  );
}
