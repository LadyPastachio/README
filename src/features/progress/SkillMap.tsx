import { useMemo, useState } from 'react';
import type { PathId } from '@/content/types';
import { SKILLS } from '@/content/skills';
import { PATHS } from '@/content/paths';
import { MASTERY_LABELS, Segmented, type MasteryStatus } from '@/design/components';
import { layoutSkillMap, NODE_W, NODE_H } from './skillMapLayout';

const SHORT: Record<PathId, string> = { web: 'Website', finance: 'Finance', chess: 'Chess', automation: 'Automation' };

/**
 * The competency map: every skill, arranged by what builds on what, colored
 * by status. Filtering by path dims the skills that path doesn't use.
 */
export function SkillMap({ statusOf }: { statusOf: (skillId: string) => MasteryStatus }) {
  const { nodes, edges, width, height } = useMemo(() => layoutSkillMap(SKILLS), []);
  const [filter, setFilter] = useState<'all' | PathId>('all');
  const inPath = (id: string) => filter === 'all' || SKILLS.find((s) => s.id === id)!.paths.includes(filter);

  return (
    <figure className="skill-map">
      <div className="skill-map__bar">
        <Segmented<'all' | PathId> label="Show skills for" value={filter} onChange={setFilter}
          options={[{ value: 'all', label: 'All' }, ...PATHS.map((p) => ({ value: p.id, label: SHORT[p.id] }))]} />
        <span className="subtle small">Left to right: each skill builds on the ones it connects from.</span>
      </div>
      <div className="skill-map__scroll" tabIndex={0} role="region" aria-label="Skill map, scrolls sideways">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-labelledby="skill-map-title">
          <title id="skill-map-title">Map of {SKILLS.length} skills and their prerequisites, colored by your mastery status</title>
          <g className="skill-map__edges">
            {edges.map(({ from, to }) => {
              const x1 = from.x + NODE_W, y1 = from.y + NODE_H / 2, x2 = to.x, y2 = to.y + NODE_H / 2, mx = (x1 + x2) / 2;
              const dim = !inPath(from.skill.id) || !inPath(to.skill.id);
              return <path key={`${from.skill.id}-${to.skill.id}`} d={`M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} data-dim={dim || undefined} />;
            })}
          </g>
          {nodes.map((n) => {
            const st = statusOf(n.skill.id);
            return (
              <a key={n.skill.id} href={`#/progress#skill-${n.skill.id}`} className="skill-map__node" data-status={st} data-dim={!inPath(n.skill.id) || undefined}>
                <title>{`${n.skill.name}: ${MASTERY_LABELS[st]}`}</title>
                <rect x={n.x} y={n.y} width={NODE_W} height={NODE_H} rx="10" />
                <circle cx={n.x + 14} cy={n.y + NODE_H / 2} r="5" className="skill-map__dot" />
                <text x={n.x + 26} y={n.y + NODE_H / 2 + 4}>{n.skill.name.length > 20 ? n.skill.name.slice(0, 19) + '…' : n.skill.name}</text>
              </a>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}
