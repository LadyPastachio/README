import { LESSONS, getLesson } from '@/content/lessons';
import { isGraded } from '@/content/schema';
import { lessonResult, skillResult, activityResult, reviewResults } from './mastery';
import { reviewPlan, dueReviews, nextReviewActivity } from './schedule';
import { recommend, type Recommendation } from './recommend';

const idOf = (r: Recommendation) => (r.kind === 'lab' ? r.labId : r.lessonId);
import { normalizeRecords, saveRecords, loadRecords, MAX_EVENTS, RECORDS_KEY } from './records';
import { observe } from './observations';
import { buildEvidence, evidenceToMarkdown, assessorPrompt } from './evidence';
import { createMemoryAdapter } from '../persistence/storage';
import { DEFAULT_SETTINGS } from '../settings/schema';
import { ev, day } from './testHelpers';

const lesson = getLesson('values-and-variables')!; // skill js-basics, only lesson for it
const graded = lesson.activities.filter(isGraded).map((a) => a.id);

/** All graded activities answered correctly first time, at a given time. */
const solveAll = (at: string, session = 's1', extra: Partial<Parameters<typeof ev>[0]> = {}) =>
  graded.map((id, i) => ev({ lessonId: lesson.id, activityId: id, sessionId: session, at: new Date(Date.parse(at) + i * 1000).toISOString(), ...extra }));

describe('activity outcomes', () => {
  it('distinguishes first try, retry, reveal and failure', () => {
    const a = graded[0]!;
    expect(activityResult([], lesson.id, a).outcome).toBe('unattempted');
    expect(activityResult([ev({ lessonId: lesson.id, activityId: a })], lesson.id, a).outcome).toBe('first-try');
    expect(activityResult([ev({ lessonId: lesson.id, activityId: a, correct: false }), ev({ lessonId: lesson.id, activityId: a })], lesson.id, a).outcome).toBe('retried');
    expect(activityResult([ev({ lessonId: lesson.id, activityId: a, correct: false })], lesson.id, a).outcome).toBe('failed');
    expect(activityResult([ev({ lessonId: lesson.id, activityId: a, correct: false }), ev({ lessonId: lesson.id, activityId: a, type: 'reveal', correct: null })], lesson.id, a).outcome).toBe('revealed');
  });

  it('uses the most recent visit, so relearning counts', () => {
    const a = graded[0]!;
    const events = [ev({ lessonId: lesson.id, activityId: a, correct: false, sessionId: 'old' }), ev({ lessonId: lesson.id, activityId: a, sessionId: 'new' })];
    expect(activityResult(events, lesson.id, a).outcome).toBe('first-try');
  });

  it('ignores review answers when judging the lesson', () => {
    const a = graded[0]!;
    expect(activityResult([ev({ lessonId: lesson.id, activityId: a, context: 'review' })], lesson.id, a).outcome).toBe('unattempted');
  });
});

