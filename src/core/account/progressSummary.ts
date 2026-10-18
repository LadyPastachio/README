import { SKILLS } from '@/content/skills';
import { PATHS } from '@/content/paths';
import { skillResult } from '@/core/learning/mastery';
import { pathProgress } from '@/core/learning/milestones';
import type { LearningEvent } from '@/core/learning/records';
import type { Lesson } from '@/content/types';
import type { LabExercise } from '@/content/lab/schema';

/**
 * A short, plain-text progress summary you can choose to share with a circle.
 * It lists skills by status and your current milestone, and nothing else:
 * no answers, explanations, confidence or learning profile.
 */
export function progressSummary(events: LearningEvent[], lessons: Lesson[], labs: LabExercise[], currentPath: string | null): string {
  const by = (status: string) => SKILLS.filter((s) => skillResult(events, s.id, lessons, labs).status === status).map((s) => s.name);
  const retained = by('retained');
  const independent = by('independent');
  const supported = by('supported');
  const lines: string[] = [];
  if (retained.length) lines.push(`Retained over time: ${retained.join(', ')}`);
  if (independent.length) lines.push(`Demonstrated independently: ${independent.join(', ')}`);
  if (supported.length) lines.push(`Practicing with support: ${supported.join(', ')}`);
  if (!lines.length) lines.push('Just getting started: no skills demonstrated yet.');
  const path = PATHS.find((p) => p.id === currentPath);
  if (path) {
    const prog = pathProgress(events, path, lessons, labs);
    const m = prog.current;
    lines.push(m ? `Working on: ${path.name}, "${m.milestone.title}" (${m.done} of ${m.total} items done)` : `${path.name}: all available milestones complete`);
  }
  return lines.join('\n');
}
