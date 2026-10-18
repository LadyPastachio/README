import type { Lesson } from '@/content/schema';
import type { LabExercise } from '@/content/lab/schema';
import type { LearningPath, PathId } from '@/content/types';
import type { LearningEvent } from './records';
import { lessonResult, skillResult, type MasteryStatus } from './mastery';
import { dueReviews, upcomingReviews } from './schedule';
import { pathProgress } from './milestones';

export type Recommendation =
  | { kind: 'review' | 'retry' | 'continue' | 'start'; lessonId: string; title: string; reason: string }
  | { kind: 'lab'; labId: string; title: string; reason: string; path?: PathId };

export interface RecommendOptions {
  labs?: LabExercise[];
  paths?: LearningPath[];
  currentPath?: PathId | null;
  now?: Date;
}

const MASTERED: MasteryStatus[] = ['independent', 'retained'];

/**
 * Picks the day's activities, most valuable first:
 * due reviews → lessons that need another try → unfinished lessons →
 * the next step in your current path's milestone → the next foundation
 * lesson whose prerequisites are done. Lessons for skills you've already
 * demonstrated elsewhere are skipped. The daily load sets how many.
 */
export function recommend(events: LearningEvent[], lessons: Lesson[], dailyLoad: number, opts: RecommendOptions | Date = {}): Recommendation[] {
  const { labs = [], paths = [], currentPath = null, now = new Date() } = opts instanceof Date ? { now: opts } : opts;
  const out: Recommendation[] = [];
  const seen = new Set<string>();
  const push = (r: Recommendation) => {
    const key = r.kind === 'lab' ? `lab:${r.labId}` : `lesson:${r.lessonId}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(r);
  };
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const results = new Map(lessons.map((l) => [l.id, lessonResult(events, l)]));
  const mastered = (l: Lesson) => MASTERED.includes(skillResult(events, l.skill, lessons, labs).status);
  const ready = (l: Lesson) => l.prerequisites.every((p) => results.get(p)?.complete || (byId.get(p) && mastered(byId.get(p)!)));

  for (const r of dueReviews(events, lessons, now)) {
    const lesson = byId.get(r.lessonId)!;
    push({
      kind: 'review',
      lessonId: r.lessonId,
      title: lesson.title,
      reason: r.lastMissed ? 'You missed this in your last review. A quick retry now helps it stick.' : 'Due for review. Recalling it after a gap is what makes it last.',
    });
  }
  for (const l of lessons) {
    if (results.get(l.id)!.status === 'challenge') push({ kind: 'retry', lessonId: l.id, title: l.title, reason: 'One activity isn\'t solved yet, or you used the solution. Try it again on your own.' });
  }
  for (const l of lessons) {
    const r = results.get(l.id)!;
    if (r.status === 'supported' && !r.complete) push({ kind: 'continue', lessonId: l.id, title: l.title, reason: 'You started this. Finish the remaining activities.' });
  }

  // The next steps toward the current milestone of the chosen path.
  const path = paths.find((p) => p.id === currentPath);
  if (path) {
    const { current } = pathProgress(events, path, lessons, labs);
    if (current) {
      for (const item of current.items) {
        if (item.state === 'done' || item.state === 'covered') continue;
        const reason = `Next step toward “${current.milestone.title}” in your ${path.name} path.`;
        if (item.kind === 'lesson') {
          const l = byId.get(item.id)!;
          if (ready(l)) push({ kind: results.get(l.id)!.status === 'none' ? 'start' : 'continue', lessonId: l.id, title: l.title, reason });
        } else {
          push({ kind: 'lab', labId: item.id, title: item.title, reason, path: path.id });
        }
      }
    }
  }

  // Otherwise, foundations first, then any path lessons, skipping skills already shown.
  const ordered = [...lessons.filter((l) => !l.path), ...lessons.filter((l) => l.path && (!currentPath || l.path === currentPath))];
  for (const l of ordered) {
    // Skip a foundation lesson whose skill is already shown; path lessons always teach something new.
    if (results.get(l.id)!.status !== 'none' || (!l.path && mastered(l)) || !ready(l)) continue;
    const prereqNames = l.prerequisites.map((p) => byId.get(p)?.title).filter(Boolean);
    push({
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