describe('lesson and skill mastery', () => {
  it('starts at Not introduced', () => {
    expect(lessonResult([], lesson).status).toBe('none');
    expect(skillResult([], 'js-basics', LESSONS).status).toBe('none');
  });

  it('is "supported" while a lesson is unfinished', () => {
    const r = lessonResult([ev({ lessonId: lesson.id, activityId: graded[0]! })], lesson);
    expect(r).toMatchObject({ status: 'supported', complete: false });
  });

  it('is "independent" when finished without hints or solutions', () => {
    const r = lessonResult(solveAll(day(1)), lesson);
    expect(r).toMatchObject({ status: 'independent', complete: true });
    expect(skillResult(solveAll(day(1)), 'js-basics', LESSONS).status).toBe('independent');
  });

  it('allows one retry but not more for "independent"', () => {
    const oneRetry = [ev({ lessonId: lesson.id, activityId: graded[0]!, correct: false }), ...solveAll(day(1))];
    expect(lessonResult(oneRetry, lesson).status).toBe('independent');
    const twoRetries = [ev({ lessonId: lesson.id, activityId: graded[0]!, correct: false }), ev({ lessonId: lesson.id, activityId: graded[1]!, correct: false }), ...solveAll(day(1))];
    expect(lessonResult(twoRetries, lesson).status).toBe('supported');
  });

  it('is "supported" when hints were used, even if every answer was right', () => {
    expect(lessonResult(solveAll(day(1), 's1', { hintsShown: 1 }), lesson).status).toBe('supported');
  });

  it('is "needs another challenge" when a solution was shown or an activity is unsolved', () => {
    const revealed = [...solveAll(day(1)), ev({ lessonId: lesson.id, activityId: graded[0]!, type: 'reveal', correct: null, at: day(1, 11) })];
    expect(lessonResult(revealed, lesson).status).toBe('challenge');
    const failed = [ev({ lessonId: lesson.id, activityId: graded[0]!, correct: false })];
    expect(lessonResult(failed, lesson).status).toBe('challenge');
    expect(skillResult(failed, 'js-basics', LESSONS).status).toBe('challenge');
  });

  it('becomes "retained" only after a spaced review passed at least 2 days later', () => {
    const learned = solveAll(day(1));
    const tooSoon = ev({ lessonId: lesson.id, activityId: lesson.review[0]!.id, context: 'review', sessionId: 'r1', at: day(2) });
    expect(skillResult([...learned, tooSoon], 'js-basics', LESSONS).status).toBe('independent');
    const later = ev({ lessonId: lesson.id, activityId: lesson.review[0]!.id, context: 'review', sessionId: 'r2', at: day(4) });
    expect(skillResult([...learned, later], 'js-basics', LESSONS).status).toBe('retained');
  });

  it('drops to "needs another challenge" after a missed review, until relearned', () => {
    const missed = [...solveAll(day(1)), ev({ lessonId: lesson.id, activityId: lesson.review[0]!.id, context: 'review', sessionId: 'r1', correct: false, at: day(4) })];
    expect(skillResult(missed, 'js-basics', LESSONS).status).toBe('challenge');
    const relearned = [...missed, ...solveAll(day(5), 's2')];
    expect(skillResult(relearned, 'js-basics', LESSONS).status).toBe('independent');
  });

  it('a review answered with a hint does not count as a pass', () => {
    const r = reviewResults([ev({ lessonId: lesson.id, activityId: 'x', context: 'review', sessionId: 'r', hintsShown: 1 })], lesson.id);
    expect(r[0]?.passed).toBe(false);
  });

  it('needs every lesson of a skill for "independent"', () => {
    const conditions = getLesson('conditions')!;
    const events = conditions.activities.filter(isGraded).map((a) => ev({ lessonId: conditions.id, activityId: a.id }));
    expect(skillResult(events, 'js-functions', LESSONS).status).toBe('supported'); // functions lesson not done yet
  });
});

describe('spaced review schedule', () => {
  it('has nothing to review until a lesson is finished', () => {
    expect(reviewPlan([ev({ lessonId: lesson.id, activityId: graded[0]! })], lesson)).toBeNull();
  });

  it('schedules 2, then 7 days, and 1 day after a miss', () => {
    const learned = solveAll(day(1));
    const p1 = reviewPlan(learned, lesson)!;
    expect(p1.dueAt.toISOString().slice(0, 10)).toBe('2026-10-03');
    expect(dueReviews(learned, LESSONS, new Date(day(2)))).toHaveLength(0);
    expect(dueReviews(learned, LESSONS, new Date(day(3, 12)))).toHaveLength(1);

    const passed = [...learned, ev({ lessonId: lesson.id, activityId: 'r', context: 'review', sessionId: 'r1', at: day(3, 12) })];
    expect(reviewPlan(passed, lesson)!.dueAt.toISOString().slice(0, 10)).toBe('2026-10-10');

    const missed = [...learned, ev({ lessonId: lesson.id, activityId: 'r', context: 'review', sessionId: 'r1', correct: false, at: day(3, 12) })];
    const p = reviewPlan(missed, lesson)!;
    expect(p.lastMissed).toBe(true);
    expect(p.dueAt.toISOString().slice(0, 10)).toBe('2026-10-04');
  });

  it('rotates through the lesson\'s review questions', () => {
    expect(nextReviewActivity(lesson, 0).id).toBe(lesson.review[0]!.id);
    expect(nextReviewActivity(lesson, lesson.review.length).id).toBe(lesson.review[0]!.id);
  });
});

