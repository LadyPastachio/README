import type { PathId } from '@/content/types';

/**
 * Banner illustrations for the four projects. Flat, two-tone drawings that
 * show what you'll actually build, colored by each path's theme color.
 */
export function PathArt({ path, className = '' }: { path: PathId; className?: string }) {
  const c = `var(--path-${path})`;
  const soft = `var(--path-${path}-soft)`;
  return (
    <div className={`art-frame ${className}`} style={{ background: soft }} aria-hidden="true">
    <svg viewBox="0 0 320 180" className="art" preserveAspectRatio="xMidYMid meet">
      <rect width="320" height="180" fill={soft} />
      <g opacity="0.35" fill={c}>
        {Array.from({ length: 9 }, (_, i) => Array.from({ length: 5 }, (_, j) => <circle key={`${i}-${j}`} cx={20 + i * 36} cy={18 + j * 36} r="1.4" />))}
      </g>
      {path === 'web' && <WebScene c={c} soft={soft} />}
      {path === 'finance' && <FinanceScene c={c} soft={soft} />}
      {path === 'chess' && <ChessScene c={c} soft={soft} />}
      {path === 'automation' && <AutomationScene c={c} soft={soft} />}
    </svg>
    </div>
  );
}

type SceneProps = { c: string; soft: string };
const shadow = 'var(--art-shadow)';

function WebScene({ c, soft }: SceneProps) {
  return (
    <g>
      <rect x="64" y="34" width="176" height="128" rx="10" fill={shadow} transform="translate(4 6)" />
      <rect x="64" y="34" width="176" height="128" rx="10" fill="var(--surface)" />
      <path d="M64 44a10 10 0 0 1 10-10h156a10 10 0 0 1 10 10v8H64z" fill="var(--surface-2)" />
      <circle cx="76" cy="43" r="2.6" fill={c} opacity=".5" /><circle cx="85" cy="43" r="2.6" fill={c} opacity=".35" /><circle cx="94" cy="43" r="2.6" fill={c} opacity=".2" />
      <rect x="108" y="39" width="96" height="8" rx="4" fill="var(--surface)" />
      <rect x="78" y="62" width="148" height="40" rx="6" fill={soft} />
      <rect x="88" y="72" width="70" height="7" rx="3.5" fill={c} />
      <rect x="88" y="84" width="50" height="5" rx="2.5" fill={c} opacity=".45" />
      <rect x="178" y="68" width="38" height="28" rx="5" fill={c} opacity=".25" />
      <rect x="78" y="112" width="68" height="5" rx="2.5" fill="var(--line-strong)" />
      <rect x="78" y="122" width="56" height="5" rx="2.5" fill="var(--line)" />
      <rect x="158" y="112" width="68" height="5" rx="2.5" fill="var(--line-strong)" />
      <rect x="158" y="122" width="48" height="5" rx="2.5" fill="var(--line)" />
      <rect x="78" y="138" width="44" height="14" rx="7" fill={c} />
      {/* phone, to show responsive design */}
      <rect x="226" y="78" width="54" height="92" rx="9" fill={shadow} transform="translate(3 5)" />
      <rect x="226" y="78" width="54" height="92" rx="9" fill="var(--surface)" stroke="var(--line-strong)" />
      <rect x="234" y="90" width="38" height="20" rx="4" fill={soft} />
      <rect x="234" y="116" width="30" height="4" rx="2" fill="var(--line-strong)" />
      <rect x="234" y="124" width="24" height="4" rx="2" fill="var(--line)" />
      <rect x="234" y="150" width="26" height="9" rx="4.5" fill={c} />
      {/* cursor */}
      <path d="M128 146l0 18 5-5 4 8 4-2-4-8 7 0z" fill="var(--ink)" stroke="var(--surface)" strokeWidth="1.5" strokeLinejoin="round" />
    </g>
  );
}

