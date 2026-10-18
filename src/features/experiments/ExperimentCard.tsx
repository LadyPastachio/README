import { Link } from 'react-router-dom';
import { FlaskConical, ArrowRight, CircleCheck } from 'lucide-react';
import type { Experiment } from '@/content/experiments/schema';
import { useSettings } from '@/core/settings/SettingsContext';
import { loadExperimentProgress } from '@/core/experiments/progressStore';
import './experiments.css';

/** A card that starts (or continues) a guided experiment. Used in lessons and the Code Lab. */
export function ExperimentCard({ x, compact = false }: { x: Experiment; compact?: boolean }) {
  const { storage } = useSettings();
  const pr = loadExperimentProgress(storage, x.id);
  const done = pr ? x.steps.filter((s) => pr.completed.includes(s.id)).length : 0;
  const finished = !!pr?.finishedAt;
  const label = finished ? 'Open again' : done > 0 || pr ? 'Continue' : 'Start the experiment';
  return (
    <Link to={`/lab/experiment/${x.id}`} className="xp-card" data-compact={compact || undefined}>
      <span className="xp-card__icon" aria-hidden="true"><FlaskConical size={20} /></span>
      <span className="xp-card__body">
        <span className="eyebrow">Guided experiment · {x.minutes} min · {x.steps.length} steps</span>
        <strong className="xp-card__title">{x.title}</strong>
        {!compact && <span className="muted small">{x.intro}</span>}
        <span className="xp-card__foot">
          {finished ? <span className="xp-card__status"><CircleCheck size={14} aria-hidden="true" /> Completed</span> : done > 0 ? <span className="subtle small">{done} of {x.steps.length} steps done</span> : <span className="subtle small">Edit real code and see it change. No setup needed.</span>}
          <span className="xp-card__cta">{label} <ArrowRight size={14} aria-hidden="true" /></span>
        </span>
      </span>
    </Link>
  );
}
