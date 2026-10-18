import { z } from 'zod';

/**
 * The lesson format. Every lesson file is checked against these schemas
 * when the app loads and in the test suite, so a typo in a lesson shows up
 * as a clear error instead of a broken screen.
 */

const id = z.string().regex(/^[a-z0-9-]+$/, 'ids use lowercase letters, numbers and dashes');
const text = z.string().min(1);

export const orderActivitySchema = z.object({
  kind: z.literal('order'),
  id,
  prompt: text,
  /** Listed in the correct order; the screen shuffles them. */
  steps: z.array(text).min(3),
  feedback: z.object({ correct: text, incorrect: text }),
});

export const choiceActivitySchema = z.object({
  kind: z.literal('choice'),
  id,
  /** 'predict' = what does this code print; 'bug' = what's wrong with it. */
  variant: z.enum(['concept', 'predict', 'bug']).default('concept'),
  prompt: text,
  code: z.string().optional(),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        text: text,
        correct: z.boolean(),
        why: text,
        /** Names the misunderstanding behind a wrong answer, so it can be tracked. */
        misconception: z.string().optional(),
      }),
    )
    .min(2)
    .refine((opts) => opts.filter((o) => o.correct).length === 1, 'exactly one option must be correct'),
});

export const fillActivitySchema = z.object({
  kind: z.literal('fill'),
  id,
  prompt: text,
  /** Code with exactly one ___ marking the gap. */
  code: z.string().refine((c) => c.split('___').length === 2, 'code must contain exactly one ___'),
  /** Accepted answers. Compared after trimming; spacing inside is ignored. */
  accepted: z.array(text).min(1),
  caseSensitive: z.boolean().default(true),
  explanation: text,
  /** Optional targeted feedback for predictable wrong answers. */
  commonWrong: z.array(z.object({ answer: text, why: text, misconception: z.string().optional() })).default([]),
});

export const explainActivitySchema = z.object({
  kind: z.literal('explain'),
  id,
  prompt: text,
  /** What a good answer mentions. Shown after the learner writes theirs. */
  lookFor: z.array(text).min(1),
});

export const gradedActivitySchema = z.discriminatedUnion('kind', [orderActivitySchema, choiceActivitySchema, fillActivitySchema]);
export const activitySchema = z.discriminatedUnion('kind', [
  orderActivitySchema,
  choiceActivitySchema,
  fillActivitySchema,
  explainActivitySchema,
]);

export const lessonSchema = z
  .object({
    id,
    title: text,
    skill: id,
    paths: z.array(z.enum(['web', 'finance', 'chess', 'automation'])).min(1),
    minutes: z.number().int().min(3).max(60),
    objective: text,
    whyItMatters: text,
    /** Lesson ids that should be done first. */
    prerequisites: z.array(id).default([]),
    /** Set for path-specific lessons; foundation lessons leave it out. */
    path: z.enum(['web', 'finance', 'chess', 'automation']).optional(),
    sections: z
      .array(
        z.object({
          heading: text,
          body: z.array(text).min(1),
          /** Optional code example shown after the paragraphs. */
          code: z.string().optional(),
          /** Named diagram component to show after this section. */
          diagram: z.enum(['request-response']).optional(),
        }),
      )
      .min(1),
    activities: z.array(activitySchema).min(2),
    /** New questions on the same idea, used for spaced review. Never the lesson's own questions. */
    review: z.array(gradedActivitySchema).min(1),
    misconceptions: z.array(z.object({ myth: text, reality: text })).min(1),
    hints: z.array(text).min(1),
    masteryRequirement: text,
  })
  .superRefine((lesson, ctx) => {
    const ids = [...lesson.activities, ...lesson.review].map((a) => a.id);
    const dup = ids.find((x, i) => ids.indexOf(x) !== i);
    if (dup) ctx.addIssue({ code: 'custom', message: `duplicate activity id "${dup}"` });
    if (!lesson.activities.some((a) => a.kind !== 'explain')) {
      ctx.addIssue({ code: 'custom', message: 'a lesson needs at least one automatically checked activity' });
    }
  });

export type Lesson = z.infer<typeof lessonSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type GradedActivity = z.infer<typeof gradedActivitySchema>;
export type OrderActivity = z.infer<typeof orderActivitySchema>;
export type ChoiceActivity = z.infer<typeof choiceActivitySchema>;
export type FillActivity = z.infer<typeof fillActivitySchema>;
export type ExplainActivity = z.infer<typeof explainActivitySchema>;

/** Input type for lesson files: fields with defaults may be left out. */
export type LessonInput = z.input<typeof lessonSchema>;

export function isGraded(a: Activity): a is GradedActivity {
  return a.kind !== 'explain';
}
