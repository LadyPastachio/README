import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Map as MapIcon } from 'lucide-react';
import { PageHeader, PathTag, ButtonLink } from '@/design/components';
import { PathArt } from '@/design/illustrations/PathArt';
import { PATHS } from '@/content/paths';
import { LESSONS, FOUNDATION_LESSONS, pathLessons } from '@/content/lessons';
import { useSettings } from '@/core/settings/SettingsContext';
import { SKILLS, AREA_NAMES } from '@/content/skills';
import { useLearning } from '@/core/learning/LearningContext';
import { lessonResult } from '@/core/learning/mastery';
import { LessonCard } from './LessonCard';

export function LearnPage() {
  const { events } = useLearning();
  const results = new Map(LESSONS.map((l) => [l.id, lessonResult(events, l)]));
  const done = FOUNDATION_LESSONS.filter((l) => results.get(l.id)!.complete).length;
  const { settings } = useSettings();
  const current = settings.learning.currentPath;
  const pathsOrdered = [...PATHS].sort((a, b) => (a.id === current ? -1 : b.id === current ? 1 : 0));
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
            <p className="muted">Shared by every path. <span className="tabular">{done} of {FOUNDATION_LESSONS.length}</span> finished.</p>
          </div>
          <Link to="/progress" className="link-quiet"><MapIcon size={15} aria-hidden="true" /> Skill map</Link>
        </div>
        <div className="lesson-grid">
          {FOUNDATION_LESSONS.map((l) => (
            <LessonCard key={l.id} lesson={l} result={results.get(l.id)!} ready={l.prerequisites.every((p) => results.get(p)?.complete)} />
          ))}
        </div>
      </section>

      {pathsOrdered.map((p) => (
        <section key={p.id} className="section" aria-labelledby={`pl-${p.id}`}>
          <div className="section__head section__head--row">
            <div>
              <h2 id={`pl-${p.id}`}>{p.name} lessons {p.id === current && <span className="chip chip--status" data-status="independent"><span className="chip__dot" aria-hidden="true" />Your path</span>}</h2>
              <p className="muted">{p.pitch}</p>
            </div>
            <Link to={`/learn/path/${p.id}`} className="link-quiet">Milestones <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="lesson-grid">
            {pathLessons(p.id).map((l) => (
              <LessonCard key={l.id} lesson={l} result={results.get(l.id)!} ready={l.prerequisites.every((x) => results.get(x)?.complete)} />
            ))}
          </div>
        </section>
      ))}

      <section className="section" aria-labelledby="paths-h">
        <div className="section__head"><h2 id="paths-h">Project paths</h2><p className="muted">Choose one to focus on. Foundations and skills carry over if you switch.</p></div>
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
