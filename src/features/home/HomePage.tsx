import { Link } from 'react-router-dom';
import { ArrowRight, Clock, CalendarClock, SquareTerminal } from 'lucide-react';
import { PageHeader, Panel, ButtonLink, EmptyState, PathTag, Planned } from '@/design/components';
import { PATHS } from '@/content/paths';
import { howTheWebWorks as firstLesson } from '@/content/lessons/how-the-web-works';
import { PathGlyph } from '@/features/learn/PathGlyph';

export function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Home"
        title="What to work on next"
        description="One clear next step, the reviews that are due, and the project you're building. Nothing here counts streaks or minutes."
      />

      <div className="home-grid">
        <Panel className="next-up" title="Recommended next" as="section">
          <div className="next-up__body">
            <div className="next-up__meta">
              <span className="chip"><Clock size={13} aria-hidden="true" /> {firstLesson.minutes} min</span>
              <span className="chip">Shared by all four paths</span>
            </div>
            <h3 className="next-up__title">{firstLesson.title}</h3>
            <p className="muted">{firstLesson.objective}</p>
            <div className="why">
              <span className="eyebrow">Why this first</span>
              <p>
                It's the first skill every project depends on, and it has no prerequisites. You'll use it whenever a page,
                a saved transaction or an incoming lead travels between programs.
              </p>
            </div>
            <div>
              <ButtonLink to={`/learn/lesson/${firstLesson.id}`} variant="primary">
                Start lesson <ArrowRight size={16} aria-hidden="true" />
              </ButtonLink>
            </div>
          </div>
        </Panel>

        <Panel title="Reviews due" action={<CalendarClock size={18} className="subtle" aria-hidden="true" />}>
          <EmptyState title="Nothing to review yet">
            After you finish lessons, short retrieval questions are scheduled here at growing intervals, so what you learn
            stays learned.
          </EmptyState>
        </Panel>
      </div>

      <section className="section" aria-labelledby="choose-project">
        <div className="section__head">
          <h2 id="choose-project">Choose a first project</h2>
          <p className="muted">You can explore all four. Skills you master in one carry over to the others.</p>
        </div>
        <div className="path-grid">
          {PATHS.map((p) => (
            <Link key={p.id} to={`/learn/path/${p.id}`} className="path-card" data-path={p.id}>
              <PathGlyph path={p.id} />
              <div className="path-card__text">
                <PathTag path={p.id} />
                <h3>{p.name}</h3>
                <p>{p.project}</p>
              </div>
              <div className="path-card__foot">
                <span className="subtle">First milestone</span>
                <span className="tabular">{p.timeline.early}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="home-grid home-grid--even">
        <Panel title="Skills to reinforce">
          <EmptyState title="No evidence yet">
            This fills in from your answers and code, not from which lessons you've opened.
          </EmptyState>
        </Panel>
        <Panel title="Code Lab" action={<SquareTerminal size={18} className="subtle" aria-hidden="true" />}>
          <Planned phase={3}>A working editor with live preview, console and isolated execution for HTML, CSS and JavaScript.</Planned>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <ButtonLink to="/lab">See what's coming</ButtonLink>
          </div>
        </Panel>
      </div>
    </>
  );
}
