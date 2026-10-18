import { Link } from 'react-router-dom';
import { CircleCheck, CircleDashed, Circle, SquareTerminal, BookOpen, Flag, Clock } from 'lucide-react';
import type { LearningPath } from '@/content/types';
import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { pathProgress, estimateWeeks, formatWeeks, type MilestoneStatus, type ItemState } from '@/core/learning/milestones';
import { Planned } from '@/design/components';

const ITEM_LABEL: Record<ItemState, string> = { done: 'Done', covered: 'Already shown elsewhere', started: 'Started', todo: 'To do' };
const STATE_LABEL = { planned: 'Planned', 'not-started': 'Not started', 'in-progress': 'In progress', complete: 'Complete' } as const;

function ItemIcon({ state }: { state: ItemState }) {
  if (state === 'done' || state === 'covered') return <CircleCheck size={16} aria-hidden="true" />;
  if (state === 'started') return <CircleDashed size={16} aria-hidden="true" />;
  return <Circle size={16} aria-hidden="true" />;
}

function Milestone({ status, index, isCurrent, weeklyHours }: { status: MilestoneStatus; index: number; isCurrent: boolean; weeklyHours: number }) {
  const m = status.milestone;
  const est = estimateWeeks(status.remainingMinutes, weeklyHours);
  return (
    <li className="ms" data-state={status.state} data-current={isCurrent || undefined}>
      <span className="ms__marker" aria-hidden="true">{status.state === 'complete' ? <CircleCheck size={18} /> : index + 1}</span>
      <div className="ms__body">
        <div className="ms__head">
          <h3>{m.title}</h3>
          <span className="chip ms__state" data-state={status.state}>{isCurrent ? 'Current · ' : ''}{STATE_LABEL[status.state]}</span>
        </div>
        <p className="muted small">{m.deliverable}</p>
        {status.state === 'planned' ? (
          <Planned phase={7}>Lessons and projects for this milestone are written in a later content batch. Provisional estimate: {m.estimate}.</Planned>
        ) : (
          <>
            <div className="ms__meta">
              <span><strong className="tabular">{status.done}</strong> of {status.total} done</span>
              {status.state !== 'complete' && <span className="subtle"><Clock size={12} aria-hidden="true" /> {formatWeeks(est)} left at {weeklyHours} h/week (estimate)</span>}
            </div>
            <ul className="ms__items">
              {status.items.map((it) => (
                <li key={`${it.kind}-${it.id}`} data-state={it.state}>
                  <ItemIcon state={it.state} />
                  <Link to={it.kind === 'lab' ? `/lab/${it.id}` : `/learn/lesson/${it.id}`}>
                    {it.kind === 'lab' ? <SquareTerminal size={13} aria-hidden="true" /> : <BookOpen size={13} aria-hidden="true" />}
                    {it.title}
                  </Link>
                  {m.project === it.id && <span className="ms__project"><Flag size={11} aria-hidden="true" /> Project</span>}
                  <span className="visually-hidden">({ITEM_LABEL[it.state]})</span>
                  {it.state === 'covered' && <span className="subtle small">already shown</span>}
                </li>
              ))}
            </ul>
            {m.acceptance.length > 0 && (
              <details className="ms__accept" open={isCurrent}>
                <summary>What “done” means</summary>
                <ul>{m.acceptance.map((a) => <li key={a}>{a}</li>)}</ul>
              </details>
            )}
          </>
        )}
      </div>
    </li>
  );
}

/** All milestones of a path, with what's done, what's next, and a time estimate. */
export function MilestoneTracker({ path }: { path: LearningPath }) {
  const { events } = useLearning();
  const { settings } = useSettings();
  const progress = pathProgress(events, path, LESSONS, LAB_EXERCISES);
  return (
    <ol className="ms-list">
      {progress.milestones.map((s, i) => (
        <Milestone key={s.milestone.id} status={s} index={i} isCurrent={progress.current?.milestone.id === s.milestone.id} weeklyHours={settings.learning.weeklyHours} />
      ))}
    </ol>
  );
}
