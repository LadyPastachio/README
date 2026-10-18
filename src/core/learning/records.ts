import { z } from 'zod';
import type { StorageAdapter } from '../persistence/storage';

/**
 * Learning records: an append-only log of what happened in lessons and
 * reviews. Mastery, reviews and evidence are all *calculated* from this log
 * rather than stored separately, so every status can be traced back to the
 * attempts behind it (DECISIONS.md, D10).
 */

export const RECORDS_KEY = 'academy:records';
/** Oldest entries are dropped beyond this, to stay well inside browser limits. */
export const MAX_EVENTS = 5000;

export const confidenceSchema = z.enum(['guess', 'unsure', 'sure']);
export type Confidence = z.infer<typeof confidenceSchema>;

export const learningEventSchema = z.object({
  id: z.string(),
  at: z.string(), // ISO time
  /** answer = the learner submitted something; reveal = they asked to see the solution; help = they opened another explanation. */
  type: z.enum(['answer', 'reveal', 'help']),
  context: z.enum(['lesson', 'review', 'lab']),
  /** One visit to a lesson, or one review. Groups attempts together. */
  sessionId: z.string(),
  lessonId: z.string(),
  activityId: z.string(),
  kind: z.enum(['order', 'choice', 'fill', 'explain', 'lab']),
  /** null for activities that aren't checked automatically. */
  correct: z.boolean().nullable(),
  /** What the learner answered, in words (for evidence). */
  answer: z.string().max(4000),
  /** Hints revealed in this lesson visit at the time of the attempt. */
  hintsShown: z.number().int().min(0),
  confidence: confidenceSchema.nullable(),
  /** The misunderstanding linked to a wrong answer, if the lesson names one. */
  misconception: z.string().nullable(),
  /** Lesson layout at the time: lets the profile compare what helps. */
  lessonOrder: z.enum(['explain-first', 'try-first']).nullable(),
  /** For explanations: how many "look for" points the learner says they covered. */
  selfCheck: z.object({ covered: z.number().int(), of: z.number().int() }).nullable(),
});
export type LearningEvent = z.infer<typeof learningEventSchema>;

const recordsFileSchema = z.object({ version: z.literal(1), events: z.array(z.unknown()) });

/** Reads records, dropping any individual entry that is damaged rather than losing everything. */
export function normalizeRecords(input: unknown): LearningEvent[] {
  const parsed = recordsFileSchema.safeParse(input);
  if (!parsed.success) return [];
  const out: LearningEvent[] = [];
  for (const e of parsed.data.events) {
    const r = learningEventSchema.safeParse(e);
    if (r.success) out.push(r.data);
  }
  return out.sort((a, b) => a.at.localeCompare(b.at));
}

export function loadRecords(storage: StorageAdapter): LearningEvent[] {
  const raw = storage.read(RECORDS_KEY);
  if (!raw) return [];
  try {
    return normalizeRecords(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveRecords(storage: StorageAdapter, events: LearningEvent[]): boolean {
  const trimmed = events.length > MAX_EVENTS ? events.slice(events.length - MAX_EVENTS) : events;
  return storage.write(RECORDS_KEY, JSON.stringify({ version: 1, events: trimmed }));
}

export function newId(prefix = 'e'): string {
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${rand}`;
}
