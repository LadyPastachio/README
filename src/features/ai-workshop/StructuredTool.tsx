import { useMemo, useState } from 'react';
import { DEFAULT_PIPELINE, SCHEMA_TEXT, evaluate, type Outcome, type PipelineOptions } from '@/core/ai/structured';
import { Switch } from '@/design/components';
import { JsonBlock, SourceBadge } from './shared';

const STEPS: { key: keyof PipelineOptions; label: string; detail: string }[] = [
  { key: 'stripFences', label: 'Remove code fences', detail: 'Strip ```json … ``` wrappers.' },
  { key: 'extractJson', label: 'Extract the JSON', detail: 'Keep only the text from the first { to the last }.' },
  { key: 'validate', label: 'Validate against the schema', detail: 'Check every field and value with Zod.' },
  { key: 'strict', label: 'Reject unknown fields', detail: 'Strict mode: extra fields fail validation.' },
  { key: 'retry', label: 'Retry once with the error', detail: 'Ask again, telling the model what was wrong.' },
  { key: 'fallback', label: 'Fall back to a person', detail: 'If all else fails, hand off instead of crashing.' },
];

const OUTCOME: Record<Outcome, string> = { correct: 'Correct', handoff: 'Handed to a person', wrong: 'Wrong data accepted', crashed: 'Workflow crashed' };

export function StructuredTool() {
  const [opts, setOpts] = useState<PipelineOptions>(DEFAULT_PIPELINE);
  const [open, setOpen] = useState<string | null>('fenced');
  const result = useMemo(() => evaluate(opts), [opts]);

  return (
    <div className="ai-tool">
      <div className="ai-tool__intro">
        <p>
          Your lead workflow asks a model to classify each message as JSON. Below are eight outputs of the kinds real models produce. <SourceBadge source="simulated" /> The outputs are authored examples; the pipeline that handles them is real code. Switch on safety steps and watch the evaluation change.
        </p>
      </div>
      <div className="ai-structured">
        <div className="ai-structured__side">
          <span className="field-label">Expected shape</span>
          <JsonBlock value={SCHEMA_TEXT} label="Schema" />
          <span className="field-label">Pipeline steps</span>
          <ul className="ai-toggles">
            {STEPS.map((s) => (
              <li key={s.key}>
                <Switch checked={opts[s.key]} onChange={(v) => setOpts((o) => ({ ...o, [s.key]: v, ...(s.key === 'strict' && v ? { validate: true } : {}), ...(s.key === 'validate' && !v ? { strict: false } : {}) }))} label={s.label} />
                <div><strong>{s.label}</strong><span className="muted">{s.detail}</span></div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="ai-eval" role="status" aria-label="Evaluation results">
            <div data-k="correct"><strong className="tabular">{result.correct}</strong><span>correct</span></div>
            <div data-k="handoff"><strong className="tabular">{result.handoff}</strong><span>handed off</span></div>
            <div data-k="wrong"><strong className="tabular">{result.wrong}</strong><span>wrong data</span></div>
            <div data-k="crashed"><strong className="tabular">{result.crashed}</strong><span>crashed</span></div>
          </div>
          <p className="subtle">This table is an evaluation: the same cases, run after every change, so you can see whether a change helps or quietly breaks something.</p>
          <ul className="ai-cases">
            {result.rows.map(({ sample, result: r }) => (
              <li key={sample.id} data-outcome={r.outcome}>
                <button type="button" className="ai-case__head" aria-expanded={open === sample.id} onClick={() => setOpen(open === sample.id ? null : sample.id)}>
                  <span className="ai-case__dot" aria-hidden="true" />
                  <span className="ai-case__label">{sample.label}</span>
                  <span className="ai-case__outcome">{OUTCOME[r.outcome]}</span>
                </button>
                {open === sample.id && (
                  <div className="ai-case__body">
                    <p className="muted"><strong>Lead:</strong> {sample.lead}</p>
                    <span className="field-label">Model output</span>
                    <JsonBlock value={sample.output} />
                    <ol className="ai-case__steps">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                    <p className="ai-case__lesson">{sample.lesson}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
