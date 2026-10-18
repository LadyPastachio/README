import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { coachPrompt } from '@/core/ai/promptCoach';
import { useAI } from '@/core/ai/useAI';
import type { AIResponse } from '@/core/ai/types';
import { Button } from '@/design/components';
import { ResponseCard } from './shared';

const START = 'Write a nice reply to a customer.';

export function CoachTool() {
  const [prompt, setPrompt] = useState(START);
  const report = useMemo(() => coachPrompt(prompt), [prompt]);
  const [res, setRes] = useState<AIResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const ai = useAI();

  return (
    <div className="ai-tool ai-coach">
      <div className="ai-tool__intro">
        <p>A prompt is a specification. The coach checks for the parts a good one has, as you type. It checks structure, not whether your content is right.</p>
      </div>
      <div className="ai-coach__grid">
        <div className="ai-form">
          <label htmlFor="coach-input" className="field-label">Your prompt</label>
          <textarea id="coach-input" rows={9} value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={4000} />
          <div className="ai-form__row">
            <span className="subtle tabular">{report.words} words</span>
            <span className="ai-form__actions">
              <Button size="sm" variant="ghost" onClick={() => setPrompt(report.skeleton)} disabled={report.skeleton === prompt.trim()}>Add missing parts</Button>
              <Button
                size="sm"
                variant="primary"
                disabled={busy || !prompt.trim()}
                onClick={async () => {
                  setBusy(true);
                  setRes(await ai.complete({ task: 'prompt-test', input: prompt }));
                  setBusy(false);
                }}
              >
                {busy ? 'Sending…' : 'Try it'}
              </Button>
            </span>
          </div>
        </div>
        <div className="ai-checklist" aria-label="Prompt checklist">
          <div className="ai-checklist__score"><strong className="tabular">{report.passed}</strong><span className="muted"> of {report.checks.length} parts</span></div>
          <ul>
            {report.checks.map((c) => (
              <li key={c.id} data-passed={c.passed}>
                {c.passed ? <Check size={15} aria-label="Present" /> : <X size={15} aria-label="Missing" />}
                <div><strong>{c.label}</strong><span className="muted">{c.detail}</span></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {res && <ResponseCard res={res} />}
    </div>
  );
}
