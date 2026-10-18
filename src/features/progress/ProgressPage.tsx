import { Link } from 'react-router-dom';
import { Copy, CheckCircle2, XCircle, Eye, MessageSquareText } from 'lucide-react';
import { PageHeader, Panel, MasteryPill, MASTERY_LABELS, PathTag, Button, EmptyState, type MasteryStatus } from '@/design/components';
import { SKILLS, AREA_NAMES, getSkill } from '@/content/skills';
import { LESSONS, getLesson } from '@/content/lessons';
import { LAB_EXERCISES, getLabExercise } from '@/content/lab/exercises';
import { certificationStatus } from '@/core/learning/certifications';
import { Award } from 'lucide-react';
import type { SkillArea } from '@/content/types';
import { useScrollToHash } from '@/app/useScrollToHash';
import { SkillMap } from './SkillMap';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { skillResult, lessonResult } from '@/core/learning/mastery';
import { observe } from '@/core/learning/observations';
import { buildEvidence, evidenceToMarkdown } from '@/core/learning/evidence';
import { copyText } from '@/features/settings/fileHelpers';
import { useToast } from '@/app/Toast';

const ORDER: MasteryStatus[] = ['retained', 'independent', 'supported', 'challenge', 'none'];
const LADDER: MasteryStatus[] = ['supported', 'independent', 'retained'];
const STATUS_HELP: Record<MasteryStatus, string> = {
  none: 'Not met yet.',
  supported: 'Done with hints, retries, or not finished.',
  challenge: 'Not solved yet, solution used, or a review was missed.',
  independent: 'Done on your own, no hints or solutions.',
  retained: 'Still correct on a new question, days later.',
};

/** Three-step ladder showing how far a skill has climbed. */
function Ladder({ status }: { status: MasteryStatus }) {
  const level = status === 'retained' ? 3 : status === 'independent' ? 2 : status === 'supported' || status === 'challenge' ? 1 : 0;
  return (
    <span className="ladder" data-status={status} aria-hidden="true">
      {LADDER.map((s, i) => <i key={s} data-on={i < level} />)}
    </span>
  );
}

