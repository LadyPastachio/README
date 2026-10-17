import { Link, useParams } from 'react-router-dom';
import { PageHeader, Panel, PathTag, Planned } from '@/design/components';
import { PathArt } from '@/design/illustrations/PathArt';
import { getPath } from '@/content/paths';
import { getSkill } from '@/content/skills';
import { LESSONS } from '@/content/lessons';
import { useLearning } from '@/core/learning/LearningContext';
import { lessonResult, skillResult } from '@/core/learning/mastery';
import { NotFoundPage } from '@/app/NotFoundPage';
import { LessonCard } from './LessonCard';

export function PathPage() {
  const { pathId = '' } = useParams();
  const { events } = useLearning();
  const path = getPath(pathId);
  if (!path) return <NotFoundPage />;
  const lessons = LESSONS.filter((l) => l.paths.includes(path.id));
  const results = new Map(LESSONS.map((l) => [l.id, lessonResult(events, l)]));

  return (
    <>
      <div className="path-hero">
        <PathArt path={path.id} className="path-hero__art" />
        <div className="path-hero__text">
          <PageHeader breadcrumbs={[{ label: 'Learn', to: '/learn' }, { label: path.name }]} title={path.name} description={path.pitch} />
          <PathTag path={path.id} />
          <p><strong>You'll build:</strong> {path.project}.</p>
          <p className="muted"><strong>AI feature:</strong> {path.aiFeature}</p>
        </div>
      </div>

      <section className="section" aria-labelledby="timeline-h">
        <div className="section__head"><h2 id="timeline-h">Realistic timeline</h2></div>
        <div className="timeline">
          <div><span className="eyebrow">Make it work</span><strong className="tabular">{path.timeline.early}</strong><span className="subtle">First working milestone</span></div>
          <div><span className="eyebrow">Build with understanding</span><strong className="tabular">{path.timeline.capable}</strong><span className="subtle">More capable development</span></div>
          <div><span className="eyebrow">Advanced exploration</span><strong className="tabular">{path.timeline.advanced}</strong><span className="subtle">Production-quality depth</span></div>
        </div>
        <p className="subtle footnote">At about 5–7 hours a week. You move on when you've shown you can do something, not when time passes.</p>
      </section>

      <section className="section" aria-labelledby="lessons-h">
        <div className="section__head"><h2 id="lessons-h">Foundation lessons for this path</h2><p className="muted">{lessons.length} lessons. Anything you finish here also counts toward the other paths.</p></div>
        <div className="lesson-grid">
          {lessons.map((l) => <LessonCard key={l.id} lesson={l} result={results.get(l.id)!} ready={l.prerequisites.every((p) => results.get(p)?.complete)} />)}
        </div>
      </section>

      <section className="section">
        <Panel title="Milestones">
          <ol className="steps">
            {path.milestones.map((m) => (
              <li key={m.id}>
                <span className="steps__marker" aria-hidden="true" />
                <div className="milestone">
                  <div className="milestone__head"><h3>{m.title}</h3><span className="chip tabular">{m.estimate}</span></div>
                  <p className="muted">{m.deliverable}</p>
                  <ul className="skill-chips">
                    {m.skills.map((id) => {
                      const st = skillResult(events, id, LESSONS).status;
                      return (
                        <li key={id}>
                          <Link className="chip chip--link chip--status" data-status={st} to={`/progress#skill-${id}`} title={st === 'none' ? 'Not introduced' : undefined}>
                            <span className="chip__dot" aria-hidden="true" />
                            {getSkill(id)?.name ?? id}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
          <Planned phase={4}>Path-specific lessons, milestone tracking and project workspaces.</Planned>
        </Panel>
      </section>
    </>
  );
}
