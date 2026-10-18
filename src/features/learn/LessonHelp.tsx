import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Feather, Lightbulb, ListOrdered, FileCode2, Network, Columns2, FlaskConical, Target, X, ArrowRight } from 'lucide-react';
import type { Lesson } from '@/content/schema';
import { Button, CodeBlock } from '@/design/components';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { availableHelp, chooseAutoOpen, HELP_LABELS, type HelpKind, type AutoOpen } from '@/core/learning/help';
import { saveWorkspace } from '@/core/lab/workspaceStore';
import { RequestDiagram } from './RequestDiagram';
import { ExplainTask } from './Activities';
import { experimentFiles } from './experiment';
import { experimentsForLesson } from '@/content/experiments';
import { ExperimentCard } from '@/features/experiments/ExperimentCard';
import type { ActivityContext } from './useActivity';

const ICONS: Record<HelpKind, typeof Feather> = {
  simpler: Feather, analogy: Lightbulb, steps: ListOrdered, example: FileCode2,
  diagram: Network, compare: Columns2, experiment: FlaskConical, challenge: Target,
};
const SHORT: Record<HelpKind, string> = {
  simpler: 'Simpler', analogy: 'Analogy', steps: 'Step by step', example: 'Another example',
  diagram: 'Diagram', compare: 'Compare', experiment: 'Experiment', challenge: 'Challenge me',
};

interface HelpCtx {
  lesson: Lesson;
  ctx: ActivityContext;
  offered: HelpKind[];
  active: HelpKind | null;
  setActive: (k: HelpKind | null) => void;
  /** Opens an explanation. how = whether the learner asked, or it was offered because they were stuck. */
  open: (kind: HelpKind, how?: 'asked' | 'stuck') => void;
  autoNote: AutoOpen | null;
  panelRef: React.RefObject<HTMLElement | null>;
}
const LessonHelpContext = createContext<HelpCtx | null>(null);
/** Lets activities offer "see it another way" when you're stuck. null outside lessons (e.g. reviews). */
export const useLessonHelp = () => useContext(LessonHelpContext);

