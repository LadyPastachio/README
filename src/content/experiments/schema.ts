import { z } from 'zod';

/**
 * Guided experiments: a project built in small steps, each with one task,
 * one file to edit, an expected result, progressive hints and a real check.
 * Experiments are data; the same screen runs any of them.
 *
 * Checks run inside the sandboxed preview after the page loads, with `doc`
 * (the page's document) available. A check returns true when the step is
 * done, or throws an Error whose message is shown to the learner as specific,
 * encouraging feedback ("Not quite. …").
 */

const id = z.string().regex(/^[a-z0-9-]+$/);
const text = z.string().min(1);
const fileKind = z.enum(['html', 'css', 'js']);

const term = z.object({ term: text, meaning: text });

const choice = z.object({
  id,
  label: text,
  file: fileKind,
  test: text,
  success: text,
});

export const experimentStepSchema = z
  .object({
    id,
    title: text,
    /** The idea this step teaches, in one or two sentences. */
    concept: text,
    /** The file to edit, or null when the learner chooses (see choices). */
    file: fileKind.nullable(),
    /** What to do, as short numbered actions. */
    task: z.array(text).min(1),
    expected: text,
    /** From a small clue to an explicit answer. Revealed one at a time. */
    hints: z.array(text).min(2),
    /** Words a beginner may not know yet, explained in place. */
    terms: z.array(term).default([]),
    /** Check code (see the note above). Omit when the step uses choices. */
    test: z.string().optional(),
    /** For "make it your own" steps: the learner picks one change, and that choice is checked. */
    choices: z.array(choice).optional(),
    success: text,
  })
  .refine((s) => !!s.test !== !!s.choices, 'a step needs either a test or choices')
  .refine((s) => s.file !== null || !!s.choices, 'steps without a file need choices');

export const experimentSchema = z.object({
  id,
  title: text,
  objective: text,
  /** Lessons that offer this experiment. */
  lessons: z.array(id).min(1),
  skill: id,
  minutes: z.number().int().min(3).max(90),
  intro: text,
  starter: z.object({ html: z.string(), css: z.string(), js: z.string() }),
  steps: z.array(experimentStepSchema).min(1),
  mistakes: z.array(z.object({ problem: text, fix: text })).default([]),
  completion: z.object({ title: text, summary: text, practiced: z.array(text).min(1), next: z.array(z.object({ label: text, to: text })).default([]) }),
});

export type Experiment = z.infer<typeof experimentSchema>;
export type ExperimentInput = z.input<typeof experimentSchema>;
export type ExperimentStep = Experiment['steps'][number];
export type ExperimentFile = z.infer<typeof fileKind>;
