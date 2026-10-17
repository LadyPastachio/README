import { SKILLS } from './skills';
import { PATHS } from './paths';
import { LESSONS } from './lessons/how-the-web-works';

/** Guards the curriculum data against broken references. */
describe('curriculum data', () => {
  const ids = new Set(SKILLS.map((s) => s.id));

  it('has unique skill ids and valid prerequisites', () => {
    expect(ids.size).toBe(SKILLS.length);
    for (const s of SKILLS) for (const p of s.prerequisites) expect(ids, `${s.id} → ${p}`).toContain(p);
  });

  it('has no circular prerequisites', () => {
    const byId = new Map(SKILLS.map((s) => [s.id, s]));
    const visit = (id: string, seen: Set<string>): void => {
      expect(seen.has(id), `cycle at ${id}`).toBe(false);
      for (const p of byId.get(id)!.prerequisites) visit(p, new Set([...seen, id]));
    };
    for (const s of SKILLS) visit(s.id, new Set());
  });

  it('only references real skills in milestones and lessons', () => {
    for (const p of PATHS) for (const m of p.milestones) for (const s of m.skills) expect(ids, `${m.id} → ${s}`).toContain(s);
    for (const l of LESSONS) expect(ids).toContain(l.skill);
  });

  it('has four distinct paths, each with milestones', () => {
    expect(PATHS.map((p) => p.id)).toEqual(['web', 'finance', 'chess', 'automation']);
    for (const p of PATHS) expect(p.milestones.length).toBeGreaterThan(0);
  });

  it('gives every lesson the required parts', () => {
    for (const l of LESSONS) {
      expect(l.objective && l.masteryRequirement && l.reviewPlan).toBeTruthy();
      expect(l.activities.length).toBeGreaterThan(0);
      expect(l.misconceptions.length).toBeGreaterThan(0);
      expect(l.hints.length).toBeGreaterThan(0);
      for (const a of l.activities) if (a.kind === 'choice') expect(a.options.filter((o) => o.correct)).toHaveLength(1);
    }
  });
});