function FinanceScene({ c, soft }: SceneProps) {
  const bars = [38, 56, 44, 72, 60];
  return (
    <g>
      <rect x="54" y="30" width="212" height="128" rx="12" fill={shadow} transform="translate(4 6)" />
      <rect x="54" y="30" width="212" height="128" rx="12" fill="var(--surface)" />
      <rect x="70" y="44" width="60" height="6" rx="3" fill="var(--ink-3)" opacity=".6" />
      <rect x="70" y="56" width="84" height="12" rx="4" fill="var(--ink)" opacity=".85" />
      {/* donut */}
      <circle cx="92" cy="114" r="22" fill="none" stroke={soft} strokeWidth="10" />
      <circle cx="92" cy="114" r="22" fill="none" stroke={c} strokeWidth="10" strokeDasharray="96 138" transform="rotate(-90 92 114)" strokeLinecap="round" />
      <circle cx="92" cy="114" r="22" fill="none" stroke={c} strokeOpacity=".4" strokeWidth="10" strokeDasharray="22 138" strokeDashoffset="-102" transform="rotate(-90 92 114)" />
      {/* bars */}
      <line x1="132" y1="142" x2="250" y2="142" stroke="var(--line)" />
      {bars.map((h, i) => (
        <rect key={i} x={140 + i * 22} y={142 - h} width="14" height={h} rx="3" fill={c} opacity={i === 3 ? 1 : 0.45} />
      ))}
      <polyline points="147,96 169,80 191,90 213,62 235,72" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" opacity=".7" />
      <circle cx="213" cy="62" r="3.5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" opacity=".85" />
      {/* coins */}
      <g transform="translate(252 128)">
        <ellipse cx="0" cy="22" rx="20" ry="7" fill={c} opacity=".5" />
        <rect x="-20" y="8" width="40" height="14" fill={c} opacity=".5" />
        <ellipse cx="0" cy="8" rx="20" ry="7" fill={c} />
        <ellipse cx="0" cy="8" rx="11" ry="3.5" fill="none" stroke="var(--surface)" strokeOpacity=".7" strokeWidth="1.5" />
      </g>
    </g>
  );
}

function Pawn({ x, y, fill, stroke }: { x: number; y: number; fill: string; stroke: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round">
      <circle cx="0" cy="-12" r="5" />
      <path d="M-4 -7h8l2 10h-12z" />
      <path d="M-9 3h18l1 5h-20z" />
    </g>
  );
}
function King({ x, y, fill, stroke }: { x: number; y: number; fill: string; stroke: string }) {
  return (
    <g transform={`translate(${x} ${y})`} fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round">
      <path d="M0 -26v8M-4 -22h8" fill="none" />
      <path d="M-8 -16h16l-3 16h-10z" />
      <path d="M-11 0h22l1 6h-24z" />
    </g>
  );
}

function ChessScene({ c, soft }: SceneProps) {
  const size = 26;
  const ox = 95;
  const oy = 24;
  return (
    <g>
      <rect x={ox} y={oy} width={size * 5} height={size * 5} rx="8" fill={shadow} transform="translate(4 6)" />
      <g>
        <clipPath id="board-clip"><rect x={ox} y={oy} width={size * 5} height={size * 5} rx="8" /></clipPath>
        <g clipPath="url(#board-clip)">
          {Array.from({ length: 25 }, (_, i) => {
            const r = Math.floor(i / 5);
            const col = i % 5;
            return <rect key={i} x={ox + col * size} y={oy + r * size} width={size} height={size} fill={(r + col) % 2 ? c : 'var(--surface)'} opacity={(r + col) % 2 ? 0.28 : 1} />;
          })}
        </g>
      </g>
      {/* legal-move markers for the knight-style L move */}
      <path d={`M${ox + size * 1.5} ${oy + size * 3.5} V${oy + size * 1.5} H${ox + size * 2.5}`} fill="none" stroke={c} strokeWidth="2.4" strokeDasharray="5 4" strokeLinecap="round" />
      <circle cx={ox + size * 2.5} cy={oy + size * 1.5} r="6" fill={c} />
      <circle cx={ox + size * 3.5} cy={oy + size * 2.5} r="4" fill={c} opacity=".45" />
      <circle cx={ox + size * 0.5} cy={oy + size * 1.5} r="4" fill={c} opacity=".45" />
      <Pawn x={ox + size * 1.5} y={oy + size * 3.5 + 6} fill="var(--surface)" stroke="var(--ink)" />
      <King x={ox + size * 3.5} y={oy + size * 0.5 + 10} fill="var(--ink)" stroke="var(--ink)" />
      <Pawn x={ox + size * 4.5} y={oy + size * 4.5 + 6} fill="var(--ink)" stroke="var(--ink)" />
      {/* move list card */}
      <rect x="236" y="54" width="64" height="76" rx="8" fill={shadow} transform="translate(3 5)" />
      <rect x="236" y="54" width="64" height="76" rx="8" fill="var(--surface)" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="244" y={66 + i * 15} width="8" height="5" rx="2.5" fill="var(--ink-3)" opacity=".5" />
          <rect x="256" y={66 + i * 15} width={i === 3 ? 16 : 22} height="5" rx="2.5" fill={i === 3 ? c : 'var(--line-strong)'} />
          <rect x="282" y={66 + i * 15} width="10" height="5" rx="2.5" fill="var(--line)" />
        </g>
      ))}
      <rect x="20" y="70" width="58" height="42" rx="8" fill={soft} stroke={c} strokeOpacity=".4" />
      <text x="49" y="88" textAnchor="middle" className="art-text" fill={c}>depth</text>
      <text x="49" y="103" textAnchor="middle" className="art-text art-text--strong" fill={c}>3 moves</text>
    </g>
  );
}

