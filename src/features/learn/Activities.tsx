import { useMemo, useState } from 'react';
import { ArrowUp, ArrowDown, Check, RotateCcw } from 'lucide-react';
import type { OrderActivity, ChoiceActivity, ExplainActivity } from '@/content/types';
import { Button, Notice } from '@/design/components';
import { stableShuffle, moveItem, countInPlace } from './activityLogic';

export function OrderTask({ activity }: { activity: OrderActivity }) {
  const initial = useMemo(() => stableShuffle(activity.steps, activity.id), [activity]);
  const [items, setItems] = useState(initial);
  const [checked, setChecked] = useState<null | number>(null);
  const [attempts, setAttempts] = useState(0);
  const total = activity.steps.length;

  const move = (from: number, to: number) => {
    setItems((list) => moveItem(list, from, to));
    setChecked(null);
  };

  return (
    <div className="activity" aria-labelledby={`${activity.id}-p`}>
      <p id={`${activity.id}-p`} className="activity__prompt">{activity.prompt}</p>
      <ol className="order-list">
        {items.map((step, i) => (
          <li key={step} className="order-item" data-correct={checked !== null ? step === activity.steps[i] : undefined}>
            <span className="order-item__n tabular">{i + 1}</span>
            <span className="order-item__text">{step}</span>
            <span className="order-item__moves">
              <Button size="sm" variant="ghost" icon onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move “${step}” up`}>
                <ArrowUp size={16} aria-hidden="true" />
              </Button>
              <Button size="sm" variant="ghost" icon onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label={`Move “${step}” down`}>
                <ArrowDown size={16} aria-hidden="true" />
              </Button>
            </span>
          </li>
        ))}
      </ol>
      <div className="activity__actions">
        <Button variant="primary" onClick={() => { setChecked(countInPlace(items, activity.steps)); setAttempts((a) => a + 1); }}>
          <Check size={16} aria-hidden="true" /> Check order
        </Button>
        <Button variant="ghost" onClick={() => { setItems(initial); setChecked(null); }}>
          <RotateCcw size={16} aria-hidden="true" /> Reset
        </Button>
        {attempts > 0 && <span className="subtle activity__attempts">Attempts: {attempts}</span>}
      </div>
      <div aria-live="polite">
        {checked !== null &&
          (checked === total ? (
            <Notice kind="ok"><strong>All {total} in place.</strong> {activity.feedback.correct}</Notice>
          ) : (
            <Notice kind="warn"><strong>{checked} of {total} are in the right place.</strong> {activity.feedback.incorrect}</Notice>
          ))}
      </div>
    </div>
  );
}

export function ChoiceTask({ activity }: { activity: ChoiceActivity }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const choice = activity.options.find((o) => o.id === picked);
  const name = `${activity.id}-opt`;

  return (
    <fieldset className="activity activity--fieldset">
      <legend className="activity__prompt">{activity.prompt}</legend>
      <div className="choices">
        {activity.options.map((o) => (
          <label key={o.id} className="choice" data-state={submitted && o.id === picked ? (o.correct ? 'right' : 'wrong') : undefined}>
            <input type="radio" name={name} value={o.id} checked={picked === o.id} onChange={() => { setPicked(o.id); setSubmitted(false); }} />
            <span>{o.text}</span>
          </label>
        ))}
      </div>
      <div className="activity__actions">
        <Button variant="primary" disabled={!picked} onClick={() => setSubmitted(true)}>Check answer</Button>
      </div>
      <div aria-live="polite">
        {submitted && choice && (
          <Notice kind={choice.correct ? 'ok' : 'warn'}>
            <strong>{choice.correct ? 'Correct.' : 'Not this one.'}</strong> {choice.why}
            {!choice.correct && ' Try another option.'}
          </Notice>
        )}
      </div>
    </fieldset>
  );
}

export function ExplainTask({ activity }: { activity: ExplainActivity }) {
  const [text, setText] = useState('');
  const [revealed, setRevealed] = useState(false);
  const id = `${activity.id}-text`;
  return (
    <div className="activity">
      <label htmlFor={id} className="activity__prompt">{activity.prompt}</label>
      <textarea id={id} className="input textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your explanation here…" />
      <div className="activity__actions">
        <Button variant="primary" disabled={text.trim().length < 20} onClick={() => setRevealed(true)}>
          Compare with what to look for
        </Button>
        <span className="subtle activity__attempts">{text.trim().length < 20 ? 'Write at least a sentence first.' : 'Not graded automatically.'}</span>
      </div>
      {revealed && (
        <div className="look-for" aria-live="polite">
          <span className="eyebrow">A strong answer mentions</span>
          <ul>{activity.lookFor.map((x) => <li key={x}>{x}</li>)}</ul>
          <p className="subtle">Check your answer against each point. In Phase 6, a code reviewer mentor can give written feedback on explanations like this one.</p>
        </div>
      )}
    </div>
  );
}
