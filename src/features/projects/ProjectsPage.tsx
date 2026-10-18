import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, ArrowRight, Check } from 'lucide-react';
import { PageHeader, PathTag, ButtonLink } from '@/design/components';
import { PathArt } from '@/design/illustrations/PathArt';
import { PATHS } from '@/content/paths';
import type { PathId } from '@/content/types';
import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES, getLabExercise } from '@/content/lab/exercises';
import { useLearning } from '@/core/learning/LearningContext';
import { useSettings } from '@/core/settings/SettingsContext';
import { pathProgress } from '@/core/learning/milestones';
import { labResult } from '@/core/learning/mastery';
import { loadProjectNotes, saveProjectNotes, type ProjectNotes } from '@/core/projects/notesStore';
import { MilestoneTracker } from '@/features/learn/MilestoneTracker';

const KINDS = [
  { name: 'Exercise', text: 'A small, guided task inside a lesson. It checks one idea.' },
  { name: 'Experiment', text: 'Code you change freely in the Playground to see what happens.' },
  { name: 'Project', text: 'Working software with acceptance criteria, automatic checks, and your own notes on design and known issues.' },
];
const NOTE_FIELDS: { key: keyof ProjectNotes; label: string; placeholder: string }[] = [
  { key: 'design', label: 'Design notes', placeholder: 'Decisions you made and why, e.g. "board is an array of rows"' },
  { key: 'issues', label: 'Known issues', placeholder: 'What doesn\'t work yet, e.g. "pieces can move anywhere"' },
  { key: 'improvements', label: 'Future improvements', placeholder: 'Ideas for later, e.g. "highlight legal moves"' },
];

function Notes({ pathId }: { pathId: PathId }) {
  const { storage } = useSettings();
  const [notes, setNotes] = useState<ProjectNotes>(() => loadProjectNotes(storage, pathId));
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    if (saved) return;
    const t = setTimeout(() => setSaved(saveProjectNotes(storage, pathId, notes)), 500);
    return () => clearTimeout(t);
  }, [notes, saved, storage, pathId]);
  return (
    <div className="project-notes">
      <div className="project-notes__head"><h3 className="lab-h">Your notes</h3><span className="subtle small" role="status">{saved ? 'Saved' : 'Saving…'}</span></div>
      {NOTE_FIELDS.map((f) => (
        <div key={f.key} className="field">
          <label htmlFor={`${pathId}-${f.key}`} className="field__label">{f.label}</label>
          <textarea id={`${pathId}-${f.key}`} className="input textarea textarea--sm" maxLength={5000} value={notes[f.key]} placeholder={f.placeholder}
            onChange={(e) => { setNotes((n) => ({ ...n, [f.key]: e.target.value })); setSaved(false); }} />
        </div>
      ))}
    </div>
  );
}

export function ProjectsPage() {
  const { events } = useLearning();
  const { settings } = useSettings();
  const current = settings.learning.currentPath;
  const [open, setOpen] = useState<PathId>(current ?? 'chess');
  const ordered = [...PATHS].sort((a, b) => (a.id === current ? -1 : b.id === current ? 1 : 0));
  const active = PATHS.find((p) => p.id === open)!;
  const prog = pathProgress(events, active, LESSONS, LAB_EXERCISES);

  return (
    <>
      <PageHeader eyebrow="Projects" title="Your four projects" description="Each project has milestones that end in working software, checked automatically, plus your own notes on design and known issues." />

      <div className="kinds" role="list" aria-label="Kinds of work">
        {KINDS.map((k) => <div key={k.name} className="kind" role="listitem"><strong>{k.name}</strong><span className="muted">{k.text}</span></div>)}
      </div>

      <div className="project-tabs" role="tablist" aria-label="Projects">
        {ordered.map((p) => {
          const pp = pathProgress(events, p, LESSONS, LAB_EXERCISES);
          const complete = pp.milestones.filter((m) => m.state === 'complete').length;
          return (
            <button key={p.id} type="button" role="tab" aria-selected={open === p.id} className="project-tab" data-path={p.id} onClick={() => setOpen(p.id)}>
              <PathArt path={p.id} className="project-tab__art" />
              <span className="project-tab__text">
                <strong>{p.name}</strong>
                <span className="subtle small">{p.id === current ? 'Your path · ' : ''}{complete} of {p.milestones.length} milestones</span>
              </span>
            </button>
          );
        })}
      </div>

      <section className="project-workspace" role="tabpanel" aria-label={active.name}>
        <div className="project-workspace__main">
          <div className="project-workspace__head">
            <div><h2>{active.name}</h2><PathTag path={active.id} /></div>
            <Link to={`/learn/path/${active.id}`} className="link-quiet">Path details <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <p className="muted">{active.project}.</p>
          {prog.current?.milestone.project && (() => {
            const lab = getLabExercise(prog.current!.milestone.project!)!;
            const passed = labResult(events, lab.id).passed;
            return (
              <div className="project-deliverable">
                <Flag size={18} aria-hidden="true" />
                <div>
                  <span className="eyebrow">Current deliverable · {prog.current!.milestone.title}</span>
                  <strong>{lab.title}</strong>
                  <span className="muted small">{lab.summary}</span>
                </div>
                {passed ? <span className="chip chip--status" data-status="independent"><Check size={12} aria-hidden="true" /> Checks pass</span> : <ButtonLink to={`/lab/${lab.id}`} variant="primary">Open in Code Lab</ButtonLink>}
              </div>
            );
          })()}
          <MilestoneTracker path={active} />
        </div>
        <aside className="project-workspace__side"><Notes key={active.id} pathId={active.id} /></aside>
      </section>
    </>
  );
}
