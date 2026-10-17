import { Fragment, useMemo } from 'react';
import { detectLang, tokenize, type Lang } from './highlight';

const LANG_LABEL: Record<Lang, string> = { js: 'JavaScript', html: 'HTML', json: 'JSON', text: 'Output' };

/** A code panel with a title bar, line numbers and syntax colors. Optional gap marker for fill-in exercises. */
export function CodeBlock({ code, lang, label, gap }: { code: string; lang?: Lang; label?: string; gap?: React.ReactNode }) {
  const language = lang ?? detectLang(code);
  const lines = useMemo(() => {
    const parts = gap ? code.split('___') : [code];
    // Tokenize each side of the gap separately, then split into lines.
    const tokens = parts.flatMap((p, i) => [...tokenize(p, language), ...(i < parts.length - 1 ? [{ type: 'gap' as const, text: '' }] : [])]);
    const rows: (typeof tokens)[] = [[]];
    for (const t of tokens) {
      const segs = t.text.split('\n');
      segs.forEach((seg, i) => {
        if (i > 0) rows.push([]);
        if (seg || t.type === 'gap') rows[rows.length - 1]!.push({ ...t, text: seg });
      });
    }
    return rows;
  }, [code, language, gap]);

  return (
    <figure className="code">
      <figcaption className="code__bar">
        <span className="code__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="code__label">{label ?? LANG_LABEL[language]}</span>
      </figcaption>
      <div className="code__scroll" tabIndex={0} role="region" aria-label={`${label ?? LANG_LABEL[language]} code`}>
        <pre className="code__pre">
          <code>
            {lines.map((row, i) => (
              <span key={i} className="code__line">
                <span className="code__ln" aria-hidden="true">{i + 1}</span>
                <span className="code__src">
                  {row.length === 0 ? '​' : row.map((t, j) => (
                    <Fragment key={j}>{t.type === 'gap' ? gap : <span className={`tk-${t.type}`}>{t.text}</span>}</Fragment>
                  ))}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </figure>
  );
}
