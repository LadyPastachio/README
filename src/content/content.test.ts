import { SKILLS } from './skills';
import { PATHS } from './paths';
import { LESSONS, parseLessons } from './lessons';
import type { LessonInput } from './schema';

/** Guards the curriculum data against broken references and invalid lessons. */
describe('curriculum data', () => {
  const ids = new Set(SKILLS.map((s) => s.id));
  const lessonIds = new Set(LESSONS.map((l) => l.id));

  it('has unique skill ids and valid prerequisites', () => {
    expect(ids.size).toBe(SKILLS.length);
    for (const s of SKILLS) for (const p of s.prerequisites) expect(ids, `${s.id} → ${p}`).toContain(p);
  });

  it('has no circular skill prerequisites', () => {
    const byId = new Map(SKILLS.map((s) => [s.id, s]));
    const visit = (id: string, seen: Set<string>): void => {
      expect(seen.has(id), `cycle at ${id}`).toBe(false);
      for (const p of byId.get(id)!.prerequisites) visit(p, new Set([...seen, id]));
    };
    for (const s of SKILLS) visit(s.id, new Set());
  });

  it('only references real skills in milestones and lessons', () => {
    for (const p of PATHS) for (const m of p.milestones) for (const s of m.skills) expect(ids, `${m.id} → ${s}`).toContain(s);
    for (const l of LESSONS) expect(ids, l.id).toContain(l.skill);
  });

  it('has valid lessons with unique ids and real, earlier prerequisites', () => {
    expect(LESSONS.length).toBeGreaterThanOrEqual(18);
    expect(lessonIds.size).toBe(LESSONS.length);
    LESSONS.forEach((l, i) => {
      for (const p of l.prerequisites) {
        expect(lessonIds, `${l.id} → ${p}`).toContain(p);
        expect(LESSONS.findIndex((x) => x.id === p), `${p} should come before ${l.id}`).toBeLessThan(i);
      }
    });
  });

  it('uses a variety of activity types across lessons', () => {
    const kinds = new Set(LESSONS.flatMap((l) => l.activities.map((a) => (a.kind === 'choice' ? a.variant : a.kind))));
    expect([...kinds].sort()).toEqual(['bug', 'concept', 'explain', 'fill', 'order', 'predict']);
  });

  it('keeps review questions separate from lesson questions', () => {
    for (const l of LESSONS) {
      const prompts = new Set(l.activities.map((a) => a.prompt + ('code' in a ? a.code : '')));
      for (const r of l.review) expect(prompts.has(r.prompt + ('code' in r ? r.code : '')), `${l.id}/${r.id}`).toBe(false);
    }
  });

  it('gives targeted feedback for fill-the-gap answers that are also accepted elsewhere', () => {
    for (const l of LESSONS) {
      for (const a of [...l.activities, ...l.review]) {
        if (a.kind !== 'fill') continue;
        for (const w of a.commonWrong) expect(a.accepted, `${l.id}/${a.id}: "${w.answer}" is both right and wrong`).not.toContain(w.answer);
      }
    }
  });

  it('rejects invalid lessons with a clear message', () => {
    const base = LESSONS[0]! as LessonInput;
    const twoCorrect = {
      ...base,
      id: 'broken',
      activities: [{ kind: 'choice', id: 'x', prompt: 'p', options: [{ id: 'a', text: 'a', correct: true, why: 'w' }, { id: 'b', text: 'b', correct: true, why: 'w' }] }, base.activities[1]!],
    } as LessonInput;
    expect(() => parseLessons([twoCorrect])).toThrow(/Lesson "broken" is invalid: .*exactly one option/);
    const badGap = { ...base, id: 'gap', activities: [{ kind: 'fill', id: 'f', prompt: 'p', code: 'no gap here', accepted: ['x'], explanation: 'e' }, base.activities[1]!] } as LessonInput;
    expect(() => parseLessons([badGap])).toThrow(/exactly one ___/);
  });
});

describe('paths', () => {
  it('give every path its own lessons and a first milestone with real content', async () => {
    const { LAB_EXERCISES } = await import('./lab/exercises');
    const labIds = new Set(LAB_EXERCISES.map((x) => x.id));
    const lessonIds = new Set(LESSONS.map((l) => l.id));
    for (const p of PATHS) {
      expect(LESSONS.filter((l) => l.path === p.id).length, p.id).toBeGreaterThanOrEqual(2);
      const first = p.milestones[0]!;
      expect(first.requires.lessons.length + first.requires.labs.length, p.id).toBeGreaterThan(0);
      for (const id of first.requires.lessons) expect(lessonIds, `${p.id} → ${id}`).toContain(id);
      for (const id of first.requires.labs) expect(labIds, `${p.id} → ${id}`).toContain(id);
      if (first.project) expect(first.requires.labs).toContain(first.project);
      expect(first.acceptance.length).toBeGreaterThan(0);
    }
  });
});
