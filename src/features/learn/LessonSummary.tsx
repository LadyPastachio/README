import { Link } from 'react-router-dom';
import { Copy, Download, FileJson, Sparkles, ArrowRight } from 'lucide-react';
import type { Lesson } from '@/content/schema';
import { LESSONS } from '@/content/lessons';
import { Button, MasteryPill } from '@/design/components';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { lessonResult } from '@/core/learning/mastery';
import { reviewPlan } from '@/core/learning/schedule';
import { buildEvidence, evidenceToMarkdown, assessorPrompt } from '@/core/learning/evidence';
import { useToast } from '@/app/Toast';
import { copyText, downloadText, dateStamp } from '@/features/settings/fileHelpers';

const OUTCOME_LABEL = { unattempted: 'Not tried', 'first-try': 'First try', retried: 'After a retry', revealed: 'Solution shown', failed: 'Not solved yet' } as const;

/** End-of-lesson summary with Learning Evidence export. Appears once something has been attempted. */
export function LessonSummary({ lesson }: { lesson: Lesson }) {
  const { events } = useLearning();
  const { settings } = useSettings();
  const toast = useToast();
  const result = lessonResult(events, lesson);
  if (result.status === 'none') return null;

  const plan = reviewPlan(events, lesson);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[idx + 1];
  const evidence = () => buildEvidence(events, lesson, LESSONS, settings.profile);
  const file = `evidence-${lesson.id}-${dateStamp()}`;

  const copy = async (text: string, what: string) => toast((await copyText(text)) ? `${what} copied` : 'Copy was blocked by the browser. Try Download instead.');
  const download = (text: string, ext: 'md' | 'json') =>
    toast(downloadText(`${file}.${ext}`, text, ext === 'json' ? 'application/json' : 'text/markdown') ? 'Downloaded' : 'Download was blocked. Try Copy instead.');

  return (
    <section className="summary" aria-labelledby="summary-h">
      <div className="summary__head">
        <div>
          <span className="eyebrow">{result.complete ? 'Lesson complete' : 'In progress'}</span>
          <h2 id="summary-h">Your evidence so far</h2>
        </div>
        <MasteryPill status={result.status} />
      </div>

      <ul className="summary__outcomes">
        {result.activities.map((a, i) => (
          <li key={a.activityId} data-outcome={a.outcome}>
            <span className="summary__dot" aria-hidden="true" />
            <span>Activity {i + 1}</span>
            <strong>{OUTCOME_LABEL[a.outcome]}</strong>
          </li>
        ))}
      </ul>

      <p className="muted">
        {result.status === 'independent' && 'You did this on your own, without hints or solutions.'}
        {result.status === 'supported' && (result.complete ? 'Finished with some help. That counts as practice; a spaced review will show what stuck.' : 'Finish the remaining activities to complete the lesson.')}
        {result.status === 'challenge' && 'One or more activities need another go on your own. They\'ll be suggested on Home.'}
        {plan && <> Next review: <strong>{plan.dueAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</strong>.</>}
      </p>

      <div className="summary__export">
        <div>
          <strong>Learning Evidence</strong>
          <p className="subtle small">A record of what you did here: answers, hints, mistakes, your explanation and what to work on.</p>
        </div>
        <div className="btn-row">
          <Button size="sm" onClick={() => copy(evidenceToMarkdown(evidence()), 'Evidence')}><Copy size={14} aria-hidden="true" /> Copy</Button>
          <Button size="sm" variant="ghost" onClick={() => download(evidenceToMarkdown(evidence()), 'md')}><Download size={14} aria-hidden="true" /> Markdown</Button>
          <Button size="sm" variant="ghost" onClick={() => download(JSON.stringify(evidence(), null, 2), 'json')}><FileJson size={14} aria-hidden="true" /> JSON</Button>
        </div>
      </div>
      <div className="summary__export">
        <div>
          <strong>Get quizzed by an independent AI</strong>
          <p className="subtle small">Copies a prompt with your evidence. Paste it into a separate AI chat: it will quiz you one question at a time without giving answers away.</p>
        </div>
        <div className="btn-row">
          <Button size="sm" onClick={() => copy(assessorPrompt(evidence()), 'Assessment prompt')}><Sparkles size={14} aria-hidden="true" /> Copy prompt</Button>
        </div>
      </div>

      {result.complete && next && (
        <Link to={`/learn/lesson/${next.id}`} className="summary__next">
          <span><span className="eyebrow">Next lesson</span><strong>{next.title}</strong></span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}
