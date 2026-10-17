import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Lightbulb, Target, CalendarClock } from 'lucide-react';
import { PageHeader, Panel, PathTag, Button, Notice, Planned } from '@/design/components';
import { getLesson } from '@/content/lessons/how-the-web-works';
import { getSkill } from '@/content/skills';
import type { Activity } from '@/content/types';
import { NotFoundPage } from '@/app/NotFoundPage';
import { OrderTask, ChoiceTask, ExplainTask } from './Activities';
import { RequestDiagram } from './RequestDiagram';

const ACTIVITY_LABEL: Record<Activity['kind'], string> = {
  order: 'Put it in order',
  choice: 'Interpret a clue',
  explain: 'Explain it in your own words',
};

export function LessonPage() {
  const { lessonId = '' } = useParams();
  const lesson = getLesson(lessonId);
  const [hintsShown, setHintsShown] = useState(0);
  if (!lesson) return <NotFoundPage />;
  const skill = getSkill(lesson.skill);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Learn', to: '/learn' }, { label: lesson.title }]}
        title={lesson.title}
      />
      <div className="lesson-meta">
        <span className="chip"><Clock size={13} aria-hidden="true" /> About {lesson.minutes} min</span>
        {skill && <span className="chip">Skill: {skill.name}</span>}
        {lesson.paths.map((p) => <PathTag key={p} path={p} />)}
      </div>

      <Notice kind="info">
        <strong>Sample lesson.</strong> Activities work, but your answers aren't saved yet. Saved progress and mastery tracking arrive in Phase 2.
      </Notice>

      <div className="lesson-layout">
        <article className="lesson-main">
          <section className="why-callout" aria-labelledby="why-h">
            <h2 id="why-h" className="eyebrow">Why this matters for your projects</h2>
            <p>{lesson.whyItMatters}</p>
          </section>

          {lesson.sections.map((s, i) => (
            <section key={s.heading} className="lesson-section">
              <h2>{s.heading}</h2>
              <div className="prose">{s.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}</div>
              {i === 0 && <RequestDiagram />}
            </section>
          ))}

          <section className="lesson-section" aria-labelledby="practice-h">
            <h2 id="practice-h">Practice</h2>
            <div className="activities">
              {lesson.activities.map((a, i) => (
                <Panel key={a.id} as="div" className="activity-card">
                  <span className="eyebrow">Activity {i + 1} of {lesson.activities.length} · {ACTIVITY_LABEL[a.kind]}</span>
                  {a.kind === 'order' && <OrderTask activity={a} />}
                  {a.kind === 'choice' && <ChoiceTask activity={a} />}
                  {a.kind === 'explain' && <ExplainTask activity={a} />}
                </Panel>
              ))}
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
        </article>

        <aside className="lesson-aside" aria-label="Lesson guide">
          <Panel as="div">
            <div className="aside-block">
              <h2 className="aside-h"><Target size={16} aria-hidden="true" /> Objective</h2>
              <p className="muted">{lesson.objective}</p>
            </div>
            <div className="aside-block">
              <h2 className="aside-h"><Lightbulb size={16} aria-hidden="true" /> Hints</h2>
              {hintsShown === 0 && <p className="subtle">Try first. Hints appear one at a time, and Phase 2 will record how many you used.</p>}
              <ol className="hints">
                {lesson.hints.slice(0, hintsShown).map((h) => <li key={h}>{h}</li>)}
              </ol>
              {hintsShown < lesson.hints.length && (
                <Button size="sm" onClick={() => setHintsShown((n) => n + 1)}>
                  {hintsShown === 0 ? 'Show a hint' : 'Show another hint'} ({hintsShown}/{lesson.hints.length})
                </Button>
              )}
            </div>
            <div className="aside-block">
              <h2 className="aside-h">Mastery requirement</h2>
              <p className="muted">{lesson.masteryRequirement}</p>
            </div>
            <div className="aside-block">
              <h2 className="aside-h"><CalendarClock size={16} aria-hidden="true" /> Review</h2>
              <p className="muted">{lesson.reviewPlan}</p>
            </div>
          </Panel>
          <Planned phase={5}>
            Controls like “Show me a diagram”, “Explain it more simply” and “Give me another example” that adapt the lesson to you.
          </Planned>
        </aside>
      </div>
    </>
  );
}
