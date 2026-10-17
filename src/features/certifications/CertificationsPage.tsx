import { ExternalLink, Award, AlertTriangle, CircleCheck, CircleDashed, Circle } from 'lucide-react';
import { PageHeader, Notice } from '@/design/components';
import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { getSkill } from '@/content/skills';
import { VERIFIED_ON } from '@/content/certifications';
import { useLearning } from '@/core/learning/LearningContext';
import { certificationStatus, type CertStatus, type Readiness } from '@/core/learning/certifications';

const GROUPS: { key: Readiness; title: string; intro: string }[] = [
  { key: 'ready', title: 'Ready to consider', intro: 'You\'ve demonstrated every skill these rely on. Check what else each one needs before booking.' },
  { key: 'building', title: 'Building toward', intro: 'You\'ve started on the skills these need.' },
  { key: 'unavailable', title: 'Skills ready, but not open to you yet', intro: 'You have the skills, but the provider limits who can take these right now.' },
  { key: 'later', title: 'Later on your path', intro: 'These rely on skills you haven\'t started yet.' },
];
const COST = { free: 'Free', paid: 'Paid exam', subscription: 'Subscription' } as const;
const LEVEL = { starter: 'Starter', foundational: 'Foundational', professional: 'Professional' } as const;
const verified = new Date(VERIFIED_ON + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

function CertCard({ s }: { s: CertStatus }) {
  const { cert } = s;
  return (
    <article className="cert-card" data-readiness={s.readiness}>
      <header className="cert-card__head">
        <div>
          <span className="cert-card__provider">{cert.provider}</span>
          <h3>{cert.name}</h3>
        </div>
        <div className="cert-card__chips">
          <span className="chip" data-cost={cert.cost}>{COST[cert.cost]}</span>
          <span className="chip">{LEVEL[cert.level]}</span>
        </div>
      </header>
      <p className="muted small">{cert.value}</p>
      <dl className="cert-card__facts">
        <div><dt>Cost</dt><dd>{cert.price}</dd></div>
        <div><dt>Format</dt><dd>{cert.format}</dd></div>
        <div><dt>Effort</dt><dd>{cert.effort}</dd></div>
      </dl>
      <div className="cert-card__skills">
        <span className="eyebrow">Skills from your academy</span>
        <ul>
          {cert.skills.map((id) => {
            const state = s.done.includes(id) ? 'done' : s.inProgress.includes(id) ? 'progress' : 'todo';
            const Icon = state === 'done' ? CircleCheck : state === 'progress' ? CircleDashed : Circle;
            return <li key={id} data-state={state}><Icon size={14} aria-hidden="true" /><span>{getSkill(id)?.name ?? id}</span><span className="visually-hidden">{state === 'done' ? ' (demonstrated)' : state === 'progress' ? ' (in progress)' : ' (not started)'}</span></li>;
          })}
        </ul>
      </div>
      {cert.alsoNeeds.length > 0 && (
        <div className="cert-card__also"><span className="eyebrow">Also prepare</span><ul>{cert.alsoNeeds.map((n) => <li key={n}>{n}</li>)}</ul></div>
      )}
      {cert.availability && <Notice kind="warn">{cert.availability}</Notice>}
      <footer className="cert-card__foot">
        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">Visit provider <ExternalLink size={13} aria-hidden="true" /></a>
        <details className="cert-card__sources">
          <summary>Sources</summary>
          <ul>{cert.sources.map((u) => <li key={u}><a href={u} target="_blank" rel="noopener noreferrer">{u.replace(/^https?:\/\//, '')}</a></li>)}</ul>
        </details>
      </footer>
    </article>
  );
}

export function CertificationsPage() {
  const { events } = useLearning();
  const statuses = certificationStatus(events, LESSONS, LAB_EXERCISES);
  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'My Progress', to: '/progress' }, { label: 'Certifications' }]}
        title="Certifications"
        description="As you demonstrate skills here, matching certifications move up this list. Each one shows what it proves, what it costs and what else to prepare."
      />
      <Notice kind="info">
        <strong>What “ready to consider” means:</strong> you've shown every related skill in this academy on your own. Most certifications also need projects or study beyond it, listed under “Also prepare”.
        Details were checked on {verified}. Prices and exams change, so confirm on the provider's site before paying.
      </Notice>
      {GROUPS.map((g) => {
        const list = statuses.filter((s) => s.readiness === g.key);
        if (list.length === 0) return null;
        return (
          <section key={g.key} className="section" aria-labelledby={`cert-${g.key}`}>
            <div className="section__head">
              <h2 id={`cert-${g.key}`}>{g.key === 'ready' && <Award size={20} aria-hidden="true" className="cert-h-icon" />}{g.title} <span className="subtle tabular">({list.length})</span></h2>
              <p className="muted">{g.intro}</p>
            </div>
            <div className="cert-grid">{list.map((s) => <CertCard key={s.cert.id} s={s} />)}</div>
          </section>
        );
      })}
      {statuses.every((s) => s.readiness !== 'ready') && (
        <p className="subtle small cert-foot"><AlertTriangle size={14} aria-hidden="true" /> Nothing is ready yet. The quickest win: the free AI Fluency badge needs “AI literacy” and “Describing what you want”, two short lessons.</p>
      )}
    </>
  );
}
