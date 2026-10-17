import type { Lesson } from '@/content/schema';
import type { LearningEvent } from './records';
import { lessonResult, reviewResults } from './mastery';

/**
 * Spaced review. After a lesson is finished, a short review comes due after
 * 2 days, then 7, 21 and 60 days as long as each review is passed. A missed
 * review comes back the next day and the spacing starts again.
 */

export const INTERVAL_DAYS = [2, 7, 21, 60] as const;
export const RETRY_DAYS = 1;
const DAY = 86_400_000;

export interface ReviewPlan {
  lessonId: string;
  dueAt: Date;
  /** How many reviews have been done for this lesson. Picks the next question. */
  reviewsDone: number;
  /** Consecutive passes since the last miss. */
  streak: number;
  lastMissed: boolean;
}

export function reviewPlan(events: LearningEvent[], lesson: Lesson): ReviewPlan | null {
  const result = lessonResult(events, lesson);
  if (!result.complete || !result.completedAt) return null;
  const reviews = reviewResults(events, lesson.id).filter((r) => r.at > result.completedAt!);
  let streak = 0;
  let lastMissed = false;
  for (const r of reviews) {
    if (r.passed) { streak = Math.min(streak + 1, INTERVAL_DAYS.length - 1); lastMissed = false; }
    else { streak = 0; lastMissed = true; }
  }
  const base = Date.parse(reviews.at(-1)?.at ?? result.completedAt);
  const days = lastMissed ? RETRY_DAYS : INTERVAL_DAYS[streak]!;
  return { lessonId: lesson.id, dueAt: new Date(base + days * DAY), reviewsDone: reviews.length, streak, lastMissed };
}

export function dueReviews(events: LearningEvent[], lessons: Lesson[], now = new Date()): ReviewPlan[] {
  return lessons
    .map((l) => reviewPlan(events, l))
    .filter((p): p is ReviewPlan => p !== null && p.dueAt <= now)
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

export function upcomingReviews(events: LearningEvent[], lessons: Lesson[], now = new Date()): ReviewPlan[] {
  return lessons
    .map((l) => reviewPlan(events, l))
    .filter((p): p is ReviewPlan => p !== null && p.dueAt > now)
    .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}

/** The review question to ask next: rotates through the lesson's review set. */
export function nextReviewActivity(lesson: Lesson, reviewsDone: number) {
  return lesson.review[reviewsDone % lesson.review.length]!;
}
