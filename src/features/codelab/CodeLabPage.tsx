import { Link, useParams } from 'react-router-dom';
import { Hammer, Bug, Eye, Recycle, Sparkles, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { PageHeader, MasteryPill } from '@/design/components';
import { LAB_EXERCISES, getLabExercise } from '@/content/lab/exercises';
import { getSkill } from '@/content/skills';
import { useLearning } from '@/core/learning/LearningContext';
import { labResult } from '@/core/learning/mastery';
import { NotFoundPage } from '@/app/NotFoundPage';
import { LabWorkspace } from './LabWorkspace';
import './codelab.css';

const KIND = {
  build: { label: 'Build', icon: Hammer },
  debug: { label: 'Debug', icon: Bug },
  predict: { label: 'Predict', icon: Eye },
  refactor: { label: 'Refactor', icon: Recycle },
  playground: { label: 'Playground', icon: Sparkles },
} as const;

export function CodeLabPage() {
  const { exerciseId } = useParams();
  if (exerciseId) {
    const ex = getLabExercise(exerciseId);
    return ex ? <LabWorkspace key={ex.id} exercise={ex} /> : <NotFoundPage />;
  }
  return <LabHome />;
}

function LabHome() {
  const { events } = useLearning();
  const exercises = LAB_EXERCISES.filter((x) => x.kind !== 'playground');
  const playground = LAB_EXERCISES.find((x) => x.kind === 'playground');
  return (
    <>
      <PageHeader
        eyebrow="Code Lab"
        title="Write, run and debug code"
        description="Real HTML, CSS and JavaScript, running in a sealed preview. Each exercise has acceptance criteria that are checked automatically."
      />
      <div className="lab-intro">
        <ShieldCheck size={18} aria-hidden="true" />
        <p className="small"><strong>Safe to experiment.</strong> <span className="muted">Your code runs in an isolated sandbox: it can't read your saved data, the rest of the app or the internet, and loops that never end are stopped after a second. Your code is saved in this browser as you type.</span></p>
      </div>

      <section className="section section--first" aria-labelledby="ex-h">
        <div className="section__head"><h2 id="ex-h">Exercises</h2><p className="muted">Passing one on your own counts as evidence for its skill.</p></div>
        <div className="lab-list">
          {exercises.map((x) => {
            const K = KIND[x.kind];
            const r = labResult(events, x.id);
            return (
              <Link key={x.id} to={`/lab/${x.id}`} className="lab-card" data-kind={x.kind}>
                <span className="lab-card__icon" aria-hidden="true"><K.icon size={20} /></span>
                <span className="lab-card__body">
                  <span className="lab-card__meta"><span className="lab-kind" data-kind={x.kind}>{K.label}</span>{x.skill && <span className="subtle">{getSkill(x.skill)?.name}</span>}</span>
                  <strong>{x.title}</strong>
                  <span className="muted small">{x.summary}</span>
                  <span className="lab-card__foot">
                    <span className="subtle"><Clock size={12} aria-hidden="true" /> {x.minutes} min · {x.checks.length} checks</span>
                    {r.status !== 'none' && <MasteryPill status={r.status} />}
                  </span>
                </span>
                <ArrowRight size={16} className="lab-card__arrow" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </section>

      {playground && (
        <section className="section" aria-labelledby="pg-h">
          <Link to={`/lab/${playground.id}`} className="lab-playground">
            <Sparkles size={22} aria-hidden="true" />
            <span><strong id="pg-h">Playground</strong><span className="muted small">A blank page to try anything. Nothing is checked.</span></span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      )}
    </>
  );
}
