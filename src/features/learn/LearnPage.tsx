import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Map } from 'lucide-react';
import { PageHeader, Panel, PathTag, Planned, ButtonLink } from '@/design/components';
import { PATHS } from '@/content/paths';
import { LESSONS } from '@/content/lessons/how-the-web-works';
import { SKILLS, AREA_NAMES } from '@/content/skills';
import { PathGlyph } from './PathGlyph';

export function LearnPage() {
  const shared = SKILLS.filter((s) => s.paths.length === 4);
  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Paths, skills and lessons"
        description="Four projects built on one shared set of skills. Pick any path; switching later keeps everything you've demonstrated."
        actions={<ButtonLink to="/learn/glossary"><BookOpen size={16} aria-hidden="true" /> Glossary</ButtonLink>}
      />

      <section className="section" aria-labelledby="paths-h">
        <div className="section__head"><h2 id="paths-h">Project paths</h2></div>
        <div className="path-list">
          {PATHS.map((p) => (
            <Link key={p.id} to={`/learn/path/${p.id}`} className="path-row">
              <PathGlyph path={p.id} size={44} />
              <div className="path-row__main">
                <div className="path-row__title"><h3>{p.name}</h3><PathTag path={p.id} /></div>
                <p className="muted">{p.pitch}</p>
              </div>
              <dl className="path-row__times">
                <div><dt>Early milestone</dt><dd>{p.timeline.early}</dd></div>
                <div><dt>Capable</dt><dd>{p.timeline.capable}</dd></div>
              </dl>
              <ArrowRight size={18} className="path-row__arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="subtle footnote">Time ranges assume about 5–7 hours a week. They are provisional estimates, not deadlines, and will be refined as each path's lessons are written.</p>
      </section>

      <div className="home-grid home-grid--even">
        <Panel title="Start with the shared foundations">
          <ul className="lesson-list">
            {LESSONS.map((l) => (
              <li key={l.id}>
                <Link to={`/learn/lesson/${l.id}`} className="lesson-link">
                  <span>
                    <strong>{l.title}</strong>
                    <span className="subtle">{l.minutes} min · {AREA_NAMES.foundations}</span>
                  </span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Planned phase={2}>More foundation lessons, saved progress and mastery checks. This is the first complete sample lesson.</Planned>
          </div>
        </Panel>

        <Panel title="Skills every path shares" action={<Link to="/progress" className="link-quiet"><Map size={15} aria-hidden="true" /> Full map</Link>}>
          <ul className="skill-chips">
            {shared.map((s) => (
              <li key={s.id}><Link to={`/progress#skill-${s.id}`} className="chip chip--link">{s.name}</Link></li>
            ))}
          </ul>
          <p className="subtle footnote">{SKILLS.length} skills in the framework so far, across {Object.keys(AREA_NAMES).length} areas.</p>
        </Panel>
      </div>
    </>
  );
}
