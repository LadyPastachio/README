import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Map as MapIcon } from 'lucide-react';
import { PageHeader, PathTag, ButtonLink } from '@/design/components';
import { PathArt } from '@/design/illustrations/PathArt';
import { PATHS } from '@/content/paths';
import { LESSONS } from '@/content/lessons';
import { SKILLS, AREA_NAMES } from '@/content/skills';
import { useLearning } from '@/core/learning/LearningContext';
import { lessonResult } from '@/core/learning/mastery';
import { LessonCard } from './LessonCard';

export function LearnPage() {
  const { events } = useLearning();
  const results = new Map(LESSONS.map((l) => [l.id, lessonResult(events, l)]));
  const done = [...results.values()].filter((r) => r.complete).length;
  const shared = SKILLS.filter((s) => s.paths.length === 4);

  return (
    <>
      <PageHeader
        eyebrow="Learn"
        title="Paths, skills and lessons"
        description="Four projects built on one shared set of skills. Pick any path; switching later keeps everything you've demonstrated."
        actions={<ButtonLink to="/learn/glossary"><BookOpen size={16} aria-hidden="true" /> Glossary</ButtonLink>}
      />

      <section className="section section--first" aria-labelledby="found-h">
        <div className="section__head section__head--row">
          <div>
            <h2 id="found-h">Foundations</h2>
            <p className="muted">Shared by every path. <span className="tabular">{done} of {LESSONS.length}</span> finished.</p>
          </div>
          <Link to="/progress" className="link-quiet"><MapIcon size={15} aria-hidden="true" /> Skill map</Link>
        </div>
        <div className="lesson-grid">
          {LESSONS.map((l) => (
            <LessonCard key={l.id} lesson={l} result={results.get(l.id)!} ready={l.prerequisites.every((p) => results.get(p)?.complete)} />
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="paths-h">
        <div className="section__head"><h2 id="paths-h">Project paths</h2><p className="muted">Path-specific lessons arrive in Phase 4. The foundations above are where every path starts.</p></div>
        <div className="path-showcase">
          {PATHS.map((p) => (
            <Link key={p.id} to={`/learn/path/${p.id}`} className="showcase-card">
              <PathArt path={p.id} className="showcase-card__art" />
              <div className="showcase-card__body">
                <div className="showcase-card__title"><h3>{p.name}</h3><PathTag path={p.id} /></div>
                <p className="muted">{p.pitch}</p>
                <dl className="showcase-card__times">
                  <div><dt>First milestone</dt><dd>{p.timeline.early}</dd></div>
                  <div><dt>Capable</dt><dd>{p.timeline.capable}</dd></div>
                </dl>
              </div>
              <ArrowRight size={18} className="showcase-card__arrow" aria-hidden="true" />
            </Link>
          ))}
        </div>
        <p className="subtle footnote">Time ranges assume about 5–7 hours a week. They're provisional estimates, not deadlines.</p>
      </section>

      <section className="section" aria-labelledby="skills-h">
        <div className="section__head"><h2 id="skills-h">Skills every path shares</h2><p className="muted">{SKILLS.length} skills across {Object.keys(AREA_NAMES).length} areas.</p></div>
        <ul className="skill-chips">
          {shared.map((s) => <li key={s.id}><Link to={`/progress#skill-${s.id}`} className="chip chip--link">{s.name}</Link></li>)}
        </ul>
      </section>
    </>
  );
}
