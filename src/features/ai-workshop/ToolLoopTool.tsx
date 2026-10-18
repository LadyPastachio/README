import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildSteps, type Scenario } from '@/core/ai/toolLoop';
import { Button, Segmented, Switch } from '@/design/components';
import { JsonBlock, SourceBadge } from './shared';

const ACTOR: Record<string, string> = { lead: 'Lead', app: 'Your app', model: 'Model', tool: 'Your tool code', person: 'A person' };

export function ToolLoopTool() {
  const [scenario, setScenario] = useState<Scenario>('available');
  const [approval, setApproval] = useState(true);
  const steps = useMemo(() => buildSteps({ scenario, requireApproval: approval }), [scenario, approval]);
  const [i, setI] = useState(0);
  const at = Math.min(i, steps.length - 1);
  const step = steps[at]!;

  return (
    <div className="ai-tool">
      <div className="ai-tool__intro">
        <p>
          How a model "uses tools": it only <em>asks</em>; your code decides, checks and runs. Step through one booking, in the Messages API's real message shapes. <SourceBadge source="simulated" /> The model's turns are scripted; the argument checks are real code.
        </p>
      </div>
      <div className="ai-loop__controls">
        <Segmented label="Scenario" value={scenario} options={[{ value: 'available', label: 'Slot is free' }, { value: 'taken', label: 'Slot is taken' }, { value: 'bad-args', label: 'Bad arguments' }]} onChange={(v) => { setScenario(v); setI(0); }} />
        <label className="ai-inline-switch"><Switch checked={approval} onChange={(v) => { setApproval(v); setI(0); }} label="Require a person to approve bookings" /> Require approval for bookings</label>
      </div>
      <ol className="ai-loop__track" aria-label="Steps">
        {steps.map((s, n) => (
          <li key={n}>
            <button type="button" data-actor={s.actor} aria-current={n === at ? 'step' : undefined} aria-label={`Step ${n + 1}: ${s.title}`} onClick={() => setI(n)}>{n + 1}</button>
          </li>
        ))}
      </ol>
      <article className="ai-loop__step" data-actor={step.actor} aria-live="polite">
        <span className="ai-loop__actor">{ACTOR[step.actor]}</span>
        <h3 className="panel__title">{step.title}</h3>
        <p className="muted">{step.explain}</p>
        {step.payload !== undefined && <JsonBlock value={step.payload} label="Message" />}
      </article>
      <div className="ai-loop__nav">
        <Button onClick={() => setI(at - 1)} disabled={at === 0}><ChevronLeft size={16} aria-hidden="true" /> Back</Button>
        <span className="subtle tabular">Step {at + 1} of {steps.length}</span>
        <Button variant="primary" onClick={() => setI(at + 1)} disabled={at === steps.length - 1}>Next <ChevronRight size={16} aria-hidden="true" /></Button>
      </div>
    </div>
  );
}
