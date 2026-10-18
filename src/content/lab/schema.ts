import { z } from 'zod';

/** Code Lab exercises. Checks are trusted lesson code that runs inside the sandbox. */

const files = z.object({ html: z.string(), css: z.string(), js: z.string() });

export const labExerciseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  kind: z.enum(['build', 'debug', 'predict', 'refactor', 'playground']),
  /** Skill this exercise gives evidence for. Playgrounds have none. */
  skill: z.string().nullable(),
  /** Set for path project exercises. */
  path: z.enum(['web', 'finance', 'chess', 'automation']).optional(),
  minutes: z.number().int().min(3).max(90),
  summary: z.string().min(1),
  instructions: z.array(z.string().min(1)).min(1),
  /** Plain-language acceptance criteria, one per check, in the same order. */
  checks: z.array(z.object({ id: z.string(), criterion: z.string().min(1), test: z.string().min(1) })),
  starter: files,
  /** Which file to open first. */
  openFile: z.enum(['html', 'css', 'js']).default('html'),
  hints: z.array(z.string()).default([]),
  solution: files.partial().optional(),
  /** For predict exercises: answered before running. */
  predict: z.object({ question: z.string(), answer: z.string(), explanation: z.string() }).optional(),
  /** Shown after passing: a comparison with another approach and the trade-offs. */
  compare: z.object({ title: z.string(), code: z.string(), points: z.array(z.string()).min(1) }).optional(),
}).superRefine((x, ctx) => {
  if (x.kind !== 'playground' && x.checks.length === 0) ctx.addIssue({ code: 'custom', message: 'exercises need at least one check' });
  if (x.kind === 'predict' && !x.predict) ctx.addIssue({ code: 'custom', message: 'predict exercises need a prediction question' });
});

export type LabExercise = z.infer<typeof labExerciseSchema>;
export type LabExerciseInput = z.input<typeof labExerciseSchema>;
