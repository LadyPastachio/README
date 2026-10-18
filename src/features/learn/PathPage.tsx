import { useParams } from 'react-router-dom';
import { Check, Compass } from 'lucide-react';
import { PageHeader, PathTag, Button } from '@/design/components';
import { PathArt } from '@/design/illustrations/PathArt';
import { getPath } from '@/content/paths';
import { LESSONS, pathLessons } from '@/content/lessons';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { lessonResult } from '@/core/learning/mastery';
import { useToast } from '@/app/Toast';
import { NotFoundPage } from '@/app/NotFoundPage';
import { LessonCard } from './LessonCard';
import { MilestoneTracker } from './MilestoneTracker';

export function PathPage() {
  const { pathId = '' } = useParams();
  const { events } = useLearning();
  const { settings, updateLearning } = useSettings();
  const toast = useToast();
  const path = getPath(pathId);
  if (!path) return <NotFoundPage />;
  const lessons = pathLessons(path.id);
  const results = new Map(LESSONS.map((l) => [l.id, lessonResult(events, l)]));
  const isMine = settings.learning.currentPath === path.id;

  return (
    <>
      <div className="path-hero">
        <PathArt path={path.id} className="path-hero__art" />
        <div className="path-hero__text">
          <PageHeader breadcrumbs={[{ label: 'Learn', to: '/learn' }, { label: path.name }]} title={path.name} description={path.pitch} />
          <PathTag path={path.id} />
          <p><strong>You'll build:</strong> {path.project}.</p>
          <p className="muted"><strong>AI feature:</strong> {path.aiFeature}</p>
          {isMine ? (
            <span className="chip chip--status" data-status="independent"><Check size={13} aria-hidden="true" /> Your current path</span>
          ) : (
            <Button variant="primary" onClick={() => { updateLearning({ currentPath: path.id }); toast(`${path.name} is now your path. Everything you've finished still counts.`); }}>
              <Compass size={16} aria-hidden="true" /> Make this my path
            </Button>
          )}
          <p className="subtle small">You can switch any time. Shared lessons and skills carry over; nothing is lost.</p>
        </div>
      </div>

      <section className="section" aria-labelledby="ms-h">
        <div className="section__head">
          <h2 id="ms-h">Milestones</h2>
          <p className="muted">Each ends with something that works. Estimates use your {settings.learning.weeklyHours} hours a week (change it in Settings) and allow time for practice and mistakes.</p>
        </div>
        <MilestoneTracker path={path} />
      </section>

      <section className="section" aria-labelledby="lessons-h">
        <div className="section__head"><h2 id="lessons-h">{path.name} lessons</h2><p className="muted">Specific to this path. Foundation lessons it builds on are listed in the milestones above.</p></div>
        <div className="lesson-grid">
          {lessons.map((l) => <LessonCard key={l.id} lesson={l} result={results.get(l.id)!} ready={l.prerequisites.every((p) => results.get(p)?.complete)} />)}
        </div>
      </section>

      <section className="section" aria-labelledby="timeline-h">
        <div className="section__head"><h2 id="timeline-h">The longer view</h2></div>
        <div className="timeline">
          <div><span className="eyebrow">Make it work</span><strong className="tabular">{path.timeline.early}</strong><span className="subtle">First working milestone</span></div>
          <div><span className="eyebrow">Build with understanding</span><strong className="tabular">{path.timeline.capable}</strong><span className="subtle">More capable development</span></div>
          <div><span className="eyebrow">Advanced exploration</span><strong className="tabular">{path.timeline.advanced}</strong><span className="subtle">Production-quality depth</span></div>
        </div>
        <p className="subtle footnote">Provisional ranges at about 5–7 hours a week. You move on when you've shown you can do something, not when time passes.</p>
      </section>
    </>
  );
}
