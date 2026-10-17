import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { buildSearchIndex, search } from './search';

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const index = useMemo(buildSearchIndex, []);
  const results = useMemo(() => search(index, query), [index, query]);
  const navigate = useNavigate();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal?.();
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
    if (!open && d.open) d.close?.();
  }, [open]);

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <dialog ref={ref} className="dialog search" aria-label="Search" onClose={onClose} onCancel={onClose}>
      <div className="search__bar">
        <Search size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          className="search__input"
          type="search"
          placeholder="Search lessons, skills, paths and glossary terms"
          aria-label="Search"
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${active}` : undefined}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === 'Enter' && results[active]) go(results[active].to);
          }}
        />
        <kbd>Esc</kbd>
      </div>
      <ul id="search-results" className="search__results" role="listbox" aria-label="Results">
        {query && results.length === 0 && <li className="search__empty">No matches for “{query}”. Try a shorter word, like “API” or “chess”.</li>}
        {!query && <li className="search__empty">Try “JSON”, “budget”, “agent” or “404”.</li>}
        {results.map((r, i) => (
          <li key={`${r.kind}-${r.title}`} id={`sr-${i}`} role="option" aria-selected={i === active}>
            <button type="button" className="search__result" onClick={() => go(r.to)} onMouseEnter={() => setActive(i)} tabIndex={-1}>
              <span className="search__kind">{r.kind}</span>
              <span className="search__text">
                <strong>{r.title}</strong>
                <span>{r.detail}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </dialog>
  );
}
