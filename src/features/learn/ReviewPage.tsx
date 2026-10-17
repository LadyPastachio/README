import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { PageHeader, Button, ButtonLink, EmptyState, ActivityBadge, activityType } from '@/design/components';
import { LessonArt } from '@/design/illustrations/LessonArt';
import { LESSONS, getLesson } from '@/content/lessons';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { dueReviews, nextReviewActivity, upcomingReviews } from '@/core/learning/schedule';
import { newId } from '@/core/learning/records';
import { OrderTask, ChoiceTask, FillTask } from './Activities';

/**
 * Spaced review: one new question per due lesson. Only the first answer
 * counts toward retention, and no hints are offered, because the point is
 * to check what you can recall on your own.
 */
export function ReviewPage() {
  const { events } = useLearning();
  const { settings } = useSettings();
  // Freeze the queue when the page opens, so answering doesn't reshuffle it mid-session.
  const [queue] = useState(() => dueReviews(events, LESSONS));
  const [index, setIndex] = useState(0);
  const sessionIds = useMemo(() => queue.map(() => newId('r')), [queue]);
  const current = queue[index];
  const answeredThis = current ? events.some((e) => e.sessionId === sessionIds[index]) : false;

  if (queue.length === 0) {
    const next = upcomingReviews(events, LESSONS)[0];
    return (
      <>
        <PageHeader eyebrow="Review" title="Nothing due right now" description="Reviews come back after a gap: 2 days, then 7, 21 and 60 if you keep remembering. The gap is what makes memory stronger." />
        {next ? (
          <EmptyState title={`Next review: ${next.dueAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`} action={<ButtonLink to="/">Back to Home</ButtonLink>}>
            {getLesson(next.lessonId)?.title}
          </EmptyState>
        ) : (
          <EmptyState title="No reviews scheduled yet" action={<ButtonLink to="/learn" variant="primary">Find a lesson</ButtonLink>}>
            Finish a lesson and its first review is scheduled automatically.
          </EmptyState>
        )}
      </>
    );
  }

  if (!current) {
    return (
      <>
        <PageHeader eyebrow="Review" title="Review finished" />
        <EmptyState title="Nice work" action={<ButtonLink to="/" variant="primary">Back to Home</ButtonLink>}>
          Each answer moved its next review further out (if you got it) or brought it back tomorrow (if you didn't). Check My Progress to see how your skills changed.
        </EmptyState>
      </>
    );
  }

  const lesson = getLesson(current.lessonId)!;
  const activity = nextReviewActivity(lesson, current.reviewsDone);
  const ctx = { lessonId: lesson.id, context: 'review' as const, sessionId: sessionIds[index]!, hintsShown: 0, lessonOrder: null };

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Review' }]}
        title="Review"
        description="Answer from memory. Your first answer is the one that counts."
        actions={<span className="chip tabular">{index + 1} of {queue.length}</span>}
      />
      <div className="review-progress" aria-hidden="true">
        {queue.map((q, i) => <span key={q.lessonId} data-state={i < index ? 'done' : i === index ? 'current' : 'todo'} />)}
      </div>
      <article className="review-card" key={sessionIds[index]}>
        <header className="review-card__head">
          <LessonArt lessonId={lesson.id} className="review-card__art" />
          <div>
            <span className="eyebrow">From the lesson</span>
            <Link to={`/learn/lesson/${lesson.id}`} className="review-card__lesson">{lesson.title}</Link>
            <div><ActivityBadge type={activityType(activity)} /></div>
          </div>
        </header>
        {activity.kind === 'order' && <OrderTask activity={activity} ctx={ctx} />}
        {activity.kind === 'choice' && <ChoiceTask activity={activity} ctx={ctx} />}
        {activity.kind === 'fill' && <FillTask activity={activity} ctx={ctx} />}
        <div className="review-card__foot">
          {settings.learning.solutionReveal === 'never' && <span className="subtle small">Solutions are turned off in Settings.</span>}
          <Button variant={answeredThis ? 'primary' : 'ghost'} onClick={() => setIndex((i) => i + 1)} disabled={!answeredThis}>
            {index + 1 < queue.length ? 'Next question' : 'Finish'} <ArrowRight size={16} aria-hidden="true" />
          </Button>
        </div>
      </article>
      <p className="subtle small review-note"><CalendarCheck size={14} aria-hidden="true" /> Review answers update your mastery: a correct first answer two or more days after learning marks the skill “Retained over time”.</p>
    </>
  );
}