function AutomationScene({ c, soft }: SceneProps) {
  return (
    <g>
      <path d="M86 102 C 120 102, 120 90, 146 90" fill="none" stroke={c} strokeWidth="2.4" strokeDasharray="5 4" />
      <path d="M190 90 C 214 90, 214 102, 238 102" fill="none" stroke={c} strokeWidth="2.4" strokeDasharray="5 4" />
      {/* lead message */}
      <g transform="translate(26 74)">
        <rect width="62" height="56" rx="10" fill={shadow} transform="translate(3 5)" />
        <rect width="62" height="56" rx="10" fill="var(--surface)" />
        <rect x="12" y="14" width="38" height="26" rx="4" fill={soft} stroke={c} strokeWidth="1.6" />
        <path d="M12 16l19 13 19-13" fill="none" stroke={c} strokeWidth="1.6" />
        <circle cx="54" cy="8" r="8" fill={c} />
        <text x="54" y="11.5" textAnchor="middle" className="art-text art-text--strong" fill="var(--surface)">1</text>
      </g>
      {/* agent */}
      <g transform="translate(140 56)">
        <rect width="56" height="68" rx="14" fill={shadow} transform="translate(3 5)" />
        <rect width="56" height="68" rx="14" fill={c} />
        <rect x="10" y="16" width="36" height="24" rx="8" fill="var(--surface)" opacity=".95" />
        <circle cx="22" cy="28" r="3.2" fill={c} />
        <circle cx="34" cy="28" r="3.2" fill={c} />
        <rect x="16" y="48" width="24" height="5" rx="2.5" fill="var(--surface)" opacity=".7" />
      </g>
      {/* reply bubble */}
      <g transform="translate(150 16)">
        <rect width="100" height="30" rx="10" fill="var(--surface)" stroke="var(--line)" />
        <path d="M12 30l-2 10 12-10z" fill="var(--surface)" stroke="var(--line)" strokeLinejoin="round" />
        <rect x="10" y="30" width="16" height="2" fill="var(--surface)" />
        <rect x="12" y="10" width="58" height="4" rx="2" fill="var(--line-strong)" />
        <rect x="12" y="18" width="40" height="4" rx="2" fill="var(--line)" />
      </g>
      {/* calendar */}
      <g transform="translate(236 72)">
        <rect width="62" height="60" rx="10" fill={shadow} transform="translate(3 5)" />
        <rect width="62" height="60" rx="10" fill="var(--surface)" />
        <path d="M0 10a10 10 0 0 1 10-10h42a10 10 0 0 1 10 10v8H0z" fill={c} opacity=".85" />
        {[0, 1, 2, 3].map((i) => [0, 1].map((j) => <rect key={`${i}${j}`} x={9 + i * 12} y={26 + j * 12} width="8" height="7" rx="2" fill={i === 2 && j === 1 ? c : 'var(--line)'} />))}
        <circle cx="54" cy="52" r="10" fill="var(--ok)" />
        <path d="M49 52l3.5 3.5 6.5-7" fill="none" stroke="var(--surface)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      {/* human handoff */}
      <g transform="translate(150 140)" opacity=".9">
        <rect width="36" height="22" rx="11" fill="var(--surface)" stroke={c} strokeOpacity=".5" />
        <circle cx="13" cy="9" r="3.4" fill={c} opacity=".7" />
        <path d="M7 18a6 5 0 0 1 12 0" fill={c} opacity=".7" />
        <rect x="21" y="9" width="9" height="3" rx="1.5" fill={c} opacity=".5" />
      </g>
      <path d="M168 126v12" stroke={c} strokeWidth="2" strokeDasharray="3 3" />
    </g>
  );
}