export function ProgressPage() {
  useScrollToHash();
  const { events } = useLearning();
  const { settings } = useSettings();
  const toast = useToast();
  const skills = SKILLS.map((s) => ({ skill: s, result: skillResult(events, s.id, LESSONS, LAB_EXERCISES) }));
  const counts = Object.fromEntries(ORDER.map((st) => [st, skills.filter((x) => x.result.status === st).length])) as Record<MasteryStatus, number>;
  const obs = observe(events, LESSONS);
  const recent = events.filter((e) => e.type === 'answer' || e.type === 'reveal').slice(-12).reverse();
  const started = LESSONS.filter((l) => lessonResult(events, l).status !== 'none');
  const areas = Object.keys(AREA_NAMES) as SkillArea[];
  const certs = certificationStatus(events, LESSONS, LAB_EXERCISES);
  const readyCerts = certs.filter((c) => c.readiness === 'ready');
  const buildingCerts = certs.filter((c) => c.readiness === 'building');

  return (
    <>
      <PageHeader eyebrow="My Progress" title="What you can actually do" description="Skills move forward on evidence from your answers and explanations, never just from opening a lesson." />

      <Panel as="section" className="mastery-overview" aria-labelledby="overview-h">
        <div className="panel__head"><h2 id="overview-h" className="panel__title">All {SKILLS.length} skills</h2><span className="subtle small">{obs.answered} answers recorded</span></div>
        <div className="mastery-bar" role="img" aria-label={ORDER.map((s) => `${counts[s]} ${MASTERY_LABELS[s]}`).join(', ')}>
          {ORDER.map((s) => counts[s] > 0 && <span key={s} data-status={s} style={{ flexGrow: counts[s] }} />)}
        </div>
        <ul className="legend">
          {ORDER.map((s) => (
            <li key={s}>
              <span className="legend__swatch" data-status={s} aria-hidden="true" />
              <span><strong className="tabular">{counts[s]}</strong> {MASTERY_LABELS[s]}</span>
              <span className="subtle small">{STATUS_HELP[s]}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <section className="section section--tight" aria-labelledby="map-h">
        <div className="section__head"><h2 id="map-h">Skill map</h2></div>
        <SkillMap statusOf={(id) => skills.find((x) => x.skill.id === id)?.result.status ?? 'none'} />
      </section>

      <Panel as="section" className="cert-summary section--tight" aria-labelledby="certs-h">
        <div className="panel__head">
          <h2 id="certs-h" className="panel__title"><Award size={18} aria-hidden="true" className="cert-h-icon" />Certifications</h2>
          <Link to="/progress/certifications" className="link-quiet">All {certs.length} →</Link>
        </div>
        {readyCerts.length > 0 ? (
          <>
            <p className="muted small">You've demonstrated every skill for these. Consider getting certified:</p>
            <ul>{readyCerts.map((c) => <li key={c.cert.id}><strong>{c.cert.name}</strong><span className="subtle">{c.cert.provider} · {c.cert.cost === 'free' ? 'Free' : c.cert.price}</span></li>)}</ul>
          </>
        ) : (
          <p className="muted small">
            {buildingCerts.length > 0
              ? `You're building toward ${buildingCerts.length} certification${buildingCerts.length === 1 ? '' : 's'}. Closest: ${buildingCerts[0]!.cert.name} (${buildingCerts[0]!.done.length} of ${buildingCerts[0]!.cert.skills.length} skills demonstrated).`
              : 'As you demonstrate skills, matching certifications from freeCodeCamp, GitHub, Anthropic, AWS, Microsoft and others are recommended here.'}
          </p>
        )}
      </Panel>

      <div className="skill-areas">
        {areas.map((area) => (
          <section key={area} aria-labelledby={`area-${area}`} className="skill-area">
            <h2 id={`area-${area}`}>{AREA_NAMES[area]}</h2>
            <ul className="skill-tiles">
              {skills.filter((x) => x.skill.area === area).map(({ skill: s, result }) => (
                <li key={s.id} id={`skill-${s.id}`} className="skill-tile" data-status={result.status} tabIndex={-1}>
                  <div className="skill-tile__head">
                    <strong>{s.name}</strong>
                    <Ladder status={result.status} />
                  </div>
                  <MasteryPill status={result.status} />
                  <p className="subtle small">{result.status === 'none' && result.lessons.length === 0 ? s.summary : result.reason}</p>
                  {(result.lessons.length > 0 || result.labs.length > 0) && (
                    <div className="skill-tile__lessons">
                      {result.lessons.map((r) => <Link key={r.lessonId} to={`/learn/lesson/${r.lessonId}`}>{getLesson(r.lessonId)?.title}</Link>)}
                      {result.labs.map((r) => <Link key={r.exerciseId} to={`/lab/${r.exerciseId}`}>Lab: {getLabExercise(r.exerciseId)?.title}</Link>)}
                    </div>
                  )}
                  {s.prerequisites.length > 0 && <span className="skill-tile__pre">Builds on {s.prerequisites.map((p) => getSkill(p)?.name).join(', ')}</span>}
                  <div className="skill-tile__paths">{s.paths.length === 4 ? <span className="chip chip--xs">All paths</span> : s.paths.map((p) => <PathTag key={p} path={p} />)}</div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="home-grid home-grid--even section">
        <Panel title="Misconceptions spotted">
          {obs.misconceptions.length === 0 ? (
            <p className="muted small">When a wrong answer points to a specific misunderstanding, it's listed here so you can tackle the cause, not just the question.</p>
          ) : (
            <ul className="mis-list">
              {obs.misconceptions.map((m) => (
                <li key={m.text}><span className="reinforce__count tabular">×{m.count}</span><span>{m.text}</span><span className="subtle small">{new Date(m.lastAt).toLocaleDateString()}</span></li>
              ))}
            </ul>
          )}
          {obs.confidentlyWrong > 0 && <p className="subtle small mis-note">{obs.confidentlyWrong} wrong {obs.confidentlyWrong === 1 ? 'answer was' : 'answers were'} marked “Certain”. Those are the most useful to revisit.</p>}
        </Panel>

        <Panel title="Recent answers">
          {recent.length === 0 ? (
            <EmptyState title="No answers yet" action={<Link to="/learn" className="link-quiet">Start a lesson →</Link>}>Your attempts will appear here.</EmptyState>
          ) : (
            <ul className="history">
              {recent.map((e) => {
                const Icon = e.type === 'reveal' ? Eye : e.correct === null ? MessageSquareText : e.correct ? CheckCircle2 : XCircle;
                return (
                  <li key={e.id} data-result={e.type === 'reveal' ? 'reveal' : e.correct === null ? 'note' : e.correct ? 'ok' : 'bad'}>
                    <Icon size={16} aria-hidden="true" />
                    <span className="history__text">
                      <strong>{getLesson(e.lessonId)?.title ?? e.lessonId}</strong>
                      <span className="subtle">{e.type === 'reveal' ? 'Solution shown' : e.answer}</span>
                    </span>
                    <span className="subtle small history__meta">{e.context === 'review' ? 'Review · ' : ''}{new Date(e.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <section className="section" aria-labelledby="evidence-h">
        <div className="section__head"><h2 id="evidence-h">Learning Evidence</h2><p className="muted">A portable record for each lesson you've started. Full export options are at the end of each lesson.</p></div>
        {started.length === 0 ? (
          <p className="muted small">Nothing to export yet.</p>
        ) : (
          <ul className="evidence-list">
            {started.map((l) => (
              <li key={l.id}>
                <span><strong>{l.title}</strong> <MasteryPill status={lessonResult(events, l).status} /></span>
                <Button size="sm" variant="ghost" onClick={async () => toast((await copyText(evidenceToMarkdown(buildEvidence(events, l, LESSONS, settings.profile, new Date(), LAB_EXERCISES)))) ? 'Evidence copied' : 'Copy was blocked by the browser')}>
                  <Copy size={14} aria-hidden="true" /> Copy
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