describe('recommendations', () => {
  it('starts with lessons that have no prerequisites, explaining why', () => {
    const recs = recommend([], LESSONS, 3);
    expect(recs).toHaveLength(3);
    expect(recs.every((r) => r.kind === 'start')).toBe(true);
    expect(getLesson(idOf(recs[0]!))!.prerequisites).toEqual([]);
    expect(recs[0]!.reason).toMatch(/No prerequisites/);
  });

  it('respects the daily load', () => {
    expect(recommend([], LESSONS, 1)).toHaveLength(1);
  });

  it('puts due reviews and retries before new lessons', () => {
    const events = [...solveAll(day(1)), ev({ lessonId: 'conditions', activityId: 'predict-chain', correct: false, at: day(1, 12) })];
    const recs = recommend(events, LESSONS, 3, new Date(day(5)));
    expect(recs[0]).toMatchObject({ kind: 'review', lessonId: lesson.id });
    expect(recs[1]).toMatchObject({ kind: 'retry', lessonId: 'conditions' });
  });

  it('unlocks a lesson once its prerequisites are complete', () => {
    const before = recommend([], LESSONS, 10).map(idOf);
    expect(before).not.toContain('conditions');
    const after = recommend(solveAll(day(1)), LESSONS, 10, new Date(day(1, 12))).map(idOf);
    expect(after).toContain('conditions');
  });
});

describe('records storage', () => {
  it('round-trips and keeps good entries when some are damaged', () => {
    const s = createMemoryAdapter();
    saveRecords(s, solveAll(day(1)));
    expect(loadRecords(s)).toHaveLength(graded.length);
    const raw = JSON.parse(s.read(RECORDS_KEY)!);
    raw.events.push({ nonsense: true });
    expect(normalizeRecords(raw)).toHaveLength(graded.length);
    expect(normalizeRecords('garbage')).toEqual([]);
  });

  it('caps the log size, dropping the oldest entries', () => {
    const s = createMemoryAdapter();
    const many = Array.from({ length: MAX_EVENTS + 10 }, (_, i) => ev({ lessonId: 'l', activityId: `a${i}` }));
    saveRecords(s, many);
    const loaded = loadRecords(s);
    expect(loaded).toHaveLength(MAX_EVENTS);
    expect(loaded.at(-1)!.activityId).toBe(`a${MAX_EVENTS + 9}`);
  });
});

describe('observations', () => {
  it('tracks misconceptions and confidence calibration', () => {
    const events = [
      ev({ lessonId: lesson.id, activityId: 'predict-string-plus', correct: false, confidence: 'sure', misconception: 'Treats a number in quotes as a number' }),
      ev({ lessonId: lesson.id, activityId: 'predict-reassign', correct: true, confidence: 'guess' }),
    ];
    const o = observe(events, LESSONS);
    expect(o.answered).toBe(2);
    expect(o.confidentlyWrong).toBe(1);
    expect(o.underconfidentRight).toBe(1);
    expect(o.misconceptions[0]).toMatchObject({ text: 'Treats a number in quotes as a number', count: 1 });
    expect(o.statements).toEqual([]); // not enough evidence to generalize yet
  });
});

describe('learning evidence', () => {
  it('records answers, independence, explanation and follow-up', () => {
    const events = [
      ev({ lessonId: lesson.id, activityId: 'predict-string-plus', correct: false, answer: '6', misconception: 'Treats a number in quotes as a number', at: day(1, 9) }),
      ...solveAll(day(1)),
      ev({ lessonId: lesson.id, activityId: 'explain-let-const', kind: 'explain', correct: null, answer: 'const never changes, let can.', selfCheck: { covered: 2, of: 3 }, at: day(1, 11) }),
    ];
    const e = buildEvidence(events, lesson, LESSONS, { ...DEFAULT_SETTINGS.profile, confusingTopics: 'string vs number' }, new Date(day(1, 12)));
    expect(e.status.lesson).toBe('independent');
    expect(e.independence).toEqual({ hintsUsed: false, solutionsShown: 0, retries: 1 });
    expect(e.misconceptions).toEqual(['Treats a number in quotes as a number']);
    expect(e.explanations[0]).toMatchObject({ text: 'const never changes, let can.' });
    expect(e.followUp.some((f) => f.includes('Spaced review due 2026-10-03'))).toBe(true);
    const md = evidenceToMarkdown(e);
    expect(md).toContain('# Learning Evidence: Values and variables');
    expect(md).toContain('✗ 6');
    expect(md).toContain('self-assessed');
    expect(md).toContain('string vs number');
    expect(assessorPrompt(e)).toMatch(/ONLY evidence you have/);
    expect(assessorPrompt(e)).toMatch(/ONE question at a time/);
  });
});
