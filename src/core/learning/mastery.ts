import type { Lesson } from '@/content/schema';
import { isGraded } from '@/content/schema';
import type { LabExercise } from '@/content/lab/schema';
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

/* Code Lab ---------------------------------------------------------------- */

export interface LabResult {
  exerciseId: string;
  status: 'none' | 'supported' | 'challenge' | 'independent';
  passed: boolean;
  checkRuns: number;
  hintsUsed: boolean;
  solutionShown: boolean;
  passedAt?: string;
}

/**
 * Lab exercises are judged differently from quiz questions: running the
 * checks several times while you work is normal in programming, so failed
 * runs don't count against you. What matters is whether you got all checks
 * passing, and whether you needed hints or the solution to get there.
 * Uses the most recent visit, so redoing an exercise on your own counts.
 */
export function labResult(events: LearningEvent[], exerciseId: string): LabResult {
  const mine = events.filter((e) => e.context === 'lab' && e.lessonId === exerciseId);
  const base = { exerciseId, passed: false, checkRuns: 0, hintsUsed: false, solutionShown: false };
  if (mine.length === 0) return { ...base, status: 'none' };
  const session = mine[mine.length - 1]!.sessionId;
  const s = mine.filter((e) => e.sessionId === session);
  const passIndex = s.findIndex((e) => e.type === 'answer' && e.correct === true);
  const upToPass = passIndex === -1 ? s : s.slice(0, passIndex + 1);
  const solutionShown = upToPass.some((e) => e.type === 'reveal');
  const hintsUsed = upToPass.some((e) => e.hintsShown > 0);
  const passed = passIndex !== -1;
  const checkRuns = s.filter((e) => e.type === 'answer').length;
  const status = solutionShown ? 'challenge' : !passed ? 'supported' : hintsUsed ? 'supported' : 'independent';
  return { exerciseId, status, passed, checkRuns, hintsUsed, solutionShown, passedAt: passed ? s[passIndex]!.at : undefined };
}

/* Skills ----------------------------------------------------------------- */

export interface SkillResult {
  skillId: string;
  status: MasteryStatus;
  lessons: LessonResult[];
  labs: LabResult[];
  /** Plain-language reason for the status, shown to the learner. */
  reason: string;
}

export function skillResult(events: LearningEvent[], skillId: string, lessons: Lesson[], labs: LabExercise[] = []): SkillResult {
  const mine = lessons.filter((l) => l.skill === skillId);
  const myLabs = labs.filter((x) => x.skill === skillId);
  const results = mine.map((l) => lessonResult(events, l));
  const labResults = myLabs.map((x) => labResult(events, x.id));
  const started = results.filter((r) => r.status !== 'none');
  const labsStarted = labResults.filter((r) => r.status !== 'none');
  const out = (status: MasteryStatus, reason: string): SkillResult => ({ skillId, status, lessons: results, labs: labResults, reason });

  if (mine.length === 0 && myLabs.length === 0) return out('none', 'No lessons or exercises for this skill yet.');
  if (started.length === 0 && labsStarted.length === 0) return out('none', 'Not started yet.');

  // A review taken after the lesson was last finished can confirm or overturn it.
  const latestReviewAfterCompletion = (r: LessonResult) =>
    reviewResults(events, r.lessonId).filter((rv) => r.completedAt && rv.at > r.completedAt).at(-1);

  if (results.some((r) => latestReviewAfterCompletion(r)?.passed === false)) {
    return out('challenge', 'A spaced review was missed. One more practice round will make it stick.');
  }
  if (started.some((r) => r.status === 'challenge')) return out('challenge', 'An activity was not solved yet, or the solution was shown.');
  if (labsStarted.some((r) => r.status === 'challenge')) return out('challenge', 'The solution was used in a Code Lab exercise. Try it again on your own.');

  const allIndependent = results.every((r) => r.status === 'independent') && labResults.every((r) => r.status === 'independent');
  if (allIndependent) {
    // Retention is confirmed by spaced reviews, which lessons have. A skill taught only through lab exercises tops out at independent.
    const retained = results.length > 0 && results.every((r) => {
      const rv = latestReviewAfterCompletion(r);
      return rv?.passed && Date.parse(rv.at) - Date.parse(r.completedAt!) >= RETENTION_MIN_DAYS * DAY;
    });
    return retained
      ? out('retained', 'Recalled correctly in a spaced review, days after learning it.')
      : out('independent', results.length ? 'Completed without hints or solutions. A spaced review will confirm it lasts.' : 'Built and passed on your own, without hints or the solution.');
  }
  const unfinished = results.some((r) => !r.complete) || labResults.some((r) => !r.passed);
  return out('supported', unfinished ? 'In progress: some lessons or exercises are not finished yet.' : 'Completed, with hints or several retries.');
}
