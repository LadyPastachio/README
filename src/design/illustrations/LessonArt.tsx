/**
 * Small concept pictures for lessons. Each one shows the idea itself:
 * labelled boxes for variables, a fork for conditions, indexed cells for
 * arrays. Unknown lessons fall back to a neutral card.
 */

type Hue = 'web' | 'finance' | 'chess' | 'automation';
const HUE: Record<string, Hue> = {
  'how-a-page-reaches-you': 'chess',
  'values-and-variables': 'web',
  conditions: 'chess',
  functions: 'finance',
  'arrays-and-objects': 'automation',
  'reading-errors': 'web',
  'json-basics': 'automation',
  'html-structure': 'web',
  'what-a-model-does': 'chess',
  'describing-requirements': 'finance',
};

export function lessonHue(id: string): Hue {
  return HUE[id] ?? 'chess';
}

export function LessonArt({ lessonId, className = '' }: { lessonId: string; className?: string }) {
  const hue = lessonHue(lessonId);
  const c = `var(--path-${hue})`;
  const soft = `var(--path-${hue}-soft)`;
  const card = (x: number, y: number, w: number, h: number, r = 6) => (
    <>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="var(--art-shadow)" transform="translate(2 3)" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill="var(--surface)" />
    </>
  );
  return (
    <div className={`art-frame ${className}`} style={{ background: soft }} aria-hidden="true">
    <svg viewBox="0 0 160 100" className="art" preserveAspectRatio="xMidYMid meet">
      <rect width="160" height="100" fill={soft} />
      {lessonId === 'how-a-page-reaches-you' && (
        <g>
          {card(14, 30, 46, 40)}
          <rect x="14" y="30" width="46" height="9" rx="4" fill="var(--surface-2)" />
          <rect x="21" y="46" width="30" height="4" rx="2" fill="var(--line-strong)" /><rect x="21" y="54" width="22" height="4" rx="2" fill="var(--line)" />
          {card(100, 26, 46, 48)}
          {[38, 48, 58].map((y) => <rect key={y} x="108" y={y} width="30" height="4" rx="2" fill="var(--line)" />)}
          <circle cx="133" cy="66" r="2.5" fill="var(--ok)" />
          <path d="M64 44h30" stroke={c} strokeWidth="2.4" strokeLinecap="round" /><path d="M89 39l6 5-6 5" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M96 58H66" stroke={c} strokeWidth="2.4" strokeLinecap="round" opacity=".5" /><path d="M71 53l-6 5 6 5" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity=".5" />
        </g>
      )}
      {lessonId === 'values-and-variables' && (
        <g>
          {[['budget', '1200'], ['owner', '"Ada"'], ['isOver', 'false']].map(([name, val], i) => (
            <g key={name} transform={`translate(${12 + i * 48} ${30 + (i % 2) * 8})`}>
              <rect x="0" y="0" width="30" height="10" rx="3" fill={c} />
              <text x="15" y="7.6" textAnchor="middle" className="art-text art-text--xs" fill="var(--surface)">{name}</text>
              {card(0, 8, 42, 30, 5)}
              <text x="21" y="28" textAnchor="middle" className="art-mono" fill="var(--ink)">{val}</text>
            </g>
          ))}
        </g>
      )}
      {lessonId === 'conditions' && (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 50h34" stroke="var(--ink-3)" strokeWidth="2.4" />
          <path d="M68 50 C 86 50, 90 26, 112 26" stroke={c} strokeWidth="2.6" />
          <path d="M68 50 C 86 50, 90 74, 112 74" stroke="var(--line-strong)" strokeWidth="2.6" strokeDasharray="4 4" />
          <rect x="50" y="40" width="20" height="20" rx="3" transform="rotate(45 60 50)" fill="var(--surface)" stroke={c} strokeWidth="2" />
          <text x="60" y="53.5" textAnchor="middle" className="art-text art-text--strong" fill={c} stroke="none">?</text>
          <rect x="114" y="16" width="32" height="20" rx="10" fill={c} stroke="none" />
          <text x="130" y="29.5" textAnchor="middle" className="art-text art-text--strong" fill="var(--surface)" stroke="none">true</text>
          <rect x="114" y="64" width="32" height="20" rx="10" fill="var(--surface)" stroke="var(--line-strong)" />
          <text x="130" y="77.5" textAnchor="middle" className="art-text" fill="var(--ink-3)" stroke="none">else</text>
        </g>
      )}
      {lessonId === 'functions' && (
        <g>
          {card(56, 24, 48, 52, 10)}
          <rect x="56" y="24" width="48" height="14" rx="7" fill={c} />
          <text x="80" y="34" textAnchor="middle" className="art-mono art-mono--sm" fill="var(--surface)">double</text>
          <text x="80" y="62" textAnchor="middle" className="art-mono" fill={c}>n × 2</text>
          <rect x="12" y="40" width="26" height="20" rx="5" fill="var(--surface)" stroke="var(--line-strong)" />
          <text x="25" y="54" textAnchor="middle" className="art-mono" fill="var(--ink)">4</text>
          <path d="M40 50h12" stroke="var(--ink-3)" strokeWidth="2.2" strokeLinecap="round" /><path d="M48 46l4 4-4 4" fill="none" stroke="var(--ink-3)" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M108 50h12" stroke={c} strokeWidth="2.2" strokeLinecap="round" /><path d="M116 46l4 4-4 4" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="122" y="40" width="26" height="20" rx="5" fill={c} />
          <text x="135" y="54" textAnchor="middle" className="art-mono" fill="var(--surface)">8</text>
        </g>
      )}
      {lessonId === 'arrays-and-objects' && (
        <g>
          {['e4', 'e5', 'Nf3', 'Nc6'].map((v, i) => (
            <g key={v} transform={`translate(${14 + i * 28} 22)`}>
              <rect width="26" height="22" rx="4" fill={i === 1 ? c : 'var(--surface)'} stroke={i === 1 ? 'none' : 'var(--line-strong)'} />
              <text x="13" y="15" textAnchor="middle" className="art-mono art-mono--sm" fill={i === 1 ? 'var(--surface)' : 'var(--ink)'}>{v}</text>
              <text x="13" y="34" textAnchor="middle" className="art-text art-text--xs" fill="var(--ink-3)">{i}</text>
            </g>
          ))}
          {card(30, 62, 100, 28, 6)}
          <text x="40" y="74" className="art-mono art-mono--sm" fill={c}>amount</text><text x="84" y="74" className="art-mono art-mono--sm" fill="var(--ink)">25</text>
          <text x="40" y="84" className="art-mono art-mono--sm" fill={c}>category</text><text x="84" y="84" className="art-mono art-mono--sm" fill="var(--ink)">"food"</text>
        </g>
      )}
      {lessonId === 'reading-errors' && (
        <g>
          {card(18, 16, 124, 70, 8)}
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <text x="28" y={33 + i * 11} className="art-mono art-mono--sm" fill="var(--ink-3)">{10 + i}</text>
              <rect x="42" y={29 + i * 11} width={[60, 44, 70, 38, 52][i]} height="4" rx="2" fill={i === 2 ? 'var(--danger)' : 'var(--line-strong)'} opacity={i === 2 ? 0.9 : 1} />
            </g>
          ))}
          <rect x="20" y="49" width="120" height="13" fill="var(--danger-soft)" opacity=".7" />
          <rect x="42" y="51" width="70" height="4" rx="2" fill="var(--danger)" />
          <g transform="translate(124 50)">
            <path d="M0 -14l14 24h-28z" fill="var(--warn)" stroke="var(--surface)" strokeWidth="2" strokeLinejoin="round" />
            <rect x="-1.2" y="-6" width="2.4" height="8" rx="1.2" fill="var(--surface)" /><circle cx="0" cy="5.5" r="1.5" fill="var(--surface)" />
          </g>
        </g>
      )}
      {lessonId === 'json-basics' && (
        <g>
          {card(34, 18, 92, 64, 8)}
          <text x="16" y="66" className="art-brace" fill={c}>{'{'}</text>
          <text x="144" y="66" textAnchor="end" className="art-brace" fill={c}>{'}'}</text>
          {[['"lead":', '"Sam"'], ['"budget":', '1200'], ['"new":', 'true']].map(([k, v], i) => (
            <g key={k}>
              <text x="44" y={40 + i * 14} className="art-mono art-mono--sm" fill={c}>{k}</text>
              <text x="116" y={40 + i * 14} textAnchor="end" className="art-mono art-mono--sm" fill="var(--ink)">{v}</text>
            </g>
          ))}
        </g>
      )}
      {lessonId === 'html-structure' && (
        <g>
          {card(18, 12, 124, 76, 8)}
          <rect x="28" y="24" width="104" height="54" rx="6" fill={soft} stroke={c} strokeOpacity=".5" />
          <rect x="38" y="36" width="84" height="16" rx="4" fill="var(--surface)" stroke={c} strokeOpacity=".6" />
          <rect x="44" y="42" width="40" height="5" rx="2.5" fill={c} />
          <rect x="38" y="58" width="60" height="4" rx="2" fill="var(--line-strong)" />
          <text x="24" y="21" className="art-mono art-mono--xs" fill="var(--ink-3)">&lt;body&gt;</text>
          <text x="34" y="33" className="art-mono art-mono--xs" fill={c}>&lt;main&gt;</text>
          <text x="116" y="47" textAnchor="end" className="art-mono art-mono--xs" fill={c}>h1</text>
        </g>
      )}
      {lessonId === 'what-a-model-does' && (
        <g>
          {['The', 'total', 'is'].map((t, i) => (
            <g key={t} transform={`translate(${12 + i * 36} 38)`}>
              <rect width="32" height="22" rx="6" fill="var(--surface)" stroke="var(--line-strong)" />
              <text x="16" y="15" textAnchor="middle" className="art-text" fill="var(--ink)">{t}</text>
            </g>
          ))}
          <g transform="translate(120 38)">
            <rect width="30" height="22" rx="6" fill={soft} stroke={c} strokeWidth="1.8" strokeDasharray="4 3" />
            <text x="15" y="15" textAnchor="middle" className="art-text art-text--strong" fill={c}>?</text>
          </g>
          {[['$42', 0.62], ['$40', 0.21], ['high', 0.1]].map(([t, p], i) => (
            <g key={t as string} transform={`translate(${30 + i * 40} 72)`}>
              <rect width="34" height="5" rx="2.5" fill="var(--line)" />
              <rect width={34 * (p as number)} height="5" rx="2.5" fill={c} opacity={i === 0 ? 1 : 0.5} />
              <text x="17" y="17" textAnchor="middle" className="art-text art-text--xs" fill="var(--ink-3)">{t as string}</text>
            </g>
          ))}
        </g>
      )}
      {lessonId === 'describing-requirements' && (
        <g>
          {card(34, 12, 92, 76, 8)}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(46 ${28 + i * 18})`}>
              <rect width="11" height="11" rx="3" fill={i < 2 ? c : 'var(--surface)'} stroke={i < 2 ? 'none' : 'var(--line-strong)'} strokeWidth="1.5" />
              {i < 2 && <path d="M2.5 5.8l2.3 2.3 4-4.6" fill="none" stroke="var(--surface)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="18" y="1.5" width={[52, 44, 48][i]} height="4" rx="2" fill="var(--line-strong)" />
              <rect x="18" y="7.5" width={[34, 40, 28][i]} height="3" rx="1.5" fill="var(--line)" />
            </g>
          ))}
        </g>
      )}
      {!HUE[lessonId] && card(40, 20, 80, 60, 8)}
    </svg>
    </div>
  );
}
