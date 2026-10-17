import { forwardRef, useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Info, Hammer, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { PathId } from '@/content/types';
import { PATH_NAMES } from '@/content/paths';
import './components.css';

/* Buttons ------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: boolean;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon = false, className = '', type = 'button', ...rest },
  ref,
) {
  const cls = ['btn', `btn--${variant}`, size === 'sm' && 'btn--sm', icon && 'btn--icon', className].filter(Boolean).join(' ');
  return <button ref={ref} type={type} className={cls} {...rest} />;
});

export function ButtonLink({ to, variant = 'secondary', children }: { to: string; variant?: ButtonVariant; children: ReactNode }) {
  return (
    <Link to={to} className={`btn btn--${variant}`}>
      {children}
    </Link>
  );
}

/* Layout pieces ------------------------------------------------------- */

export function PageHeader({
  title, description, eyebrow, actions, breadcrumbs,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}) {
  return (
    <header className="page-header">
      {breadcrumbs && (
        <nav aria-label="Breadcrumb" className="breadcrumbs">
          {breadcrumbs.map((b, i) => (
            <span key={b.label} style={{ display: 'contents' }}>
              {i > 0 && <span aria-hidden="true">/</span>}
              {b.to ? <Link to={b.to}>{b.label}</Link> : <span aria-current="page">{b.label}</span>}
            </span>
          ))}
        </nav>
      )}
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className="page-header__row">
        <h1>{title}</h1>
        {actions}
      </div>
      {description && <p className="page-header__desc">{description}</p>}
    </header>
  );
}

export function Panel({
  title, action, children, variant, className = '', as: Tag = 'section', ...rest
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  variant?: 'flush' | 'sunken';
  className?: string;
  as?: 'section' | 'div' | 'article';
  id?: string;
  'aria-labelledby'?: string;
}) {
  return (
    <Tag className={['panel', variant && `panel--${variant}`, className].filter(Boolean).join(' ')} {...rest}>
      {(title || action) && (
        <div className="panel__head">
          {title && <h2 className="panel__title">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </Tag>
  );
}

/* Status ------------------------------------------------------------- */

export function PathTag({ path }: { path: PathId }) {
  return (
    <span className="chip path-tag" data-path={path}>
      <span className="chip__dot" aria-hidden="true" />
      {PATH_NAMES[path]}
    </span>
  );
}

export type MasteryStatus = 'none' | 'supported' | 'challenge' | 'independent' | 'retained';
export const MASTERY_LABELS: Record<MasteryStatus, string> = {
  none: 'Not introduced',
  supported: 'Practiced with support',
  challenge: 'Needs another challenge',
  independent: 'Demonstrated independently',
  retained: 'Retained over time',
};
export function MasteryPill({ status }: { status: MasteryStatus }) {
  return (
    <span className="chip mastery" data-status={status}>
      <span className="chip__dot" aria-hidden="true" />
      <span style={{ color: 'var(--ink-2)' }}>{MASTERY_LABELS[status]}</span>
    </span>
  );
}

const NOTICE_ICONS = { planned: Hammer, info: Info, ok: CheckCircle2, warn: AlertTriangle, danger: XCircle };
export function Notice({ kind = 'info', children }: { kind?: keyof typeof NOTICE_ICONS; children: ReactNode }) {
  const Icon = NOTICE_ICONS[kind];
  return (
    <div className={`notice notice--${kind}`} role={kind === 'danger' ? 'alert' : undefined}>
      <Icon size={16} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/** Marks something that is designed but not built yet. Never use it for finished features. */
export function Planned({ phase, children }: { phase: number; children: ReactNode }) {
  return (
    <p className="planned">
      <span className="planned__badge"><Hammer size={12} aria-hidden="true" /> Phase {phase}</span>
      <span className="planned__text"><span className="visually-hidden">Planned for Phase {phase}. </span>{children}</span>
    </p>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty__title">{title}</div>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

/* Controls ------------------------------------------------------------ */

export function Segmented<T extends string>({
  label, value, options, onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}>
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" className="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} />;
}

export function Range({
  id, label, value, min, max, step = 1, unit = '', onChange,
}: {
  id: string; label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <div className="range">
      <input id={id} type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} />
      <output htmlFor={id}>{value}{unit}</output>
    </div>
  );
}

/** A native <dialog>: gives focus trapping, Escape-to-close and a backdrop for free. */
export function Dialog({
  open, onClose, title, children, actions, labelledBy = 'dialog-title',
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; actions: ReactNode; labelledBy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close?.();
  }, [open]);
  return (
    <dialog ref={ref} className="dialog" aria-labelledby={labelledBy} onClose={onClose} onCancel={onClose}>
      <div className="dialog__body">
        <h2 id={labelledBy}>{title}</h2>
        {children}
      </div>
      <div className="dialog__actions">{actions}</div>
    </dialog>
  );
}

export { CodeBlock } from './CodeBlock';
export { ActivityBadge, ACTIVITY_META, activityType, type ActivityType } from './ActivityBadge';
