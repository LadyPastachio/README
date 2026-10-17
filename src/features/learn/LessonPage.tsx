import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Lightbulb, Target, CalendarClock, Lock } from 'lucide-react';
import { PageHeader, Panel, PathTag, Button, Notice, CodeBlock, ActivityBadge, activityType, MasteryPill } from '@/design/components';
import { LessonArt } from '@/design/illustrations/LessonArt';
import { getLesson } from '@/content/lessons';
import { getSkill } from '@/content/skills';
import type { Activity } from '@/content/schema';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { newId } from '@/core/learning/records';
import { lessonResult, activityResult, type ActivityOutcome } from '@/core/learning/mastery';
import { NotFoundPage } from '@/app/NotFoundPage';
import { OrderTask, ChoiceTask, FillTask, ExplainTask } from './Activities';
import { RequestDiagram } from './RequestDiagram';
import { LessonSummary } from './LessonSummary';
import type { ActivityContext } from './useActivity';

const PREVIOUS: Partial<Record<ActivityOutcome, string>> = {
  'first-try': 'Last time: correct first try',
  retried: 'Last time: correct after a retry',
  revealed: 'Last time: solution shown',
  failed: 'Last time: not solved yet',
};

export function LessonPage() {
  const { lessonId = '' } = useParams();
  // key: a fresh lesson view (new session, hints reset) whenever the lesson changes.
  return <LessonView key={lessonId} lessonId={lessonId} />;
}

