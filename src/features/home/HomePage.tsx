import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, RotateCcw, Play, Repeat, Sparkles, SquareTerminal } from 'lucide-react';
import { Panel, ButtonLink, EmptyState, PathTag, Planned, MasteryPill } from '@/design/components';
import { LessonArt } from '@/design/illustrations/LessonArt';
import { PathArt } from '@/design/illustrations/PathArt';
import { PATHS } from '@/content/paths';
import { LESSONS, getLesson } from '@/content/lessons';
import { SKILLS } from '@/content/skills';
import { LAB_EXERCISES, getLabExercise } from '@/content/lab/exercises';
import { certificationStatus } from '@/core/learning/certifications';
import { Award } from 'lucide-react';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { recommend, type Recommendation } from '@/core/learning/recommend';
import { dueReviews, upcomingReviews } from '@/core/learning/schedule';
import { skillResult } from '@/core/learning/mastery';
import { observe } from '@/core/learning/observations';
import { lessonResult } from '@/core/learning/mastery';
import { MessageCircleQuestion, Sparkles as Spark } from 'lucide-react';

const KIND = {
  lab: { label: 'Code Lab project', icon: SquareTerminal },
  review: { label: 'Review', icon: Repeat },
  retry: { label: 'Try again', icon: RotateCcw },
  continue: { label: 'Continue', icon: Play },
  start: { label: 'New lesson', icon: Sparkles },
} as const;

function linkFor(r: Recommendation) {
  if (r.kind === 'lab') return `/lab/${r.labId}`;
  return r.kind === 'review' ? '/review' : `/learn/lesson/${r.lessonId}`;
}

/** The picture for a recommendation: the lesson's concept art, or the path scene for a project. */
function RecArt({ r, className }: { r: Recommendation; className: string }) {
  return r.kind === 'lab' ? <PathArt path={r.path ?? getLabExercise(r.labId)?.path ?? 'chess'} className={className} /> : <LessonArt lessonId={r.lessonId} className={className} />;
}

function description(r: Recommendation): string | undefined {
  if (r.kind === 'review') return 'One new question on this idea. Answer from memory: your first answer is the one that counts.';
  if (r.kind === 'lab') return getLabExercise(r.labId)?.summary;
  return getLesson(r.lessonId)?.objective;
}

