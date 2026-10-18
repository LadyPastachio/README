import type { Skill, SkillArea } from '@/content/types';

/**
 * Lays out skills left to right by prerequisite depth: skills with no
 * prerequisites in the first column, then each column builds on earlier ones.
 * Pure function, so the layout can be tested.
 */

export const NODE_W = 156;
export const NODE_H = 40;
const COL_GAP = 44;
const ROW_GAP = 12;
const PAD = 12;
const AREA_ORDER: SkillArea[] = ['foundations', 'communication', 'frontend', 'data', 'algorithms', 'ai'];

export interface PlacedNode { skill: Skill; x: number; y: number; depth: number }
export interface Edge { from: PlacedNode; to: PlacedNode }

export function depthOf(skills: Skill[]): Map<string, number> {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const memo = new Map<string, number>();
  const visit = (id: string, stack: Set<string>): number => {
    if (memo.has(id)) return memo.get(id)!;
    if (stack.has(id)) throw new Error(`Prerequisite cycle at ${id}`);
    const s = byId.get(id);
    if (!s) return 0;
    const next = new Set(stack).add(id);
    const d = s.prerequisites.length ? 1 + Math.max(...s.prerequisites.map((p) => visit(p, next))) : 0;
    memo.set(id, d);
    return d;
  };
  for (const s of skills) visit(s.id, new Set());
  return memo;
}

export function layoutSkillMap(skills: Skill[]) {
  const depth = depthOf(skills);
  const columns: Skill[][] = [];
  for (const s of skills) (columns[depth.get(s.id)!] ??= []).push(s);
  const nodes: PlacedNode[] = [];
  columns.forEach((col, d) => {
    col.sort((a, b) => AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area) || a.name.localeCompare(b.name));
    col.forEach((skill, i) => nodes.push({ skill, depth: d, x: PAD + d * (NODE_W + COL_GAP), y: PAD + i * (NODE_H + ROW_GAP) }));
  });
  const byId = new Map(nodes.map((n) => [n.skill.id, n]));
  const edges: Edge[] = nodes.flatMap((n) => n.skill.prerequisites.map((p) => byId.get(p)).filter((f): f is PlacedNode => !!f).map((from) => ({ from, to: n })));
  const width = PAD * 2 + columns.length * NODE_W + (columns.length - 1) * COL_GAP;
  const height = PAD * 2 + Math.max(...columns.map((c) => c.length)) * (NODE_H + ROW_GAP) - ROW_GAP;
  return { nodes, edges, width, height };
}
