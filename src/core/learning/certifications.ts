import type { Lesson } from '@/content/schema';
import type { LabExercise } from '@/content/lab/schema';
import { CERTIFICATIONS, type Certification } from '@/content/certifications';
import type { LearningEvent } from './records';
import { skillResult, type MasteryStatus } from './mastery';

/**
 * Matches certifications to demonstrated skills.
 *
 * "Ready to consider" means every skill the certification relies on has been
 * demonstrated independently (or retained) in the academy. It does not mean
 * "ready to pass": most certifications need projects or study beyond this
 * academy, and the app always says what else is needed.
 */

export type Readiness = 'ready' | 'building' | 'later' | 'unavailable';

export interface CertStatus {
  cert: Certification;
  readiness: Readiness;
  /** Skills demonstrated independently or retained. */
  done: string[];
  /** Skills started but not yet independent. */
  inProgress: string[];
  /** Skills not started, or not taught in the academy yet. */
  remaining: string[];
}

const MASTERED: MasteryStatus[] = ['independent', 'retained'];

export function certificationStatus(events: LearningEvent[], lessons: Lesson[], labs: LabExercise[], certs = CERTIFICATIONS): CertStatus[] {
  const cache = new Map<string, MasteryStatus>();
  const statusOf = (id: string) => {
    if (!cache.has(id)) cache.set(id, skillResult(events, id, lessons, labs).status);
    return cache.get(id)!;
  };
  const order: Record<Readiness, number> = { ready: 0, building: 1, unavailable: 2, later: 3 };
  return certs
    .map((cert) => {
      const done = cert.skills.filter((s) => MASTERED.includes(statusOf(s)));
      const inProgress = cert.skills.filter((s) => !MASTERED.includes(statusOf(s)) && statusOf(s) !== 'none');
      const remaining = cert.skills.filter((s) => statusOf(s) === 'none');
      let readiness: Readiness = done.length === cert.skills.length ? 'ready' : done.length + inProgress.length > 0 ? 'building' : 'later';
      if (cert.availability && readiness === 'ready') readiness = 'unavailable';
      return { cert, readiness, done, inProgress, remaining };
    })
    .sort((a, b) => order[a.readiness] - order[b.readiness] || b.done.length / b.cert.skills.length - a.done.length / a.cert.skills.length);
}

/** Certifications that just became ready because of this skill. Used for the "consider getting certified" prompt. */
export function certsUnlockedBySkill(statuses: CertStatus[], skillId: string): CertStatus[] {
  return statuses.filter((s) => s.readiness === 'ready' && s.cert.skills.includes(skillId));
}
