import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, RotateCcw, CheckCheck, Lightbulb, Eye, CircleCheck, CircleX, Loader2, Database, AlertTriangle } from 'lucide-react';
import type { LabExercise } from '@/content/lab/schema';
import { getSkill } from '@/content/skills';
import { Button, Notice, CodeBlock, Dialog, Segmented } from '@/design/components';
import { useSettings, useMediaQuery } from '@/core/settings/SettingsContext';
import { useLearning } from '@/core/learning/LearningContext';
import { newId } from '@/core/learning/records';
import { labResult } from '@/core/learning/mastery';
import { loadLabStore, saveWorkspace, removeWorkspace } from '@/core/lab/workspaceStore';
import { runSql, type SqlOutcome } from '@/core/sql/sqlRunner';
import { gradeSql } from '@/core/sql/grade';
import { useToast } from '@/app/Toast';
import { CodeEditor } from './CodeEditor';
import { CertPrompt } from '@/features/certifications/CertPrompt';

type Pane = 'task' | 'query' | 'results';

/** SQL exercises: write a query, run it on a fresh copy of the practice data, check it against the reference answer. */
export function SqlWorkspace({ exercise }: { exercise: LabExercise }) {
  const sql = exercise.sql!;
  const { settings, storage } = useSettings();
  const { events, record } = useLearning();
  const toast = useToast();
  const narrow = useMediaQuery('(max-width: 899px)');
  const saved = loadLabStore(storage).workspaces[exercise.id];
  const [query, setQuery] = useState(saved?.files.js ?? sql.starter);
  const [pane, setPane] = useState<Pane>('task');
  const [out, setOut] = useState<SqlOutcome | null>(null);
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<{ id: string; passed: boolean }[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [sessionId] = useState(() => newId('lab'));
  const [hintsShown, setHintsShown] = useState(0);
  const [failedChecks, setFailedChecks] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const result = labResult(events, exercise.id);

  const update = (q: string) => {
    setQuery(q);
    saveWorkspace(storage, exercise.id, { files: { html: '', css: '', js: q } });
  };

  const run = useCallback(async () => {
    setRunning(true);
    setOut(await runSql(sql.setup, query));
    setRunning(false);
    if (narrow) setPane('results');
  }, [sql.setup, query, narrow]);

  const check = async () => {
    setChecking(true);
    const [mine, ref] = await Promise.all([runSql(sql.setup, query), runSql(sql.setup, sql.solution)]);
    setOut(mine);
    const results = mine.ok && ref.ok ? gradeSql(exercise.checks, query, mine.results, ref.results) : exercise.checks.map((c) => ({ id: c.id, passed: false }));
    setChecks(results);
    setChecking(false);
    const passed = results.filter((r) => r.passed).length;
    const all = passed === results.length;
    record({ type: 'answer', context: 'lab', sessionId, lessonId: exercise.id, activityId: 'checks', kind: 'lab', correct: all, answer: `${passed} of ${results.length} checks passed`, hintsShown, confidence: null, misconception: null, lessonOrder: null, selfCheck: null });
    if (!all) setFailedChecks((n) => n + 1);
  };

  const reveal = () => {
    record({ type: 'reveal', context: 'lab', sessionId, lessonId: exercise.id, activityId: 'checks', kind: 'lab', correct: null, answer: 'Solution shown', hintsShown, confidence: null, misconception: null, lessonOrder: null, selfCheck: null });
    setRevealed(true);
  };

  const policy = settings.learning.solutionReveal;
  const canReveal = !revealed && policy !== 'never' && failedChecks >= (policy === 'after-1' ? 1 : 2);
  const hintsLocked = settings.learning.hintTiming === 'after-attempt' && checks === null && failedChecks === 0;
  const allPassed = !!checks && checks.every((c) => c.passed);

  const task = (
    <section className="lab-task" aria-label="Task">
      <div className="lab-task__head">
        <span className="lab-kind" data-kind={exercise.kind}>SQL</span>
        {exercise.skill && <span className="chip">{getSkill(exercise.skill)?.name}</span>}
        {result.status === 'independent' && <span className="chip chip--status" data-status="independent"><span className="chip__dot" aria-hidden="true" />Passed on your own</span>}
      </div>
      <h1 className="lab-task__title">{exercise.title}</h1>
      <div className="lab-task__body">{exercise.instructions.map((p) => <p key={p.slice(0, 30)}>{p}</p>)}</div>
      <div className="sql-tables" aria-label="Tables">
        <h2 className="lab-h"><Database size={14} aria-hidden="true" /> Tables</h2>
        {sql.tables.map((t) => <p key={t.name}><code className="sql-table-name">{t.name}</code> <span className="muted">{t.columns}</span></p>)}
      </div>
      <div className="lab-criteria">
        <h2 className="lab-h">Acceptance criteria</h2>
        <ul>
          {exercise.checks.map((c) => {
            const r = checks?.find((x) => x.id === c.id);
            const state = checking ? 'running' : r ? (r.passed ? 'pass' : 'fail') : 'idle';
            return (
              <li key={c.id} data-state={state}>
                {state === 'pass' ? <CircleCheck size={16} aria-label="Passed" /> : state === 'fail' ? <CircleX size={16} aria-label="Not yet" /> : state === 'running' ? <Loader2 size={16} className="spin" aria-label="Checking" /> : <span className="lab-criteria__dot" aria-hidden="true" />}
                <span>{c.criterion}</span>
              </li>
            );
          })}
        </ul>
        <Button variant="primary" onClick={check} disabled={checking}><CheckCheck size={16} aria-hidden="true" /> Check my work</Button>
      </div>
      {allPassed && (
        <div className="lab-success" role="status">
          <CircleCheck size={20} aria-hidden="true" />
          <div><strong>All checks pass.</strong> {revealed ? 'You used the solution, so this counts as practice.' : hintsShown > 0 ? 'You used hints, so it counts as practiced with support.' : 'You did this on your own. It counts as evidence for this skill.'}</div>
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
          {hintsShown < exercise.hints.length && <Button size="sm" disabled={hintsLocked} onClick={() => setHintsShown((n) => n + 1)}>{hintsLocked ? 'Available after your first check' : hintsShown === 0 ? 'Show a hint' : 'Show another hint'}</Button>}
        </div>
      )}
      {canReveal && <Button variant="ghost" onClick={reveal}><Eye size={16} aria-hidden="true" /> Show solution</Button>}
      {revealed && (
        <div className="lab-solution">
          <Notice kind="info">Solution shown. That's recorded honestly: this exercise will count as needing another try.</Notice>
          <CodeBlock code={sql.solution} label="query.sql" />
          <Button size="sm" onClick={() => update(sql.solution)}>Load solution into the editor</Button>
        </div>
      )}
    </section>
  );

  const editor = (
    <section className="lab-editor" aria-label="Code editor">
      <div className="lab-bar">
        <span className="sql-file"><Database size={14} aria-hidden="true" /> query.sql</span>
        <div className="lab-bar__actions">
          <Button size="sm" variant="primary" onClick={run} disabled={running} title="Run (Ctrl+Enter)" aria-label="Run"><Play size={14} aria-hidden="true" /><span className="lab-run-label">Run</span></Button>
          <Button size="sm" variant="ghost" icon onClick={() => setConfirmReset(true)} aria-label="Reset to starting query" title="Reset to starting query"><RotateCcw size={15} aria-hidden="true" /></Button>
        </div>
      </div>
      <div className="lab-editor__body">
        <CodeEditor file="sql" value={query} onChange={update} onRun={run} label="query.sql editor" />
      </div>
      <div className="lab-relations"><span>Each run uses a fresh copy of the practice data, so nothing you run can damage it.</span></div>
    </section>
  );

  const last = out?.ok ? out.results[out.results.length - 1] : undefined;
  const results = (
    <section className="lab-console sql-results" aria-label="Results">
      <div className="lab-panel-head"><span>Results</span><span className="subtle small">{running ? 'Running…' : out ? `${out.ms} ms` : 'Press Run'}</span></div>
      <div className="sql-results__body" aria-live="polite">
        {!out && <p className="lab-log__empty">Query results appear here as a table.</p>}
        {out && !out.ok && (
          <div className="lab-log__error"><div className="lab-log__error-head"><AlertTriangle size={14} aria-hidden="true" /><strong>The query didn't run</strong></div><code className="lab-log__raw">{out.error}</code><p className="lab-log__tip"><strong>Try:</strong> check spelling of table and column names against the Tables list, and that text values are in 'single quotes'.</p></div>
        )}
        {out?.ok && !last && <p className="lab-log__empty">The query ran and returned no rows.</p>}
        {last && (
          <div className="sql-table-wrap" tabIndex={0}>
            <table className="sql-table">
              <thead><tr>{last.columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
              <tbody>{last.values.slice(0, 200).map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j} data-null={v === null}>{v === null ? 'NULL' : String(v)}</td>)}</tr>)}</tbody>
            </table>
            <p className="subtle small">{last.values.length} row{last.values.length === 1 ? '' : 's'}{last.values.length > 200 ? ' (first 200 shown)' : ''}</p>
          </div>
        )}
      </div>
    </section>
  );

  const dialog = (
    <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset to the starting query?" labelledBy="sql-reset-title"
      actions={<><Button onClick={() => setConfirmReset(false)}>Cancel</Button><Button variant="danger" onClick={() => { removeWorkspace(storage, exercise.id); setQuery(sql.starter); setConfirmReset(false); toast('Reset to the starting query'); }}>Reset</Button></>}>
      <p className="muted">Your query will be replaced. Your learning records are kept.</p>
    </Dialog>
  );

  if (narrow) {
    return (
      <div className="lab lab--narrow">
        <div className="lab-panes-nav">
          <Segmented<Pane> label="Panel" value={pane} onChange={setPane} options={[{ value: 'task', label: 'Task' }, { value: 'query', label: 'Query' }, { value: 'results', label: 'Results' }]} />
        </div>
        <div hidden={pane !== 'task'}>{task}</div>
        <div hidden={pane !== 'query'} className="lab-narrow-panel">{editor}</div>
        <div hidden={pane !== 'results'} className="lab-narrow-panel">{results}</div>
        {dialog}
      </div>
    );
  }

  return (
    <div className="lab">
      <div className="lab-top">
        <nav aria-label="Breadcrumb" className="breadcrumbs"><Link to="/lab">Code Lab</Link><span aria-hidden="true">/</span><span aria-current="page">{exercise.title}</span></nav>
      </div>
      <div className="lab-grid">
        <aside className="lab-col lab-col--task">{task}</aside>
        <div className="sql-work">
          <div className="lab-col lab-col--editor">{editor}</div>
          <div className="lab-col">{results}</div>
        </div>
      </div>
      {dialog}
    </div>
  );
}
