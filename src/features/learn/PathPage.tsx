import { Link, useParams } from 'react-router-dom';
import { PageHeader, Panel, PathTag, Planned, ButtonLink } from '@/design/components';
import { getPath } from '@/content/paths';
import { getSkill } from '@/content/skills';
import { howTheWebWorks } from '@/content/lessons/how-the-web-works';
import { NotFoundPage } from '@/app/NotFoundPage';
import { PathGlyph } from './PathGlyph';

export function PathPage() {
  const { pathId = '' } = useParams();
  const path = getPath(pathId);
  if (!path) return <NotFoundPage />;

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Learn', to: '/learn' }, { label: path.name }]}
        title={path.name}
        description={path.pitch}
      />

      <div className="path-hero" data-path={path.id}>
        <PathGlyph path={path.id} size={56} />
        <div className="path-hero__text">
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
        <p className="subtle footnote">At about 5–7 hours a week. You move on when you've demonstrated a skill, not when time passes.</p>
      </section>

      <div className="home-grid">
        <Panel title="Milestones">
          <ol className="steps">
            {path.milestones.map((m) => (
              <li key={m.id}>
                <span className="steps__marker" aria-hidden="true" />
                <div className="milestone">
                  <div className="milestone__head"><h3>{m.title}</h3><span className="chip tabular">{m.estimate}</span></div>
                  <p className="muted">{m.deliverable}</p>
                  <ul className="skill-chips">
                    {m.skills.map((id) => (
                      <li key={id}><Link className="chip chip--link" to={`/progress#skill-${id}`}>{getSkill(id)?.name ?? id}</Link></li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Where to begin">
          <div className="stack">
            <p className="muted">Every path starts with the same first lesson. Path-specific lessons come right after it.</p>
            <ButtonLink to={`/learn/lesson/${howTheWebWorks.id}`} variant="primary">Start: {howTheWebWorks.title}</ButtonLink>
            <Planned phase={4}>Path-specific lessons, milestone tracking and switching paths without repeating mastered skills.</Planned>
          </div>
        </Panel>
      </div>
    </>
  );
}
