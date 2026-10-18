import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUp, ArrowDown, Check, RotateCcw, Eye, CheckCircle2, XCircle } from 'lucide-react';
import type { OrderActivity, ChoiceActivity, FillActivity, ExplainActivity } from '@/content/schema';
import type { Confidence } from '@/core/learning/records';
import { Button, Notice, CodeBlock } from '@/design/components';
import { stableShuffle, moveItem, countInPlace, checkFill } from './activityLogic';
import { useActivity, type ActivityContext } from './useActivity';
import { useLessonHelp } from './LessonHelp';
import type { HelpKind } from '@/core/learning/help';

/* Shared pieces ------------------------------------------------------- */

const CONFIDENCE: { value: Confidence; label: string }[] = [
  { value: 'guess', label: 'Guessing' },
  { value: 'unsure', label: 'Fairly sure' },
  { value: 'sure', label: 'Certain' },
];

function ConfidencePicker({ value, onChange, id }: { value: Confidence | null; onChange: (v: Confidence | null) => void; id: string }) {
  return (
    <div className="confidence" role="radiogroup" aria-labelledby={`${id}-conf`}>
      <span id={`${id}-conf`} className="confidence__label">How sure are you?</span>
      {CONFIDENCE.map((c) => (
        <button key={c.value} type="button" role="radio" aria-checked={value === c.value} className="confidence__opt" onClick={() => onChange(value === c.value ? null : c.value)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

const STUCK_OPTIONS: { kind: HelpKind; label: string }[] = [
  { kind: 'simpler', label: 'Explain it more simply' },
  { kind: 'analogy', label: 'Give me an analogy' },
  { kind: 'steps', label: 'Step by step' },
];

/** After two misses, offer a different explanation instead of repeating the same one. */
function StuckOffer({ act }: { act: ReturnType<typeof useActivity> }) {
  const help = useLessonHelp();
  if (!help || act.wrong < 2 || act.done) return null;
  return (
    <div className="stuck" role="status">
      <span>Stuck? See it another way:</span>
      {STUCK_OPTIONS.filter((o) => help.offered.includes(o.kind)).map((o) => (
        <button key={o.kind} type="button" className="stuck__btn" onClick={() => help.open(o.kind, 'stuck')}>{o.label}</button>
      ))}
    </div>
  );
}

function Actions({ children, act, id }: { children: ReactNode; act: ReturnType<typeof useActivity>; id: string }) {
  return (
    <div className="activity__footer">
      {act.askConfidence && !act.done && <ConfidencePicker id={id} value={act.confidence} onChange={act.setConfidence} />}
      <div className="activity__actions">
        {children}
        {act.canReveal && (
          <Button variant="ghost" onClick={act.reveal}>
            <Eye size={16} aria-hidden="true" /> Show solution
          </Button>
        )}
        {act.wrong > 0 && !act.done && <span className="subtle activity__attempts">{act.wrong} wrong so far. Take your time.</span>}
      </div>
      <StuckOffer act={act} />
    </div>
  );
}

function Result({ kind, title, children }: { kind: 'ok' | 'warn' | 'info'; title: string; children: ReactNode }) {
  const Icon = kind === 'ok' ? CheckCircle2 : kind === 'warn' ? XCircle : Eye;
  return (
    <div className={`result result--${kind}`} role="status">
      <Icon size={18} aria-hidden="true" />
      <div><strong>{title}</strong> {children}</div>
    </div>
  );
}

const RevealedNote = () => (
  <Result kind="info" title="Solution shown.">
    That's recorded honestly: this skill will be marked “needs another challenge” and the question will come back later.
  </Result>
);

/* Order --------------------------------------------------------------- */

export function OrderTask({ activity, ctx }: { activity: OrderActivity; ctx: ActivityContext }) {
  const act = useActivity(ctx, activity);
  const initial = useMemo(() => stableShuffle(activity.steps, activity.id), [activity]);
  const [items, setItems] = useState(initial);
  const [checked, setChecked] = useState<null | number>(null);
  const total = activity.steps.length;
  const shown = act.revealed ? activity.steps : items;
  const locked = act.done;

  const move = (from: number, to: number) => {
    setItems((list) => moveItem(list, from, to));
    setChecked(null);
  };
  const check = () => {
    const n = countInPlace(items, activity.steps);
    setChecked(n);
    act.submit(items.map((s, i) => `${i + 1}. ${s}`).join(' | '), n === total);
  };

  return (
    <div className="activity">
      <p className="activity__prompt">{activity.prompt}</p>
      <ol className="order-list">
        {shown.map((step, i) => (
          <li key={step} className="order-item" data-correct={checked !== null || locked ? step === activity.steps[i] : undefined}>
            <span className="order-item__n tabular">{i + 1}</span>
            <span className="order-item__text">{step}</span>
            {!locked && (
              <span className="order-item__moves">
                <Button size="sm" variant="ghost" icon onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move “${step}” up`}>
                  <ArrowUp size={16} aria-hidden="true" />
                </Button>
                <Button size="sm" variant="ghost" icon onClick={() => move(i, i + 1)} disabled={i === shown.length - 1} aria-label={`Move “${step}” down`}>
                  <ArrowDown size={16} aria-hidden="true" />
                </Button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {!locked && (
        <Actions act={act} id={activity.id}>
          <Button variant="primary" onClick={check}><Check size={16} aria-hidden="true" /> Check order</Button>
          <Button variant="ghost" onClick={() => { setItems(initial); setChecked(null); }}><RotateCcw size={16} aria-hidden="true" /> Reset</Button>
        </Actions>
      )}
      <div aria-live="polite">
        {act.revealed && <RevealedNote />}
        {!act.revealed && checked !== null &&
          (checked === total ? (
            <Result kind="ok" title={`All ${total} in place.`}>{activity.feedback.correct}</Result>
          ) : (
            <Result kind="warn" title={`${checked} of ${total} are in the right place.`}>{activity.feedback.incorrect}</Result>
          ))}
      </div>
    </div>
  );
}

/* Choice (concept, predict, bug) -------------------------------------- */

export function ChoiceTask({ activity, ctx }: { activity: ChoiceActivity; ctx: ActivityContext }) {
  const act = useActivity(ctx, activity);
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const choice = activity.options.find((o) => o.id === submitted);
  const correctOpt = activity.options.find((o) => o.correct)!;
  const name = `${ctx.sessionId}-${activity.id}`;

  const check = () => {
    const o = activity.options.find((x) => x.id === picked);
    if (!o) return;
    setSubmitted(o.id);
    act.submit(o.text, o.correct, o.correct ? null : o.misconception ?? null);
  };

  const stateOf = (id: string) => {
    if (act.revealed && id === correctOpt.id) return 'right';
    if (submitted === id) return choice?.correct ? 'right' : 'wrong';
    return undefined;
  };

  return (
    <fieldset className="activity activity--fieldset">
      <legend className="activity__prompt">{activity.prompt}</legend>
      {activity.code && <CodeBlock code={activity.code} />}
      <div className="choices">
        {activity.options.map((o, i) => (
          <label key={o.id} className="choice" data-state={stateOf(o.id)}>
            <input type="radio" name={name} value={o.id} checked={picked === o.id} disabled={act.done} onChange={() => { setPicked(o.id); setSubmitted(null); }} />
            <span className="choice__key" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
            <span className="choice__text">{o.text}</span>
          </label>
        ))}
      </div>
      {!act.done && (
        <Actions act={act} id={activity.id}>
          <Button variant="primary" disabled={!picked || picked === submitted} onClick={check}>Check answer</Button>
        </Actions>
      )}
      <div aria-live="polite">
        {act.revealed && (
          <>
            <RevealedNote />
            <p className="muted small">{correctOpt.why}</p>
          </>
        )}
        {!act.revealed && choice && (
          <Result kind={choice.correct ? 'ok' : 'warn'} title={choice.correct ? 'Correct.' : 'Not this one.'}>
            {choice.why}
            {!choice.correct && ' Try another option.'}
          </Result>
        )}
      </div>
    </fieldset>
  );
}

/* Fill the gap -------------------------------------------------------- */

export function FillTask({ activity, ctx }: { activity: FillActivity; ctx: ActivityContext }) {
  const act = useActivity(ctx, activity);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<ReturnType<typeof checkFill> | null>(null);
  const inputId = `${ctx.sessionId}-${activity.id}-gap`;
  const shownValue = act.revealed ? activity.accepted[0]! : value;
  const width = Math.max(4, shownValue.length + 1, ...activity.accepted.map((a) => a.length + 1));

  const check = () => {
    const r = checkFill(activity, value);
    setResult(r);
    act.submit(value.trim() || '(empty)', r.correct, r.misconception);
  };

  const gap = (
    <input
      id={inputId}
      className="gap-input"
      value={shownValue}
      readOnly={act.done}
      data-state={act.solved ? 'right' : result && !result.correct ? 'wrong' : undefined}
      style={{ width: `${width}ch` }}
      aria-label="Missing code"
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      onChange={(e) => { setValue(e.target.value); setResult(null); }}
      onKeyDown={(e) => { if (e.key === 'Enter' && value.trim() && !act.done) check(); }}
    />
  );

  return (
    <div className="activity">
      <label htmlFor={inputId} className="activity__prompt">{activity.prompt}</label>
      <CodeBlock code={activity.code} gap={gap} />
      {!act.done && (
        <Actions act={act} id={activity.id}>
          <Button variant="primary" disabled={!value.trim()} onClick={check}>Check</Button>
        </Actions>
      )}
      <div aria-live="polite">
        {act.revealed && <><RevealedNote /><p className="muted small">{activity.explanation}</p></>}
        {!act.revealed && result && (
          <Result kind={result.correct ? 'ok' : 'warn'} title={result.correct ? 'Correct.' : 'Not quite.'}>
            {result.correct ? activity.explanation : result.why ?? 'That doesn\'t fit here. Read the comment and the line around the gap again.'}
          </Result>
        )}
      </div>
    </div>
  );
}

/* Explain ------------------------------------------------------------- */

export function ExplainTask({ activity, ctx }: { activity: ExplainActivity; ctx: ActivityContext }) {
  const act = useActivity(ctx, activity);
  const [text, setText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [covered, setCovered] = useState<boolean[]>(() => activity.lookFor.map(() => false));
  const [saved, setSaved] = useState(false);
  const id = `${ctx.sessionId}-${activity.id}-text`;
  const enough = text.trim().length >= 20;

  return (
    <div className="activity">
      <label htmlFor={id} className="activity__prompt">{activity.prompt}</label>
      <textarea id={id} className="input textarea" rows={4} value={text} readOnly={revealed} onChange={(e) => setText(e.target.value)} placeholder="Write your explanation here…" />
      {!revealed && (
        <div className="activity__actions">
          <Button variant="primary" disabled={!enough} onClick={() => { setRevealed(true); act.submit(text.trim(), null); }}>
            Save and compare
          </Button>
          <span className="subtle activity__attempts">{enough ? 'Saved to your learning evidence.' : 'Write at least a sentence first.'}</span>
        </div>
      )}
      {revealed && (
        <div className="look-for" aria-live="polite">
          <span className="eyebrow">Tick what your answer covered</span>
          <ul className="look-for__list">
            {activity.lookFor.map((x, i) => (
              <li key={x}>
                <label className="check">
                  <input type="checkbox" checked={covered[i]} disabled={saved} onChange={() => setCovered((c) => c.map((v, j) => (j === i ? !v : v)))} />
                  <span>{x}</span>
                </label>
              </li>
            ))}
          </ul>
          {!saved ? (
            <div><Button size="sm" onClick={() => { act.submit(text.trim(), null, null, { covered: covered.filter(Boolean).length, of: covered.length }); setSaved(true); }}>Save self-check</Button></div>
          ) : (
            <p className="subtle small">Saved. This is self-assessed and labeled that way in your evidence. An AI reviewer can give independent feedback from Phase 6.</p>
          )}
        </div>
      )}
      {act.saveFailed && <Notice kind="danger">Your browser refused to save this. Check that site storage isn't blocked.</Notice>}
    </div>
  );
}
