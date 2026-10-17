import type { Lesson } from '@/content/schema';
import type { LearningEvent } from './records';
import { lessonResult } from './mastery';
import { dueReviews, upcomingReviews } from './schedule';

export type Recommendation =
  | { kind: 'review'; lessonId: string; title: string; reason: string }
  | { kind: 'retry' | 'continue' | 'start'; lessonId: string; title: string; reason: string };

/**
 * Picks the day's activities, most valuable first:
 * due reviews → lessons that need another try → unfinished lessons → the
 * next lesson whose prerequisites are done. The daily load sets how many.
 */
export function recommend(events: LearningEvent[], lessons: Lesson[], dailyLoad: number, now = new Date()): Recommendation[] {
  const out: Recommendation[] = [];
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const results = new Map(lessons.map((l) => [l.id, lessonResult(events, l)]));

  for (const r of dueReviews(events, lessons, now)) {
    const lesson = byId.get(r.lessonId)!;
    out.push({
      kind: 'review',
      lessonId: r.lessonId,
      title: lesson.title,
      reason: r.lastMissed
        ? 'You missed this in your last review. A quick retry now helps it stick.'
        : `Due for review. Recalling it after a gap is what makes it last.`,
    });
  }
  for (const l of lessons) {
    const r = results.get(l.id)!;
    if (r.status === 'challenge') out.push({ kind: 'retry', lessonId: l.id, title: l.title, reason: 'One activity isn\'t solved yet, or you used the solution. Try it again on your own.' });
  }
  for (const l of lessons) {
    const r = results.get(l.id)!;
    if (r.status === 'supported' && !r.complete) out.push({ kind: 'continue', lessonId: l.id, title: l.title, reason: 'You started this. Finish the remaining activities.' });
  }
  for (const l of lessons) {
    const r = results.get(l.id)!;
    if (r.status !== 'none') continue;
    const ready = l.prerequisites.every((p) => results.get(p)?.complete);
    if (!ready) continue;
    const prereqNames = l.prerequisites.map((p) => byId.get(p)?.title).filter(Boolean);
    out.push({
      kind: 'start',
      lessonId: l.id,
      title: l.title,
      reason: prereqNames.length ? `Builds directly on “${prereqNames.join('”, “')}”, which you've finished.` : 'No prerequisites, and every path uses it.',
    });
  }
  return out.slice(0, Math.max(1, dailyLoad));
}

export function nextReviewDate(events: LearningEvent[], lessons: Lesson[], now = new Date()): Date | null {
  return upcomingReviews(events, lessons, now)[0]?.dueAt ?? null;
}
