import { useState } from 'react';
import { ATTACKS, DEFENSES, runAttack, type AttackOutcome, type Defense } from '@/core/ai/injection';
import { Switch } from '@/design/components';
import { SourceBadge } from './shared';

const LABEL: Record<AttackOutcome, string> = { stopped: 'Stopped', reduced: 'Less likely, not stopped', succeeded: 'Attack worked', answered: 'Answered correctly', guessed: 'Answered with a guess' };

export function InjectionTool() {
  const [active, setActive] = useState<Set<Defense>>(new Set());
  const toggle = (d: Defense, on: boolean) => setActive((s) => { const n = new Set(s); if (on) n.add(d); else n.delete(d); return n; });
  const results = ATTACKS.map((a) => ({ a, r: runAttack(a, active) }));
  const stopped = results.filter((x) => x.r.outcome === 'stopped').length;
  const attacks = ATTACKS.filter((a) => !a.benign).length;

  return (
    <div className="ai-tool">
      <div className="ai-tool__intro">
        <p>
          Prompt injection is text that tries to give your agent new instructions. These synthetic lead messages each try something. Turn on defense layers and see which attacks they stop. <SourceBadge source="simulated" /> This is a scripted simulation: real models are less predictable, which is why defenses in code matter more than instructions in the prompt.
        </p>
      </div>
      <div className="ai-structured">
        <div className="ai-structured__side">
          <span className="field-label">Defense layers</span>
          <ul className="ai-toggles">
            {DEFENSES.map((d) => (
              <li key={d.id}>
                <Switch checked={active.has(d.id)} onChange={(v) => toggle(d.id, v)} label={d.label} />
                <div><strong>{d.label} <span className="ai-kind" data-kind={d.kind}>{d.kind === 'code' ? 'enforced in code' : 'in the prompt'}</span></strong><span className="muted">{d.detail}</span></div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="ai-injection__score" role="status"><strong className="tabular">{stopped} of {attacks}</strong> attacks stopped</p>
          <ul className="ai-attacks">
            {results.map(({ a, r }) => (
              <li key={a.id} data-outcome={r.outcome}>
                <div className="ai-attack__head"><strong>{a.label}</strong><span className="ai-attack__outcome">{LABEL[r.outcome]}</span></div>
                <blockquote className="ai-attack__msg">{a.message}</blockquote>
                <p className="muted">
                  {r.outcome === 'stopped' || r.outcome === 'answered'
                    ? a.stopped
                    : r.outcome === 'reduced'
                      ? `${DEFENSES.filter((d) => r.by.includes(d.id)).map((d) => d.label).join(' and ')} make this less likely, but a model can still be talked round. Without a check in code: ${a.naive.charAt(0).toLowerCase()}${a.naive.slice(1)}`
                      : a.naive}
                </p>
                {r.outcome === 'stopped' && <p className="subtle">Stopped by: {DEFENSES.filter((d) => r.by.includes(d.id)).map((d) => d.label).join(', ')}</p>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
