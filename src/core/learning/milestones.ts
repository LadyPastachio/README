import type { Lesson } from '@/content/schema';
import type { LabExercise } from '@/content/lab/schema';
import type { LearningPath, Milestone } from '@/content/types';
import type { LearningEvent } from './records';
import { lessonResult, labResult, skillResult, type MasteryStatus } from './mastery';

/**
 * Milestone tracking. A milestone is complete when its lessons and Code Lab
 * exercises are done. Shared foundation lessons count in every path, so
 * switching paths keeps everything already finished. A foundation lesson
 * whose skill is already demonstrated counts as covered.
 */

export type ItemState = 'done' | 'covered' | 'started' | 'todo';
export type MilestoneState = 'planned' | 'not-started' | 'in-progress' | 'complete';

export interface MilestoneItem {
  kind: 'lesson' | 'lab';
  id: string;
  title: string;
  minutes: number;
  state: ItemState;
}

export interface MilestoneStatus {
  milestone: Milestone;
  state: MilestoneState;
  items: MilestoneItem[];
  done: number;
  total: number;
  remainingMinutes: number;
}

/** Time spent beyond the lesson itself: practice, mistakes, review and experimenting. Deliberately generous. */
export const PRACTICE_FACTOR = 2.5;
const MASTERED: MasteryStatus[] = ['independent', 'retained'];

export function milestoneStatus(events: LearningEvent[], milestone: Milestone, lessons: Lesson[], labs: LabExercise[]): MilestoneStatus {
  const items: MilestoneItem[] = [];
  for (const id of milestone.requires.lessons) {
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) continue;
    const r = lessonResult(events, lesson);
    // Only shared foundation lessons can be covered: path lessons teach things the foundations don't.
    const covered = !lesson.path && !r.complete && MASTERED.includes(skillResult(events, lesson.skill, lessons, labs).status);
    items.push({ kind: 'lesson', id, title: lesson.title, minutes: lesson.minutes, state: r.complete ? 'done' : covered ? 'covered' : r.status !== 'none' ? 'started' : 'todo' });
  }
  for (const id of milestone.requires.labs) {
    const lab = labs.find((x) => x.id === id);
    if (!lab) continue;
    const r = labResult(events, id);
    items.push({ kind: 'lab', id, title: lab.title, minutes: lab.minutes, state: r.passed ? 'done' : r.status !== 'none' ? 'started' : 'todo' });
  }
  const total = items.length;
  const done = items.filter((i) => i.state === 'done' || i.state === 'covered').length;
  const remainingMinutes = items.filter((i) => i.state !== 'done' && i.state !== 'covered').reduce((sum, i) => sum + i.minutes, 0);
  const state: MilestoneState =
    total === 0 ? 'planned' : done === total ? 'complete' : done > 0 || items.some((i) => i.state === 'started') ? 'in-progress' : 'not-started';
  return { milestone, state, items, done, total, remainingMinutes };
}

export function pathProgress(events: LearningEvent[], path: LearningPath, lessons: Lesson[], labs: LabExercise[]) {
  const milestones = path.milestones.map((m) => milestoneStatus(events, m, lessons, labs));
  const current = milestones.find((m) => m.state !== 'complete' && m.state !== 'planned') ?? null;
  return { path, milestones, current };
}

/**
 * Rough weeks of study left, from lesson minutes × a practice factor at the
 * learner's weekly hours. Returns a range, because people vary a lot.
 */
export function estimateWeeks(remainingMinutes: number, weeklyHours: number): { low: number; high: number } | null {
  if (remainingMinutes <= 0) return null;
  const weeks = (remainingMinutes * PRACTICE_FACTOR) / (weeklyHours * 60);
  const round = (n: number) => Math.max(0.5, Math.round(n * 2) / 2);
  return { low: round(weeks * 0.75), high: round(weeks * 1.5) };
}

export function formatWeeks(range: { low: number; high: number } | null): string {
  if (!range) return 'Done';
  const f = (n: number) => (n < 1 ? 'a few days' : `${n} week${n === 1 ? '' : 's'}`);
  if (range.high < 1) return 'a few days';
  if (range.low < 1) return `up to ${f(range.high)}`;
  return range.low === range.high ? `about ${f(range.low)}` : `${range.low}–${f(range.high)}`;
}
