/**
 * Shapes of curriculum content. Content is plain data, kept apart from the
 * screens that display it (DECISIONS.md, D5). Phase 2 adds runtime
 * validation for these shapes so new lessons can be checked automatically.
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

/* Lessons ------------------------------------------------------------- */

export interface OrderActivity {
  kind: 'order';
  id: string;
  prompt: string;
  /** Listed in the correct order; the screen shuffles them. */
  steps: string[];
  feedback: { correct: string; incorrect: string };
}

export interface ChoiceActivity {
  kind: 'choice';
  id: string;
  prompt: string;
  options: { id: string; text: string; correct: boolean; why: string }[];
}

export interface ExplainActivity {
  kind: 'explain';
  id: string;
  prompt: string;
  /** What a good answer mentions. Shown after the learner writes theirs. */
  lookFor: string[];
}

export type Activity = OrderActivity | ChoiceActivity | ExplainActivity;

export interface Lesson {
  id: string;
  title: string;
  skill: string;
  paths: PathId[];
  minutes: number;
  objective: string;
  whyItMatters: string;
  prerequisites: string[];
  sections: { heading: string; body: string[] }[];
  activities: Activity[];
  misconceptions: { myth: string; reality: string }[];
  hints: string[];
  masteryRequirement: string;
  reviewPlan: string;
}
