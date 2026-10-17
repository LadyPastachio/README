import { Link } from 'react-router-dom';
import { Clock, CheckCircle2 } from 'lucide-react';
import type { Lesson } from '@/content/schema';
import { getLesson } from '@/content/lessons';
import { getSkill } from '@/content/skills';
import { LessonArt } from '@/design/illustrations/LessonArt';
import { MasteryPill } from '@/design/components';
import type { LessonResult } from '@/core/learning/mastery';

/** A lesson tile: concept picture, title, time, status, and what it builds on. */
export function LessonCard({ lesson, result, ready }: { lesson: Lesson; result: LessonResult; ready: boolean }) {
  const prereq = lesson.prerequisites.map((p) => getLesson(p)?.title).filter(Boolean);
  return (
    <Link to={`/learn/lesson/${lesson.id}`} className="lesson-card" data-status={result.status}>
      <LessonArt lessonId={lesson.id} className="lesson-card__art" />
      <div className="lesson-card__body">
        <span className="lesson-card__skill">{getSkill(lesson.skill)?.name}</span>
        <h3>{lesson.title}</h3>
        <div className="lesson-card__meta">
          <span className="subtle"><Clock size={12} aria-hidden="true" /> {lesson.minutes} min</span>
          {result.status !== 'none' ? (
            <MasteryPill status={result.status} />
          ) : !ready && prereq.length ? (
            <span className="subtle lesson-card__after">After: {prereq.join(', ')}</span>
          ) : null}
          {result.complete && <CheckCircle2 size={15} className="lesson-card__done" aria-label="Complete" />}
        </div>
      </div>
    </Link>
  );
}
