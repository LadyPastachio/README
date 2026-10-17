import { Link } from 'react-router-dom';
import { PageHeader, Panel, PathTag, Planned } from '@/design/components';
import { PATHS } from '@/content/paths';
import { PathArt } from '@/design/illustrations/PathArt';

const KINDS = [
  { name: 'Exercise', text: 'A small, guided task inside a lesson. It checks one idea.' },
  { name: 'Experiment', text: 'Code you change freely to see what happens. It doesn\'t need to be finished.' },
  { name: 'Project', text: 'Working software with requirements, acceptance criteria, tests and known issues.' },
];

export function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Your four projects"
        description="Each project collects its milestones, requirements, code, review notes and evidence of what you learned building it."
      />

      <div className="kinds" role="list" aria-label="Kinds of work">
        {KINDS.map((k) => (
          <div key={k.name} className="kind" role="listitem">
            <strong>{k.name}</strong>
            <span className="muted">{k.text}</span>
          </div>
        ))}
      </div>

      <div className="project-grid">
        {PATHS.map((p) => (
          <Panel key={p.id} as="article" className="project-card">
            <PathArt path={p.id} className="project-card__art" />
            <div className="project-card__head">
              <div>
                <h2 className="panel__title">{p.name}</h2>
                <PathTag path={p.id} />
              </div>
              <span className="chip project-card__status">Not started</span>
            </div>
            <p className="muted">{p.project}.</p>
            <div className="project-card__next">
              <span className="eyebrow">First milestone</span>
              <strong>{p.milestones[0]?.title}</strong>
              <span className="subtle">{p.milestones[0]?.deliverable} · {p.milestones[0]?.estimate}</span>
            </div>
            <Link to={`/learn/path/${p.id}`} className="link-quiet">View all {p.milestones.length} milestones →</Link>
          </Panel>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <Planned phase={4}>
          Project workspaces with acceptance criteria, files, known issues, code review findings, learning evidence and optional sharing.
        </Planned>
      </div>
    </>
  );
}
