import type { LearningEvent } from './records';

let n = 0;
/** Builds a learning event for tests with sensible defaults. */
export function ev(p: Partial<LearningEvent> & Pick<LearningEvent, 'lessonId' | 'activityId'>): LearningEvent {
  n++;
  return {
    id: `t${n}`,
    at: p.at ?? new Date(Date.UTC(2026, 9, 1, 10, 0, n)).toISOString(),
    type: 'answer',
    context: 'lesson',
    sessionId: 's1',
    kind: 'choice',
    correct: true,
    answer: 'x',
    hintsShown: 0,
    confidence: null,
    misconception: null,
    lessonOrder: 'explain-first',
    selfCheck: null,
    ...p,
  };
}

export const day = (d: number, h = 10) => new Date(Date.UTC(2026, 9, d, h)).toISOString();