function LessonView({ lessonId }: { lessonId: string }) {
  const lesson = getLesson(lessonId);
  const { events } = useLearning();
  const { settings } = useSettings();
  // A new session each time the lesson is opened; it groups this visit's attempts.
  const [sessionId] = useState(() => newId('s'));
  const [hintsShown, setHintsShown] = useState(0);

  if (!lesson) return <NotFoundPage />;
  const skill = getSkill(lesson.skill);
  const order = settings.learning.lessonOrder;
  const thisVisit = events.filter((e) => e.sessionId === sessionId);
  const earlier = events.filter((e) => e.sessionId !== sessionId);
  const hasAttempted = thisVisit.some((e) => e.type === 'answer');
  const hintsLocked = settings.learning.hintTiming === 'after-attempt' && !hasAttempted;
  const result = lessonResult(events, lesson);
  const prereqs = lesson.prerequisites.map((p) => getLesson(p)).filter((l): l is NonNullable<typeof l> => !!l);
  const unmetPrereqs = prereqs.filter((p) => !lessonResult(events, p).complete);

  const ctx: ActivityContext = { lessonId: lesson.id, context: 'lesson', sessionId, hintsShown, lessonOrder: order };
  const warmup = order === 'try-first' ? lesson.activities[0] : undefined;
  const practice = warmup ? lesson.activities.slice(1) : lesson.activities;

  const renderActivity = (a: Activity, n: number, total: number, label?: string) => {
    const prev = a.kind !== 'explain' ? PREVIOUS[activityResult(earlier, lesson.id, a.id).outcome] : undefined;
    return (
      <article key={`${sessionId}-${a.id}`} className="activity-card" aria-label={`${label ?? `Activity ${n} of ${total}`}`}>
        <header className="activity-card__head">
          <ActivityBadge type={activityType(a)} />
          <span className="activity-card__count">{label ?? `${n} / ${total}`}</span>
        </header>
        {prev && <span className="activity-card__prev">{prev}</span>}
        {a.kind === 'order' && <OrderTask activity={a} ctx={ctx} />}
        {a.kind === 'choice' && <ChoiceTask activity={a} ctx={ctx} />}
        {a.kind === 'fill' && <FillTask activity={a} ctx={ctx} />}
        {a.kind === 'explain' && <ExplainTask activity={a} ctx={ctx} />}
      </article>
    );
  };

  return (
    <>
      <div className="lesson-hero">
        <LessonArt lessonId={lesson.id} className="lesson-hero__art" />
        <div className="lesson-hero__text">
          <PageHeader breadcrumbs={[{ label: 'Learn', to: '/learn' }, { label: lesson.title }]} title={lesson.title} />
          <div className="lesson-meta">
            <span className="chip"><Clock size={13} aria-hidden="true" /> About {lesson.minutes} min</span>
            {skill && <span className="chip">{skill.name}</span>}
            {result.status !== 'none' && <MasteryPill status={result.status} />}
          </div>
          <p className="lesson-objective"><Target size={16} aria-hidden="true" /> {lesson.objective}</p>
        </div>
      </div>

      {unmetPrereqs.length > 0 && (
        <Notice kind="info">
          <strong>Recommended first:</strong>{' '}
          {unmetPrereqs.map((p, i) => <span key={p.id}>{i > 0 && ', '}<Link to={`/learn/lesson/${p.id}`}>{p.title}</Link></span>)}. You can still continue.
        </Notice>
      )}

      <div className="lesson-layout">
        <div className="lesson-main">
          <section className="why-callout" aria-labelledby="why-h">
            <h2 id="why-h" className="eyebrow">Why this matters for your projects</h2>
            <p>{lesson.whyItMatters}</p>
            <div className="why-callout__paths">{lesson.paths.map((p) => <PathTag key={p} path={p} />)}</div>
          </section>

          {warmup && (
            <section className="lesson-section" aria-labelledby="warmup-h">
              <h2 id="warmup-h">Try this first</h2>
              <p className="muted">Have a go before reading. Getting it wrong now is useful: it shows you what to look for in the explanation below.</p>
              {renderActivity(warmup, 1, lesson.activities.length, 'Warm-up')}
            </section>
          )}

          {lesson.sections.map((s) => (
            <section key={s.heading} className="lesson-section">
              <h2>{s.heading}</h2>
              <div className="prose">{s.body.map((p) => <p key={p.slice(0, 32)}>{p}</p>)}</div>
              {s.code && <CodeBlock code={s.code} />}
              {s.diagram === 'request-response' && <RequestDiagram />}
            </section>
          ))}

          <section className="lesson-section" aria-labelledby="practice-h">
            <div className="practice-head">
              <h2 id="practice-h">Practice</h2>
              <div className="hint-box">
                <div className="hint-box__head">
                  <Lightbulb size={16} aria-hidden="true" />
                  <strong>Hints</strong>
                  <span className="subtle">{hintsShown} of {lesson.hints.length} used</span>
                </div>
                {hintsShown > 0 && <ol className="hints">{lesson.hints.slice(0, hintsShown).map((h) => <li key={h}>{h}</li>)}</ol>}
                {hintsShown < lesson.hints.length && (
                  <Button size="sm" disabled={hintsLocked} onClick={() => setHintsShown((n) => n + 1)}>
                    {hintsLocked ? <><Lock size={13} aria-hidden="true" /> Available after your first try</> : hintsShown === 0 ? 'Show a hint' : 'Show another hint'}
                  </Button>
                )}
                <p className="subtle small">Hints are always allowed. They're recorded, so mastery reflects what you did on your own.</p>
              </div>
            </div>
            <div className="activities">
              {practice.map((a, i) => renderActivity(a, i + 1 + (warmup ? 1 : 0), lesson.activities.length))}
            </div>
          </section>

          <section className="lesson-section" aria-labelledby="myths-h">
            <h2 id="myths-h">Common misconceptions</h2>
            <dl className="myths">
              {lesson.misconceptions.map((m) => (
                <div key={m.myth} className="myth">
                  <dt><span className="myth__label">Myth</span> {m.myth}</dt>
                  <dd><span className="myth__label myth__label--ok">Actually</span> {m.reality}</dd>
                </div>
              ))}
            </dl>
          </section>

          <LessonSummary lesson={lesson} />
        </div>

        <aside className="lesson-aside" aria-label="Lesson guide">
          <Panel as="div">
            <div className="aside-block">
              <h2 className="aside-h"><Target size={16} aria-hidden="true" /> Mastery requirement</h2>
              <p className="muted">{lesson.masteryRequirement}</p>
            </div>
            <div className="aside-block">
              <h2 className="aside-h">Progress this lesson</h2>
              <ul className="progress-dots" aria-label="Activity results">
                {result.activities.map((a, i) => (
                  <li key={a.activityId} data-outcome={a.outcome} title={`Activity ${i + 1}: ${a.outcome.replace('-', ' ')}`}>
                    <span className="visually-hidden">Activity {i + 1}: {a.outcome.replace('-', ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aside-block">
              <h2 className="aside-h"><CalendarClock size={16} aria-hidden="true" /> Review</h2>
              <p className="muted">When you finish, a new question on this idea comes back in 2 days, then 7, 21 and 60 days if you keep getting it right.</p>
            </div>
          </Panel>
        </aside>
      </div>
    </>
  );
}