export function HomePage() {
  const { events } = useLearning();
  const { settings, updateLearning, updateProfile } = useSettings();
  const now = new Date();
  const recs = recommend(events, LESSONS, settings.learning.dailyLoad, { labs: LAB_EXERCISES, paths: PATHS, currentPath: settings.learning.currentPath, now });
  const due = dueReviews(events, LESSONS, now);
  const upcoming = upcomingReviews(events, LESSONS, now).slice(0, 3);
  const [first, ...rest] = recs;
  const reinforce = SKILLS.map((s) => skillResult(events, s.id, LESSONS, LAB_EXERCISES)).filter((r) => r.status === 'challenge');
  const obs = observe(events, LESSONS);
  const isNew = events.length === 0;
  const readyCerts = certificationStatus(events, LESSONS, LAB_EXERCISES).filter((c) => c.readiness === 'ready');
  const answered = new Set(settings.profile.observationFeedback.map((f) => f.statement));
  const askAbout = obs.statements.find((s) => !answered.has(s));
  const respond = (statement: string, agreed: boolean) =>
    updateProfile({ observationFeedback: [...settings.profile.observationFeedback, { statement, agreed, at: new Date().toISOString() }].slice(-50) });
  const independentLessons = LESSONS.filter((l) => lessonResult(events, l).status === 'independent').length;
  const SUGGEST = 'suggest:try-first';
  const suggestTryFirst = independentLessons >= 5 && settings.learning.lessonOrder === 'explain-first' && !answered.has(SUGGEST);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <header className="home-head">
        <span className="eyebrow">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        <h1>{isNew ? 'Welcome. Here’s where to start.' : 'Today’s plan'}</h1>
        <p className="page-header__desc">
          {settings.learning.dailyLoad} {settings.learning.dailyLoad === 1 ? 'activity' : 'activities'} picked from your progress, most useful first.{' '}
          <Link to="/settings#learning" className="link-quiet">Change daily load</Link>
        </p>
      </header>

      <div className="home-grid">
        <section aria-labelledby="plan-h" className="plan">
          <h2 id="plan-h" className="visually-hidden">Recommended activities</h2>
          {first && (
            <Link to={linkFor(first)} className="feature-card">
              <RecArt r={first} className="feature-card__art" />
              <div className="feature-card__body">
                <span className="kind-tag" data-kind={first.kind}>
                  {(() => { const I = KIND[first.kind].icon; return <I size={13} aria-hidden="true" />; })()}
                  {KIND[first.kind].label}
                </span>
                <h3>{first.title}</h3>
                <p className="muted">{description(first)}</p>
                <div className="feature-card__why"><span className="eyebrow">Why this</span><span>{first.reason}</span></div>
                <span className="btn btn--primary feature-card__cta">
                  {first.kind === 'review' ? 'Start review' : first.kind === 'lab' ? 'Open project' : first.kind === 'start' ? 'Start lesson' : 'Open lesson'} <ArrowRight size={16} aria-hidden="true" />
                </span>
              </div>
            </Link>
          )}
          {rest.length > 0 && (
            <ul className="plan-list-rows">
              {rest.map((r) => {
                const I = KIND[r.kind].icon;
                return (
                  <li key={`${r.kind}-${r.kind === 'lab' ? r.labId : r.lessonId}`}>
                    <Link to={linkFor(r)} className="plan-row">
                      <RecArt r={r} className="plan-row__art" />
                      <span className="plan-row__text">
                        <span className="kind-tag kind-tag--quiet" data-kind={r.kind}><I size={12} aria-hidden="true" />{KIND[r.kind].label}</span>
                        <strong>{r.title}</strong>
                        <span className="subtle">{r.reason}</span>
                      </span>
                      <ArrowRight size={16} className="plan-row__arrow" aria-hidden="true" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="home-side">
          <Panel title="Reviews" action={<CalendarClock size={18} className="subtle" aria-hidden="true" />}>
            {due.length > 0 ? (
              <div className="stack">
                <p><strong className="big-number tabular">{due.length}</strong> <span className="muted">{due.length === 1 ? 'question is' : 'questions are'} due now.</span></p>
                <ButtonLink to="/review" variant="primary">Start review <ArrowRight size={16} aria-hidden="true" /></ButtonLink>
              </div>
            ) : upcoming.length > 0 ? (
              <p className="muted">Nothing due right now. That's the point: reviews come back just as you're about to forget.</p>
            ) : (
              <EmptyState title="Nothing to review yet">Finish a lesson and its first review is scheduled for two days later.</EmptyState>
            )}
            {upcoming.length > 0 && (
              <ul className="upcoming">
                {upcoming.map((u) => (
                  <li key={u.lessonId}>
                    <span className="upcoming__date tabular">{fmt(u.dueAt)}</span>
                    <span>{getLesson(u.lessonId)?.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {!settings.profile.onboarded && (
            <div className="nudge">
              <Spark size={18} aria-hidden="true" className="nudge__icon" />
              <div>
                <strong>How do you learn best?</strong>
                <p className="small muted">Four quick questions, all skippable. Lessons start from your answers and adjust to what actually works for you.</p>
                <div className="btn-row">
                  <ButtonLink to="/welcome" variant="primary">Start (2 min)</ButtonLink>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => updateProfile({ onboarded: true })}>Not now</button>
                </div>
              </div>
            </div>
          )}

          {askAbout && (
            <div className="nudge nudge--ask">
              <MessageCircleQuestion size={18} aria-hidden="true" className="nudge__icon" />
              <div>
                <strong>Something we noticed</strong>
                <p className="small">{askAbout}</p>
                <p className="small muted">Does that match your experience?</p>
                <div className="btn-row">
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => respond(askAbout, true)}>Yes, that's right</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => respond(askAbout, false)}>Not really</button>
                </div>
              </div>
            </div>
          )}

          {suggestTryFirst && (
            <div className="nudge">
              <Spark size={18} aria-hidden="true" className="nudge__icon" />
              <div>
                <strong>Ready for more challenge?</strong>
                <p className="small muted">You've finished {independentLessons} lessons on your own. Trying a question before reading the explanation can make ideas stick better. Want lessons to start with a question?</p>
                <div className="btn-row">
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => { updateLearning({ lessonOrder: 'try-first' }); respond(SUGGEST, true); }}>Yes, try first</button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => respond(SUGGEST, false)}>Keep it as is</button>
                </div>
              </div>
            </div>
          )}

          {!settings.learning.currentPath && (
            <div className="choose-path">
              <span className="eyebrow">Choose a path</span>
              <p className="small muted">Pick the project you most want to build. Home will then suggest its next steps. You can switch any time.</p>
              <div className="choose-path__list">
                {PATHS.map((p) => (
                  <button key={p.id} type="button" className="choose-path__opt" data-path={p.id} onClick={() => updateLearning({ currentPath: p.id })}>
                    <PathArt path={p.id} className="choose-path__art" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {readyCerts.length > 0 && (
            <Link to="/progress/certifications" className="cert-home">
              <Award size={22} aria-hidden="true" />
              <span>
                <span className="eyebrow">Consider getting certified</span>
                <strong>{readyCerts[0]!.cert.name}</strong>
                <span className="subtle small">{readyCerts[0]!.cert.provider} · {readyCerts[0]!.cert.cost === 'free' ? 'Free' : readyCerts[0]!.cert.price}{readyCerts.length > 1 ? ` · and ${readyCerts.length - 1} more` : ''}</span>
              </span>
            </Link>
          )}

          <Panel title="Needs another try">
            {reinforce.length === 0 && obs.misconceptions.length === 0 ? (
              <p className="muted small">{isNew ? 'This fills in from your answers, not from which lessons you’ve opened.' : 'Nothing flagged. Skills that slip in a review will show up here.'}</p>
            ) : (
              <ul className="reinforce">
                {reinforce.map((r) => (
                  <li key={r.skillId}>
                    <MasteryPill status="challenge" />
                    <span><strong>{SKILLS.find((s) => s.id === r.skillId)?.name}</strong> <span className="subtle">{r.reason}</span></span>
                  </li>
                ))}
                {obs.misconceptions.slice(0, 3).map((m) => (
                  <li key={m.text} className="reinforce__mis">
                    <span className="reinforce__count tabular" title="Times seen">×{m.count}</span>
                    <span>{m.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <section className="section" aria-labelledby="projects-h">
        <div className="section__head section__head--row">
          <div>
            <h2 id="projects-h">Your projects</h2>
            <p className="muted">Explore any of them. Skills you master in one carry over to the others.</p>
          </div>
          <Link to="/learn" className="link-quiet">All paths <ArrowRight size={14} aria-hidden="true" /></Link>
        </div>
        <div className="path-grid">
          {PATHS.map((p) => (
            <Link key={p.id} to={`/learn/path/${p.id}`} className="path-card">
              <PathArt path={p.id} className="path-card__art" />
              <div className="path-card__text">
                <PathTag path={p.id} />
                <h3>{p.name}</h3>
                <p>{p.project}</p>
              </div>
              <div className="path-card__foot">
                <span className="subtle">First milestone</span>
                <span className="tabular">{p.timeline.early}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <Panel as="div" className="lab-teaser">
          <SquareTerminal size={22} className="lab-teaser__icon" aria-hidden="true" />
          <div>
            <h2 className="panel__title">Code Lab</h2>
            <p className="muted small">Write and run HTML, CSS and JavaScript in a safe sandbox.</p>
          </div>
          <Planned phase={3}>Coming next.</Planned>
        </Panel>
      </section>
    </>
  );
}
