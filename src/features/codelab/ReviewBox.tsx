import { useState } from 'react';
import { SearchCheck } from 'lucide-react';
import { reviewCode, SEVERITY_LABEL, type Finding } from '@/core/ai/codeReview';
import { useAI } from '@/core/ai/useAI';
import type { AIResponse } from '@/core/ai/types';
import { Button } from '@/design/components';
import { ResponseCard } from '@/features/ai-workshop/shared';
import type { LabFiles } from '@/core/lab/buildDocument';

const FILE_NAME = { html: 'index.html', css: 'style.css', js: 'script.js' } as const;

/**
 * Code review inside the Code Lab. The rule checks run instantly, offline.
 * With a live model connected, a model review can be requested as well.
 * Reviews point out problems; they never write the solution, so they don't
 * count as hints.
 */
export function ReviewBox({ files, title, onGoTo }: { files: LabFiles; title: string; onGoTo: (f: Finding) => void }) {
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [res, setRes] = useState<AIResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const ai = useAI();

  return (
    <div className="hint-box review-box">
      <div className="hint-box__head"><SearchCheck size={16} aria-hidden="true" /><strong>Code review</strong><span className="subtle">Rule checks, not a model</span></div>
      <div className="btn-row">
        <Button size="sm" onClick={() => setFindings(reviewCode(files))}>{findings ? 'Review again' : 'Review my code'}</Button>
        {ai.live && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={async () => { setBusy(true); setRes(await ai.complete({ task: 'mentor', mode: 'review', input: `Review my code for the exercise "${title}". Point out problems; don't write the solution.`, code: files })); setBusy(false); }}>
            {busy ? 'Asking…' : 'Ask the model too'}
          </Button>
        )}
      </div>
      {findings && (findings.length === 0 ? (
        <p className="muted review-box__empty">No common problems found. That doesn't prove the code is right: the checks above decide that.</p>
      ) : (
        <ul className="review-list" aria-label="Review findings">
          {findings.map((f) => (
            <li key={`${f.file}-${f.id}-${f.line}`} data-severity={f.severity}>
              <span className="review-list__sev">{SEVERITY_LABEL[f.severity]}</span>
              <strong>{f.title}</strong>
              <span className="muted">{f.why} {f.fix}</span>
              <button type="button" className="lab-log__goto" onClick={() => onGoTo(f)}>{FILE_NAME[f.file]}, line {f.line}</button>
            </li>
          ))}
        </ul>
      ))}
      {res && <ResponseCard res={res} />}
    </div>
  );
}
