import type { Lesson } from '@/content/schema';
import { isGraded } from '@/content/schema';
import type { LearningEvent } from './records';

/**
 * Mastery rules. Pure functions: records in, statuses out.
 *
 * Per activity (using the most recent lesson visit that touched it):
 *   first-try  – first answer correct, no solution revealed
 *   retried    – got there after at least one wrong answer
 *   revealed   – the learner asked to see the solution
 *   failed     – attempted, never answered correctly
 *
 * Per lesson:
 *   none        – nothing attempted
 *   challenge   – any activity failed or revealed
 *   supported   – not finished yet, or finished using hints / more than one retry
 *   independent – finished with no hints, no solutions, at most one retry
 *
 * Per skill: combines its lessons; becomes "retained" when the latest spaced
 * review (at least 2 days after finishing) was answered correctly first time
 * with no hints. A failed review drops it to "challenge" until relearned.
 */

export type MasteryStatus = 'none' | 'supported' | 'challenge' | 'independent' | 'retained';
export type ActivityOutcome = 'unattempted' | 'first-try' | 'retried' | 'revealed' | 'failed';

export const RETENTION_MIN_DAYS = 2;
const DAY = 86_400_000;

export interface ActivityResult {
  activityId: string;
  outcome: ActivityOutcome;
  attempts: number;
  hintsUsed: boolean;
  lastAt?: string;
}

export interface LessonResult {
  lessonId: string;
  status: Exclude<MasteryStatus, 'retained'>;
  activities: ActivityResult[];
  /** All checked activities attempted (correctly, or with the solution shown). */
  complete: boolean;
  hintsUsed: boolean;
  /** Time of the last attempt that made the lesson complete. */
  completedAt?: string;
  startedAt?: string;
}

/** Most recent visit's attempts for one activity in lesson context. */
function latestSession(events: LearningEvent[], lessonId: string, activityId: string): LearningEvent[] {
  const mine = events.filter((e) => e.context === 'lesson' && e.lessonId === lessonId && e.activityId === activityId);
  if (mine.length === 0) return [];
  const lastSession = mine[mine.length - 1]!.sessionId;
  return mine.filter((e) => e.sessionId === lastSession);
}

export function activityResult(events: LearningEvent[], lessonId: string, activityId: string): ActivityResult {
  const s = latestSession(events, lessonId, activityId);
  const answers = s.filter((e) => e.type === 'answer');
  const base = { activityId, attempts: answers.length, hintsUsed: s.some((e) => e.hintsShown > 0), lastAt: s[s.length - 1]?.at };
  if (s.length === 0) return { ...base, outcome: 'unattempted' };
  if (s.some((e) => e.type === 'reveal')) return { ...base, outcome: 'revealed' };
  if (answers[0]?.correct) return { ...base, outcome: 'first-try' };
  if (answers.some((e) => e.correct)) return { ...base, outcome: 'retried' };
  return { ...base, outcome: 'failed' };
}

export function lessonResult(events: LearningEvent[], lesson: Lesson): LessonResult {
  const graded = lesson.activities.filter(isGraded);
  const activities = graded.map((a) => activityResult(events, lesson.id, a.id));
  const touched = events.filter((e) => e.context === 'lesson' && e.lessonId === lesson.id);
  const hintsUsed = activities.some((a) => a.hintsUsed);
  const complete = activities.every((a) => a.outcome !== 'unattempted' && a.outcome !== 'failed');
  const startedAt = touched[0]?.at;
  const completedAt = complete ? activities.map((a) => a.lastAt!).sort().at(-1) : undefined;

  let status: LessonResult['status'];
  if (activities.every((a) => a.outcome === 'unattempted')) status = 'none';
  else if (activities.some((a) => a.outcome === 'failed' || a.outcome === 'revealed')) status = 'challenge';
  else if (!complete) status = 'supported';
  else if (hintsUsed || activities.filter((a) => a.outcome === 'retried').length > 1) status = 'supported';
  else status = 'independent';

  return { lessonId: lesson.id, status, activities, complete, hintsUsed, completedAt, startedAt };
}

/* Reviews ---------------------------------------------------------------- */

export interface ReviewResult {
  lessonId: string;
  sessionId: string;
  at: string;
  passed: boolean;
}

/** One result per review session: passed = first answer correct, no hints, no reveal. */
export function reviewResults(events: LearningEvent[], lessonId: string): ReviewResult[] {
  const bySession = new Map<string, LearningEvent[]>();
  for (const e of events) {
    if (e.context !== 'review' || e.lessonId !== lessonId) continue;
    bySession.set(e.sessionId, [...(bySession.get(e.sessionId) ?? []), e]);
  }
  const out: ReviewResult[] = [];
  for (const [sessionId, list] of bySession) {
    const first = list.find((e) => e.type === 'answer');
    const revealedFirst = list[0]?.type === 'reveal';
    if (!first && !revealedFirst) continue;
    out.push({
      lessonId,
      sessionId,
      at: list[0]!.at,
      passed: !revealedFirst && !!first?.correct && first.hintsShown === 0,
    });
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

/* Skills ----------------------------------------------------------------- */

export interface SkillResult {
  skillId: string;
  status: MasteryStatus;
  lessons: LessonResult[];
  /** Plain-language reason for the status, shown to the learner. */
  reason: string;
}

export function skillResult(events: LearningEvent[], skillId: string, lessons: Lesson[]): SkillResult {
  const mine = lessons.filter((l) => l.skill === skillId);
  const results = mine.map((l) => lessonResult(events, l));
  const started = results.filter((r) => r.status !== 'none');

  if (mine.length === 0) return { skillId, status: 'none', lessons: [], reason: 'No lessons for this skill yet.' };
  if (started.length === 0) return { skillId, status: 'none', lessons: results, reason: 'Not started yet.' };

  // A review taken after the lesson was last finished can confirm or overturn it.
  const latestReviewAfterCompletion = (r: LessonResult) =>
    reviewResults(events, r.lessonId).filter((rv) => r.completedAt && rv.at > r.completedAt).at(-1);

  const failedReview = results.find((r) => latestReviewAfterCompletion(r)?.passed === false);
  if (failedReview) {
    return { skillId, status: 'challenge', lessons: results, reason: 'A spaced review was missed. One more practice round will make it stick.' };
  }
  if (started.some((r) => r.status === 'challenge')) {
    return { skillId, status: 'challenge', lessons: results, reason: 'An activity was not solved yet, or the solution was shown.' };
  }
  if (results.every((r) => r.status === 'independent')) {
    const retained = results.every((r) => {
      const rv = latestReviewAfterCompletion(r);
      return rv?.passed && Date.parse(rv.at) - Date.parse(r.completedAt!) >= RETENTION_MIN_DAYS * DAY;
    });
    return retained
      ? { skillId, status: 'retained', lessons: results, reason: 'Recalled correctly in a spaced review, days after learning it.' }
      : { skillId, status: 'independent', lessons: results, reason: 'Completed without hints or solutions. A spaced review will confirm it lasts.' };
  }
  const unfinished = results.some((r) => !r.complete);
  return {
    skillId,
    status: 'supported',
    lessons: results,
    reason: unfinished ? 'In progress: some activities or lessons are not finished yet.' : 'Completed, with hints or several retries.',
  };
}
