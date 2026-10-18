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
  'chess-board-as-data': 'chess',
  'game-state': 'chess',
  'flexbox-layout': 'web',
  'responsive-design': 'web',
  'money-math': 'finance',
  'filter-map-reduce': 'finance',
  'http-and-apis': 'automation',
  'validating-input': 'automation',
  'prompts-as-specs': 'web',
  'calling-a-model-api': 'finance',
  'structured-outputs': 'chess',
  'prompt-injection': 'automation',
  'tool-calling-loop': 'automation',
  'evaluating-ai': 'finance',
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

      {lessonId === 'chess-board-as-data' && (
        <g>
          {card(40, 12, 80, 76, 6)}
          {Array.from({ length: 16 }, (_, i) => {
            const r = Math.floor(i / 4), col = i % 4;
            return <rect key={i} x={52 + col * 15} y={22 + r * 15} width="15" height="15" fill={(r + col) % 2 ? c : 'var(--surface-2)'} opacity={(r + col) % 2 ? 0.35 : 1} />;
          })}
          <rect x={52 + 2 * 15} y={22 + 1 * 15} width="15" height="15" fill="none" stroke={c} strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => <text key={`r${i}`} x="47" y={33 + i * 15} textAnchor="end" className="art-mono art-mono--xs" fill="var(--ink-3)">{i}</text>)}
          {[0, 1, 2, 3].map((i) => <text key={`c${i}`} x={59 + i * 15} y="90" textAnchor="middle" className="art-mono art-mono--xs" fill="var(--ink-3)">{i}</text>)}
          <text x="124" y="44" className="art-mono art-mono--xs" fill={c}>[1][2]</text>
        </g>
      )}
      {lessonId === 'game-state' && (
        <g>
          {card(10, 22, 66, 56, 8)}
          <text x="18" y="36" className="art-mono art-mono--xs" fill="var(--ink-3)">state</text>
          <text x="18" y="50" className="art-mono art-mono--sm" fill={c}>turn</text><text x="44" y="50" className="art-mono art-mono--sm" fill="var(--ink)">"w"</text>
          <text x="18" y="62" className="art-mono art-mono--sm" fill={c}>sel</text><text x="44" y="62" className="art-mono art-mono--sm" fill="var(--ink)">[6,4]</text>
          <text x="18" y="73" className="art-mono art-mono--sm" fill={c}>board</text>
          <path d="M80 50 H 96" stroke={c} strokeWidth="2.2" strokeLinecap="round" /><path d="M92 46l4 4-4 4" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" />
          <text x="88" y="42" textAnchor="middle" className="art-text art-text--xs" fill="var(--ink-3)">render</text>
          {card(102, 22, 50, 56, 6)}
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={108 + (i % 3) * 13} y={30 + Math.floor(i / 3) * 13} width="13" height="13" fill={((i % 3) + Math.floor(i / 3)) % 2 ? c : 'var(--surface-2)'} opacity={((i % 3) + Math.floor(i / 3)) % 2 ? 0.35 : 1} />)}
          <rect x="121" y="56" width="13" height="13" fill="none" stroke="var(--warn)" strokeWidth="2" />
        </g>
      )}
      {lessonId === 'flexbox-layout' && (
        <g>
          {card(14, 26, 132, 48, 8)}
          {[0, 1, 2].map((i) => <rect key={i} x={24 + i * 40} y="38" width="30" height="24" rx="4" fill={c} opacity={i === 1 ? 1 : 0.55} />)}
          {[0, 1].map((i) => (
            <g key={i} stroke="var(--ink-3)" strokeWidth="1.2">
              <path d={`M${56 + i * 40} 50 H ${62 + i * 40}`} />
              <path d={`M${56 + i * 40} 47 V 53 M${62 + i * 40} 47 V 53`} />
            </g>
          ))}
          <text x="80" y="20" textAnchor="middle" className="art-mono art-mono--xs" fill={c}>display: flex; gap</text>
        </g>
      )}
      {lessonId === 'responsive-design' && (
        <g>
          {card(12, 18, 92, 64, 6)}
          <rect x="12" y="18" width="92" height="9" rx="4" fill="var(--surface-2)" />
          {[0, 1, 2].map((i) => <rect key={i} x={20 + i * 27} y="34" width="22" height="18" rx="3" fill={c} opacity="0.5" />)}
          <rect x="20" y="58" width="60" height="4" rx="2" fill="var(--line-strong)" />
          {card(114, 28, 34, 58, 7)}
          {[0, 1, 2].map((i) => <rect key={i} x="120" y={36 + i * 15} width="22" height="11" rx="2.5" fill={c} opacity="0.5" />)}
        </g>
      )}
      {lessonId === 'money-math' && (
        <g>
          <g transform="translate(36 50)">
            <ellipse cx="0" cy="18" rx="22" ry="8" fill={c} opacity=".45" />
            <rect x="-22" y="4" width="44" height="14" fill={c} opacity=".45" />
            <ellipse cx="0" cy="4" rx="22" ry="8" fill={c} />
            <text x="0" y="8" textAnchor="middle" className="art-mono art-mono--sm" fill="var(--surface)">¢</text>
          </g>
          {card(74, 26, 74, 48, 8)}
          <text x="111" y="44" textAnchor="middle" className="art-mono art-mono--sm" fill="var(--danger)">0.1+0.2 ≠ 0.3</text>
          <text x="111" y="62" textAnchor="middle" className="art-mono" fill={c}>1999¢</text>
        </g>
      )}
      {lessonId === 'filter-map-reduce' && (
        <g>
          {[0, 1, 2, 3].map((i) => <rect key={i} x="12" y={18 + i * 17} width="26" height="13" rx="3" fill={i % 2 ? 'var(--line-strong)' : c} opacity={i % 2 ? 1 : 0.8} />)}
          <path d="M44 20 L 64 38 V 62 L 44 80" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" />
          <text x="54" y="14" textAnchor="middle" className="art-mono art-mono--xs" fill="var(--ink-3)">filter</text>
          {[0, 1].map((i) => <rect key={i} x="72" y={38 + i * 17} width="26" height="13" rx="3" fill={c} opacity=".8" />)}
          <text x="85" y="30" textAnchor="middle" className="art-mono art-mono--xs" fill="var(--ink-3)">map</text>
          <path d="M104 50 H 116" stroke="var(--ink-3)" strokeWidth="1.5" /><path d="M112 46l4 4-4 4" fill="none" stroke="var(--ink-3)" strokeWidth="1.5" />
          <rect x="120" y="38" width="30" height="24" rx="6" fill={c} />
          <text x="135" y="54" textAnchor="middle" className="art-mono art-mono--sm" fill="var(--surface)">Σ</text>
          <text x="135" y="30" textAnchor="middle" className="art-mono art-mono--xs" fill="var(--ink-3)">reduce</text>
        </g>
      )}
      {lessonId === 'http-and-apis' && (
        <g>
          {card(10, 30, 42, 40, 6)}
          <rect x="18" y="40" width="26" height="4" rx="2" fill="var(--line-strong)" /><rect x="18" y="48" width="18" height="4" rx="2" fill="var(--line)" />
          {card(108, 30, 42, 40, 6)}
          {[40, 48, 56].map((y) => <rect key={y} x="116" y={y} width="26" height="4" rx="2" fill="var(--line)" />)}
          <path d="M56 42 H 102" stroke={c} strokeWidth="2" /><path d="M98 38l4 4-4 4" fill="none" stroke={c} strokeWidth="2" />
          <rect x="62" y="30" width="30" height="10" rx="5" fill={c} /><text x="77" y="37.5" textAnchor="middle" className="art-text art-text--xs" fill="var(--surface)">POST</text>
          <path d="M104 60 H 58" stroke="var(--ok)" strokeWidth="2" /><path d="M62 56l-4 4 4 4" fill="none" stroke="var(--ok)" strokeWidth="2" />
          <text x="80" y="74" textAnchor="middle" className="art-mono art-mono--sm" fill="var(--ok)">201</text>
        </g>
      )}
      {lessonId === 'validating-input' && (
        <g>
          {card(12, 22, 60, 56, 6)}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(20 ${32 + i * 14})`}>
              <rect width="34" height="8" rx="2" fill="var(--line)" />
              {i === 1 ? <path d="M40 0l7 8M47 0l-7 8" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" /> : <path d="M40 4l3 3 5-6" fill="none" stroke="var(--ok)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
            </g>
          ))}
          <g transform="translate(112 50)">
            <path d="M0 -26 L 22 -18 V 2 C 22 16, 10 24, 0 28 C -10 24, -22 16, -22 2 V -18 Z" fill={c} />
            <path d="M-9 0l6 6 12-13" fill="none" stroke="var(--surface)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      )}
      {lessonId === 'prompts-as-specs' && (
        <g>
          {card(30, 14, 100, 72, 8)}
          {[['Task', 1], ['Context', 0.8], ['Rules', 0.7], ['Format', 0.6], ['Example', 0.5]].map(([t, w], i) => (
            <g key={t as string} transform={`translate(40 ${24 + i * 12})`}>
              <path d="M0 3l2.5 2.5 4.5-5" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <text x="12" y="6" className="art-text art-text--xs" fill="var(--ink-2)">{t as string}</text>
              <rect x="44" y="1" width={36 * (w as number)} height="5" rx="2.5" fill="var(--line)" />
            </g>
          ))}
        </g>
      )}
      {lessonId === 'calling-a-model-api' && (
        <g>
          {card(10, 28, 40, 44, 6)}
          <text x="30" y="54" textAnchor="middle" className="art-mono art-mono--xs" fill="var(--ink-2)">app</text>
          <g transform="translate(64 30)">
            <rect width="32" height="40" rx="6" fill={c} />
            <path d="M10 18v-4a6 6 0 0 1 12 0v4" fill="none" stroke="var(--surface)" strokeWidth="2" />
            <rect x="8" y="18" width="16" height="12" rx="2" fill="var(--surface)" />
          </g>
          {card(110, 28, 40, 44, 6)}
          <circle cx="130" cy="46" r="6" fill="none" stroke={c} strokeWidth="2" /><circle cx="130" cy="46" r="2" fill={c} />
          <text x="130" y="64" textAnchor="middle" className="art-mono art-mono--xs" fill="var(--ink-2)">model</text>
          <path d="M52 50h10M98 50h10" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round" />
          <text x="80" y="86" textAnchor="middle" className="art-mono art-mono--xs" fill={c}>key stays here</text>
        </g>
      )}
      {lessonId === 'structured-outputs' && (
        <g>
          {card(10, 22, 58, 56, 6)}
          <text x="18" y="38" className="art-mono art-mono--xs" fill="var(--ink-3)">```json</text>
          <text x="18" y="50" className="art-mono art-mono--xs" fill="var(--ink-2)">{'{"intent"'}</text>
          <text x="18" y="62" className="art-mono art-mono--xs" fill="var(--ink-2)">{' : "hours"}'}</text>
          <path d="M74 50h14" stroke={c} strokeWidth="2.4" strokeLinecap="round" /><path d="M84 45l5 5-5 5" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {card(96, 22, 54, 56, 6)}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(104 ${32 + i * 11})`}>
              <rect width="26" height="6" rx="2" fill="var(--line)" />
              <path d="M32 3l2.5 2.5 4.5-5" fill="none" stroke="var(--ok)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          ))}
        </g>
      )}
      {lessonId === 'prompt-injection' && (
        <g>
          {card(10, 26, 64, 48, 6)}
          <rect x="18" y="36" width="44" height="4" rx="2" fill="var(--line)" />
          <rect x="18" y="46" width="48" height="8" rx="2" fill="var(--danger-soft)" />
          <text x="20" y="52.5" className="art-mono art-mono--xs" fill="var(--danger)">ignore rules</text>
          <rect x="18" y="60" width="30" height="4" rx="2" fill="var(--line)" />
          {[0, 1, 2].map((i) => <rect key={i} x={92 + i * 12} y={24 + i * 4} width="6" height={52 - i * 8} rx="3" fill={c} opacity={1 - i * 0.25} />)}
          <path d="M76 50h12" stroke="var(--danger)" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M136 46l4 4 8-9" fill="none" stroke="var(--ok)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {lessonId === 'tool-calling-loop' && (
        <g>
          <circle cx="80" cy="50" r="28" fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="5 4" />
          {[['model', 80, 22], ['check', 108, 50], ['run', 80, 78], ['result', 52, 50]].map(([t, x, y], i) => (
            <g key={t as string} transform={`translate(${(x as number) - 17} ${(y as number) - 8})`}>
              <rect width="34" height="16" rx="8" fill={i === 0 ? c : 'var(--surface)'} stroke={c} strokeWidth="1.5" />
              <text x="17" y="11" textAnchor="middle" className="art-text art-text--xs" fill={i === 0 ? 'var(--surface)' : 'var(--ink-2)'}>{t as string}</text>
            </g>
          ))}
          <g transform="translate(130 16)"><circle r="9" fill="var(--surface)" stroke={c} strokeWidth="1.5" /><circle cy="-2" r="3" fill={c} /><path d="M-5 5a5 4 0 0 1 10 0" fill={c} /></g>
        </g>
      )}
      {lessonId === 'evaluating-ai' && (
        <g>
          {card(22, 14, 116, 72, 8)}
          {[true, true, false, true, true].map((ok, i) => (
            <g key={i} transform={`translate(34 ${24 + i * 11})`}>
              <rect width="62" height="6" rx="2" fill="var(--line)" />
              {ok ? <path d="M72 3l2.5 2.5 4.5-5" fill="none" stroke="var(--ok)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /> : <path d="M72 0l6 6M78 0l-6 6" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" />}
            </g>
          ))}
          <text x="124" y="80" textAnchor="end" className="art-mono art-mono--sm" fill={c}>4/5</text>
        </g>
      )}
      {!HUE[lessonId] && card(40, 20, 80, 60, 8)}
    </svg>
    </div>
  );
}
