import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { PATHS, getPath } from '@/content/paths';
import { isGraded } from '@/content/schema';
import { milestoneStatus, pathProgress, estimateWeeks, formatWeeks } from './milestones';
import { recommend, type Recommendation } from './recommend';
import { skillResult } from './mastery';
import { ev } from './testHelpers';

const solve = (id: string, extra = {}) =>
  LESSONS.find((l) => l.id === id)!.activities.filter(isGraded).map((a, i) => ev({ lessonId: id, activityId: a.id, sessionId: `s-${id}`, at: new Date(Date.UTC(2026, 9, 1, 10, 0, i)).toISOString(), ...extra }));
const pass = (id: string) => ev({ lessonId: id, activityId: 'checks', context: 'lab', kind: 'lab', sessionId: `lab-${id}` });
const idOf = (r: Recommendation) => (r.kind === 'lab' ? r.labId : r.lessonId);
const chess = getPath('chess')!;

describe('milestones', () => {
  it('later milestones without content are "planned"', () => {
    expect(milestoneStatus([], chess.milestones[1]!, LESSONS, LAB_EXERCISES).state).toBe('planned');
  });

  it('tracks a milestone from not started to complete', () => {
    const m = chess.milestones[0]!;
    expect(milestoneStatus([], m, LESSONS, LAB_EXERCISES)).toMatchObject({ state: 'not-started', done: 0 });
    const some = [...solve('arrays-and-objects'), pass('chess-board-row')];
    expect(milestoneStatus(some, m, LESSONS, LAB_EXERCISES)).toMatchObject({ state: 'in-progress', done: 2 });
    const all = [...m.requires.lessons.flatMap((id) => solve(id)), ...m.requires.labs.map(pass)];
    const done = milestoneStatus(all, m, LESSONS, LAB_EXERCISES);
    expect(done).toMatchObject({ state: 'complete', remainingMinutes: 0 });
    expect(done.done).toBe(done.total);
  });

  it('never skips path lessons, even when their skill is already shown', () => {
    const events = solve('arrays-and-objects'); // data-structures now independent
    expect(skillResult(events, 'data-structures', LESSONS, LAB_EXERCISES).status).toBe('independent');
    const item = milestoneStatus(events, chess.milestones[0]!, LESSONS, LAB_EXERCISES).items.find((i) => i.id === 'chess-board-as-data')!;
    expect(item.state).toBe('todo');
  });

  it('shared foundation lessons finished in one path count in every path', () => {
    const events = solve('arrays-and-objects');
    const fin = milestoneStatus(events, getPath('finance')!.milestones[0]!, LESSONS, LAB_EXERCISES).items.find((i) => i.id === 'arrays-and-objects')!;
    const ch = milestoneStatus(events, chess.milestones[0]!, LESSONS, LAB_EXERCISES).items.find((i) => i.id === 'arrays-and-objects')!;
    expect([fin.state, ch.state]).toEqual(['done', 'done']);
  });

  it('finds the current milestone of a path', () => {
    expect(pathProgress([], chess, LESSONS, LAB_EXERCISES).current?.milestone.id).toBe('chess-1');
  });

  it("every path's first milestone is reachable with existing content", () => {
    for (const p of PATHS) {
      const m = p.milestones[0]!;
      const all = [...m.requires.lessons.flatMap((id) => solve(id)), ...m.requires.labs.map(pass)];
      expect(milestoneStatus(all, m, LESSONS, LAB_EXERCISES).state, p.id).toBe('complete');
    }
  });
});

describe('skills across paths', () => {
  it('untouched path lessons never block a shared skill', () => {
    // money-math (finance path) also teaches js-basics; a website learner shouldn't need it.
    expect(skillResult(solve('values-and-variables'), 'js-basics', LESSONS, LAB_EXERCISES).status).toBe('independent');
  });
  it('but a started path lesson must also be done independently', () => {
    const events = [...solve('values-and-variables'), ev({ lessonId: 'money-math', activityId: 'predict-float', correct: false, sessionId: 'm' })];
    expect(skillResult(events, 'js-basics', LESSONS, LAB_EXERCISES).status).toBe('challenge');
  });
});

describe('path-aware recommendations', () => {
  it('suggests the next step toward the current milestone, including projects', () => {
    const events = [...solve('arrays-and-objects'), ...solve('chess-board-as-data'), ...solve('functions'), ...solve('conditions'), ...solve('values-and-variables')];
    const recs = recommend(events, LESSONS, 3, { labs: LAB_EXERCISES, paths: PATHS, currentPath: 'chess', now: new Date('2026-10-01T12:00:00Z') });
    expect(recs.map(idOf)).toEqual(expect.arrayContaining(['game-state']));
    expect(recs.some((r) => r.kind === 'lab' && r.path === 'chess')).toBe(true);
    expect(recs.find((r) => idOf(r) === 'game-state')!.reason).toContain('Board and pieces');
  });

  it('still suggests path lessons whose skill is already shown, since they teach something new', () => {
    const events = [...solve('values-and-variables')];
    const recs = recommend(events, LESSONS, 20, { labs: LAB_EXERCISES, paths: PATHS, currentPath: 'finance', now: new Date('2026-10-01T12:00:00Z') });
    expect(recs.map(idOf)).toContain('money-math'); // js-basics is independent, but cents are new
    expect(recs.map(idOf)).not.toContain('values-and-variables');
  });

  it('without a chosen path, sticks to foundations first', () => {
    const recs = recommend([], LESSONS, 4, { labs: LAB_EXERCISES, paths: PATHS, currentPath: null });
    for (const r of recs) expect(r.kind === 'lab' || !LESSONS.find((l) => l.id === idOf(r))!.path).toBe(true);
  });
});

describe('time estimates', () => {
  it("gives a range at the learner's weekly hours", () => {
    const r = estimateWeeks(240, 6)!; // 4h of lessons × 2.5 practice = 10h at 6h/week ≈ 1.7 weeks
    expect(r.low).toBeLessThanOrEqual(1.5);
    expect(r.high).toBeGreaterThanOrEqual(2.5);
    expect(estimateWeeks(0, 6)).toBeNull();
    expect(formatWeeks(null)).toBe('Done');
    expect(formatWeeks({ low: 1, high: 2.5 })).toBe('1–2.5 weeks');
    expect(formatWeeks({ low: 0.5, high: 1 })).toBe('up to 1 week');
  });
  it('more hours a week means fewer weeks', () => {
    expect(estimateWeeks(600, 10)!.high).toBeLessThan(estimateWeeks(600, 4)!.high);
  });
});
