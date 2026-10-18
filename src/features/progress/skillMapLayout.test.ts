import { SKILLS } from '@/content/skills';
import { layoutSkillMap, depthOf, NODE_W, NODE_H } from './skillMapLayout';

describe('skill map layout', () => {
  const { nodes, edges, width, height } = layoutSkillMap(SKILLS);
  it('places every skill once, inside the drawing', () => {
    expect(nodes).toHaveLength(SKILLS.length);
    for (const n of nodes) {
      expect(n.x + NODE_W).toBeLessThanOrEqual(width);
      expect(n.y + NODE_H).toBeLessThanOrEqual(height);
    }
  });
  it('always puts a skill to the right of its prerequisites', () => {
    for (const e of edges) expect(e.to.x).toBeGreaterThan(e.from.x);
    expect(edges.length).toBe(SKILLS.reduce((n, s) => n + s.prerequisites.length, 0));
  });
  it('never overlaps nodes', () => {
    const keys = new Set(nodes.map((n) => `${n.x},${n.y}`));
    expect(keys.size).toBe(nodes.length);
  });
  it('detects prerequisite cycles', () => {
    expect(() => depthOf([{ id: 'a', name: 'A', area: 'foundations', summary: '', prerequisites: ['b'], paths: [] }, { id: 'b', name: 'B', area: 'foundations', summary: '', prerequisites: ['a'], paths: [] }])).toThrow(/cycle/);
  });
});
