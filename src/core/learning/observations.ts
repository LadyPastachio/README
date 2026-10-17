import type { Lesson } from '@/content/schema';
import type { LearningEvent } from './records';

/**
 * What the records show about how you learn. These are observations from
 * your own activity, kept separate from what you *say* helps, and never
 * treated as a fixed "learning style".
 */

export interface Observations {
  answered: number;
  firstTryRate: number | null;
  hintRate: number | null;
  revealCount: number;
  /** Answers marked "sure" that were wrong: a sign of a hidden misconception. */
  confidentlyWrong: number;
  /** Answers marked "guess" that were right: understanding may be ahead of confidence. */
  underconfidentRight: number;
  misconceptions: { text: string; count: number; lastAt: string }[];
  byFormat: { label: string; attempts: number; firstTryRate: number }[];
  byLessonOrder: { order: 'explain-first' | 'try-first'; lessons: number; firstTryRate: number }[];
  /** Short, plain statements, only made when there's enough evidence. */
  statements: string[];
}

const FORMAT_OF: Record<string, string> = {
  order: 'Putting steps in order',
  'choice:concept': 'Concept questions',
  'choice:predict': 'Predicting what code does',
  'choice:bug': 'Finding bugs',
  fill: 'Filling in code',
};

function firstAnswers(events: LearningEvent[]): LearningEvent[] {
  const seen = new Set<string>();
  const out: LearningEvent[] = [];
  for (const e of events) {
    if (e.type !== 'answer' || e.correct === null) continue;
    const key = `${e.sessionId}:${e.activityId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export function observe(events: LearningEvent[], lessons: Lesson[]): Observations {
  const firsts = firstAnswers(events);
  const variantOf = new Map<string, string>();
  for (const l of lessons) {
    for (const a of [...l.activities, ...l.review]) {
      variantOf.set(`${l.id}:${a.id}`, a.kind === 'choice' ? `choice:${a.variant}` : a.kind);
    }
  }

  const misMap = new Map<string, { count: number; lastAt: string }>();
  for (const e of events) {
    if (!e.misconception) continue;
    const m = misMap.get(e.misconception);
    misMap.set(e.misconception, { count: (m?.count ?? 0) + 1, lastAt: e.at });
  }

  const formatStats = new Map<string, { n: number; ok: number }>();
  for (const e of firsts) {
    const label = FORMAT_OF[variantOf.get(`${e.lessonId}:${e.activityId}`) ?? e.kind] ?? e.kind;
    const s = formatStats.get(label) ?? { n: 0, ok: 0 };
    s.n++;
    if (e.correct) s.ok++;
    formatStats.set(label, s);
  }

  const orderStats = new Map<'explain-first' | 'try-first', { lessons: Set<string>; n: number; ok: number }>();
  for (const e of firsts) {
    if (e.context !== 'lesson' || !e.lessonOrder) continue;
    const s = orderStats.get(e.lessonOrder) ?? { lessons: new Set(), n: 0, ok: 0 };
    s.lessons.add(e.lessonId);
    s.n++;
    if (e.correct) s.ok++;
    orderStats.set(e.lessonOrder, s);
  }

  const answered = firsts.length;
  const confidentlyWrong = firsts.filter((e) => e.confidence === 'sure' && !e.correct).length;
  const underconfidentRight = firsts.filter((e) => e.confidence === 'guess' && e.correct).length;
  const byFormat = [...formatStats].map(([label, s]) => ({ label, attempts: s.n, firstTryRate: pct(s.ok, s.n) })).sort((a, b) => b.attempts - a.attempts);
  const byLessonOrder = [...orderStats].map(([order, s]) => ({ order, lessons: s.lessons.size, firstTryRate: pct(s.ok, s.n) }));

  const statements: string[] = [];
  if (answered >= 8) {
    const strong = byFormat.filter((f) => f.attempts >= 3).sort((a, b) => b.firstTryRate - a.firstTryRate);
    if (strong.length >= 2 && strong[0]!.firstTryRate - strong.at(-1)!.firstTryRate >= 25) {
      statements.push(`You've done best so far on “${strong[0]!.label.toLowerCase()}” and found “${strong.at(-1)!.label.toLowerCase()}” harder.`);
    }
    if (confidentlyWrong >= 2) statements.push(`${confidentlyWrong} answers you were sure about turned out wrong. Those are worth revisiting: they often point to a misunderstanding rather than a slip.`);
    if (underconfidentRight >= 3) statements.push(`You marked ${underconfidentRight} correct answers as guesses. Your understanding may be ahead of your confidence.`);
    const ef = byLessonOrder.find((o) => o.order === 'explain-first');
    const tf = byLessonOrder.find((o) => o.order === 'try-first');
    if (ef && tf && ef.lessons >= 2 && tf.lessons >= 2 && Math.abs(ef.firstTryRate - tf.firstTryRate) >= 15) {
      const better = ef.firstTryRate > tf.firstTryRate ? 'reading the explanation first' : 'trying a question before reading';
      statements.push(`Your first-try accuracy has been higher when ${better}. That's a small sample, so treat it as a hint, not a rule.`);
    }
  }

  const withHints = firsts.filter((e) => e.hintsShown > 0).length;
  return {
    answered,
    firstTryRate: answered ? pct(firsts.filter((e) => e.correct).length, answered) : null,
    hintRate: answered ? pct(withHints, answered) : null,
    revealCount: events.filter((e) => e.type === 'reveal').length,
    confidentlyWrong,
    underconfidentRight,
    misconceptions: [...misMap].map(([text, m]) => ({ text, ...m })).sort((a, b) => b.count - a.count),
    byFormat,
    byLessonOrder,
    statements,
  };
}