export function LessonHelpProvider({ lesson, ctx, children }: { lesson: Lesson; ctx: ActivityContext; children: ReactNode }) {
  const { events, record } = useLearning();
  const { settings } = useSettings();
  const offered = availableHelp(lesson);
  // Decided once per visit: evidence of what helps you, then what you said, then your detail preference.
  const [auto] = useState<AutoOpen | null>(() => {
    const a = chooseAutoOpen(lesson, settings.profile, events);
    if (a) return a;
    return settings.profile.detailLevel === 'detailed' ? { kind: 'steps', because: 'you-said' } : null;
  });
  const [active, setActive] = useState<HelpKind | null>(auto?.kind ?? null);
  const [autoNote, setAutoNote] = useState(auto);
  const recorded = useRef(new Set<HelpKind>());
  const panelRef = useRef<HTMLElement | null>(null);

  const log = (kind: HelpKind, how: 'asked' | 'auto' | 'stuck') => {
    if (recorded.current.has(kind)) return;
    recorded.current.add(kind);
    record({ ...ctx, type: 'help', activityId: `help:${kind}`, kind: 'explain', correct: null, answer: `${HELP_LABELS[kind]} (${how})`, confidence: null, misconception: null, selfCheck: null });
  };
  const autoLogged = useRef(false);
  useEffect(() => {
    if (auto && !autoLogged.current) { autoLogged.current = true; log(auto.kind, 'auto'); }
  });

  const open = (kind: HelpKind, how: 'asked' | 'stuck' = 'asked') => {
    setActive(kind);
    setAutoNote(null);
    log(kind, how);
    requestAnimationFrame(() => panelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <LessonHelpContext.Provider value={{ lesson, ctx, offered, active, setActive, open, autoNote, panelRef }}>
      {children}
    </LessonHelpContext.Provider>
  );
}

/** The "See it another way" panel. Place it inside <LessonHelpProvider>. */
export function LessonHelpPanel() {
  const help = useLessonHelp();
  if (!help) return null;
  const { lesson, ctx, active, setActive, open, offered, autoNote, panelRef } = help;
  const alt = lesson.alternatives;
  return (
    <section className="help" aria-labelledby="help-h" ref={panelRef} id="lesson-help">
      <div className="help__head">
        <h2 id="help-h">See it another way</h2>
        <p className="subtle small">Pick whatever helps. Using these is never counted against you.</p>
      </div>
      <div className="help__controls" role="toolbar" aria-label="Lesson controls">
        {offered.map((k) => {
          const Icon = ICONS[k];
          return (
            <button key={k} type="button" className="help__btn" aria-pressed={active === k} onClick={() => (active === k ? setActive(null) : open(k))} title={HELP_LABELS[k]}>
              <Icon size={15} aria-hidden="true" /><span>{SHORT[k]}</span>
            </button>
          );
        })}
      </div>
      {active && (
        <div className="help__card" data-kind={active}>
          <div className="help__card-head">
            <strong>{HELP_LABELS[active]}</strong>
            <Button size="sm" variant="ghost" icon onClick={() => setActive(null)} aria-label="Close"><X size={15} aria-hidden="true" /></Button>
          </div>
          {autoNote && autoNote.kind === active && (
            <p className="help__auto">
              Opened for you because {autoNote.because === 'it-helped' ? `you've tended to answer better after using “${SHORT[active].toLowerCase()}”` : 'of what you said about how you learn'}.{' '}
              <Link to="/settings#profile">Change this</Link>
            </p>
          )}
          {active === 'simpler' && <div className="prose">{alt.simpler.map((p) => <p key={p}>{p}</p>)}</div>}
          {active === 'analogy' && <blockquote className="help__analogy">{alt.analogy}</blockquote>}
          {active === 'steps' && <Steps steps={alt.steps} />}
          {active === 'example' && (
            <div className="help__stack">
              <p>{alt.example.intro}</p>
              {alt.example.code && <CodeBlock code={alt.example.code} />}
              <p className="muted">{alt.example.explanation}</p>
            </div>
          )}
          {active === 'diagram' && <RequestDiagram />}
          {active === 'compare' && alt.compare && (
            <div className="help__stack">
              <p><strong>{alt.compare.title}</strong></p>
              <div className="help__compare">
                <CodeBlock code={alt.compare.a.code} label={alt.compare.a.label} />
                <CodeBlock code={alt.compare.b.code} label={alt.compare.b.label} />
              </div>
              <ul>{alt.compare.points.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          )}
          {active === 'experiment' && <Experiment lesson={lesson} />}
          {active === 'challenge' && (
            <div className="help__stack">
              <p className="muted small">A new situation, no answer shown first. Your response is saved as transfer evidence for this lesson.</p>
              <ExplainTask activity={{ kind: 'explain', id: 'transfer', prompt: alt.challenge.prompt, lookFor: alt.challenge.lookFor }} ctx={ctx} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Steps({ steps }: { steps: string[] }) {
  const [shown, setShown] = useState(1);
  return (
    <div className="help__steps">
      <ol>{steps.slice(0, shown).map((s, i) => <li key={s} className={i === shown - 1 ? 'is-new' : undefined}>{s}</li>)}</ol>
      <div className="btn-row">
        {shown < steps.length ? (
          <>
            <Button size="sm" variant="primary" onClick={() => setShown((n) => n + 1)}>Next step <ArrowRight size={14} aria-hidden="true" /></Button>
            <Button size="sm" variant="ghost" onClick={() => setShown(steps.length)}>Show all</Button>
          </>
        ) : <span className="subtle small">That's every step. Try the practice below.</span>}
      </div>
    </div>
  );
}

function Experiment({ lesson }: { lesson: Lesson }) {
  const { storage } = useSettings();
  const navigate = useNavigate();
  const examples = [...lesson.sections.filter((s) => s.code).map((s) => ({ label: s.heading, code: s.code! })), ...(lesson.alternatives.example.code ? [{ label: 'Another example', code: lesson.alternatives.example.code }] : [])];
  const go = (code: string) => {
    saveWorkspace(storage, 'playground', { files: experimentFiles(code) });
    navigate('/lab/playground');
  };
  return (
    <div className="help__stack">
      {experimentsForLesson(lesson.id).map((x) => <ExperimentCard key={x.id} x={x} compact />)}
      <p className="muted">Or open any example from this lesson in the Code Lab playground, change it, and see what happens. Your lesson stays here when you come back.</p>
      <ul className="help__experiments">
        {examples.map((e) => (
          <li key={e.label}><span>{e.label}</span><Button size="sm" onClick={() => go(e.code)}><FlaskConical size={14} aria-hidden="true" /> Open in Code Lab</Button></li>
        ))}
      </ul>
    </div>
  );
}
