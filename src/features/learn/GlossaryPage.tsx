import { useMemo, useState } from 'react';
import { PageHeader } from '@/design/components';
import { GLOSSARY } from '@/content/glossary';
import { slug } from '@/app/search';
import { useScrollToHash } from '@/app/useScrollToHash';

export function GlossaryPage() {
  useScrollToHash();
  const [filter, setFilter] = useState('');
  const terms = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return [...GLOSSARY]
      .sort((a, b) => a.term.localeCompare(b.term))
      .filter((t) => !q || t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [filter]);

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Learn', to: '/learn' }, { label: 'Glossary' }]}
        title="Glossary"
        description="Plain-language definitions. Lessons introduce each term in context; this is the place to look one up again."
      />
      <div className="field" style={{ maxWidth: 420, marginBottom: 'var(--space-5)' }}>
        <label htmlFor="glossary-filter" className="field__label">Filter terms</label>
        <input id="glossary-filter" className="input" type="search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="e.g. token, API, server" />
      </div>
      {terms.length === 0 && <p className="muted">No terms match “{filter}”.</p>}
      <dl className="glossary">
        {terms.map((t) => (
          <div key={t.term} id={slug(t.term)} className="glossary__item">
            <dt>{t.term}</dt>
            <dd>
              {t.definition}
              {t.related && <span className="subtle glossary__related">Related: {t.related.join(', ')}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
