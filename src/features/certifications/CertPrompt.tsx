import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { useLearning } from '@/core/learning/LearningContext';
import { certificationStatus, certsUnlockedBySkill } from '@/core/learning/certifications';

/** Shown after finishing work on a skill: certifications whose skills are now all demonstrated. */
export function CertPrompt({ skillId }: { skillId: string }) {
  const { events } = useLearning();
  const ready = certsUnlockedBySkill(certificationStatus(events, LESSONS, LAB_EXERCISES), skillId);
  if (ready.length === 0) return null;
  return (
    <div className="cert-prompt" role="status">
      <Award size={20} aria-hidden="true" className="cert-prompt__icon" />
      <div className="cert-prompt__body">
        <strong>You've demonstrated every skill for {ready.length === 1 ? 'a certification' : `${ready.length} certifications`}.</strong>
        <ul>{ready.map((r) => <li key={r.cert.id}>{r.cert.name} <span className="subtle">({r.cert.provider}, {r.cert.cost === 'free' ? 'free' : r.cert.price})</span></li>)}</ul>
        <Link to="/progress/certifications" className="link-quiet">See what each one involves <ArrowRight size={14} aria-hidden="true" /></Link>
      </div>
    </div>
  );
}
