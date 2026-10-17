import { useScrollToHash } from '@/app/useScrollToHash';
import { PageHeader, Panel, MasteryPill, MASTERY_LABELS, Planned, PathTag, type MasteryStatus } from '@/design/components';
import { SKILLS, AREA_NAMES, getSkill } from '@/content/skills';
import type { SkillArea } from '@/content/types';

const STATUS_HELP: Record<MasteryStatus, string> = {
  none: 'You haven\'t met this skill yet.',
  supported: 'You completed it with hints or examples.',
  challenge: 'You tried it, and one more challenge will make it solid.',
  independent: 'You did it without help.',
  retained: 'You still did it correctly days or weeks later, on a new example.',
};

export function ProgressPage() {
  useScrollToHash();

  const areas = Object.keys(AREA_NAMES) as SkillArea[];
  return (
    <>
      <PageHeader
        eyebrow="My Progress"
        title="What you can actually do"
        description="Skills move forward on evidence from your answers, code and explanations, never just from opening a lesson."
      />

      <Panel title="How mastery is measured" variant="sunken">
        <ul className="legend">
          {(Object.keys(MASTERY_LABELS) as MasteryStatus[]).map((s) => (
            <li key={s}><MasteryPill status={s} /><span className="muted">{STATUS_HELP[s]}</span></li>
          ))}
        </ul>
      </Panel>

      <div style={{ margin: 'var(--space-5) 0' }}>
        <Planned phase={2}>Recording evidence from activities and updating these statuses. Everything below is “Not introduced” until then.</Planned>
      </div>

      <div className="skill-areas">
        {areas.map((area) => (
          <section key={area} aria-labelledby={`area-${area}`} className="skill-area">
            <h2 id={`area-${area}`}>{AREA_NAMES[area]}</h2>
            <ul className="skill-table">
              {SKILLS.filter((s) => s.area === area).map((s) => (
                <li key={s.id} id={`skill-${s.id}`} className="skill-row" tabIndex={-1}>
                  <div className="skill-row__main">
                    <strong>{s.name}</strong>
                    <span className="muted">{s.summary}</span>
                    {s.prerequisites.length > 0 && (
                      <span className="subtle skill-row__pre">Builds on: {s.prerequisites.map((p) => getSkill(p)?.name ?? p).join(', ')}</span>
                    )}
                  </div>
                  <div className="skill-row__paths">
                    {s.paths.length === 4 ? <span className="chip">All paths</span> : s.paths.map((p) => <PathTag key={p} path={p} />)}
                  </div>
                  <MasteryPill status="none" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
