/**
 * Shapes of curriculum content. Content is plain data, kept apart from the
 * screens that display it (DECISIONS.md, D5). Lessons are validated at
 * runtime by ./schema.ts so new lessons are checked automatically.
 */

export type PathId = 'web' | 'finance' | 'chess' | 'automation';

export type SkillArea = 'foundations' | 'frontend' | 'data' | 'algorithms' | 'ai' | 'communication';

export interface Skill {
  id: string;
  name: string;
  area: SkillArea;
  summary: string;
  /** Skills that should come first. */
  prerequisites: string[];
  /** Paths that use this skill. Mastery earned in one path counts in the others. */
  paths: PathId[];
}

export interface Milestone {
  id: string;
  title: string;
  deliverable: string;
  /** Provisional estimate at ~5–7 hours a week. Not a deadline. */
  estimate: string;
  skills: string[];
  /** What completes this milestone. Empty lists mean its content isn't written yet. */
  requires: { lessons: string[]; labs: string[] };
  /** The Code Lab exercise that is the milestone's working deliverable, if any. */
  project?: string;
  /** What "done" means for the deliverable, in plain words. */
  acceptance: string[];
}

export interface LearningPath {
  id: PathId;
  name: string;
  project: string;
  pitch: string;
  aiFeature: string;
  /** Provisional ranges from the master plan. */
  timeline: { early: string; capable: string; advanced: string };
  milestones: Milestone[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  related?: string[];
}

/* Lessons: shapes are defined (and validated) in ./schema.ts */
export type { Lesson, Activity, OrderActivity, ChoiceActivity, FillActivity, ExplainActivity, GradedActivity } from './schema';
