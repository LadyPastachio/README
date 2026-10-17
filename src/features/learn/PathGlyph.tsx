import type { PathId } from '@/content/types';

/** Small drawings that identify each path at a glance. */
export function PathGlyph({ path, size = 40 }: { path: PathId; size?: number }) {
  const color = `var(--path-${path})`;
  const soft = `var(--path-${path}-soft)`;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="path-glyph">
      <rect width="40" height="40" rx="10" fill={soft} />
      {path === 'web' && (
        <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="11" width="22" height="18" rx="3" />
          <path d="M9 16h22" />
          <circle cx="12.5" cy="13.5" r="0.6" fill={color} />
          <path d="M13 21h8M13 25h12" />
        </g>
      )}
      {path === 'finance' && (
        <g fill={color}>
          <rect x="10" y="22" width="4.5" height="8" rx="1.2" />
          <rect x="17.75" y="16" width="4.5" height="14" rx="1.2" />
          <rect x="25.5" y="11" width="4.5" height="19" rx="1.2" />
        </g>
      )}
      {path === 'chess' && (
        <g fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
          <circle cx="20" cy="13" r="3.5" />
          <path d="M16.5 19h7l-1.5 6h-4z" />
          <path d="M13 30h14l-1.5-5h-11z" />
        </g>
      )}
      {path === 'automation' && (
        <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="20" r="3" />
          <circle cx="28" cy="12" r="3" />
          <circle cx="28" cy="28" r="3" />
          <path d="M15 19l10-5.5M15 21l10 5.5" />
        </g>
      )}
    </svg>
  );
}
