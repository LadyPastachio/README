import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Search, Ellipsis } from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from './navigation';
import { SearchDialog } from './SearchDialog';
import { Dialog, Button } from '@/design/components';
import './shell.css';

export function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  // Ctrl+K / Cmd+K or "/" opens search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, [contenteditable="true"]');
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Move focus to the page heading and scroll up on navigation, so keyboard and
  // screen-reader users land at the start of the new page.
  useEffect(() => {
    setMoreOpen(false);
    if (!location.hash) window.scrollTo?.(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [location.pathname, location.hash]);

  const secondary = NAV_ITEMS.filter((n) => !n.mobilePrimary);
  const moreActive = secondary.some((n) => isActive(n.path, location.pathname));

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to content
      </a>

      {/* Desktop sidebar and tablet rail share one element; CSS changes its shape. */}
      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar__brand">
          <Mark />
          <span className="sidebar__name">{APP_NAME}</span>
        </div>
        <button type="button" className="sidebar__search" onClick={() => setSearchOpen(true)}>
          <Search size={16} aria-hidden="true" />
          <span className="sidebar__label">Search<span className="visually-hidden"> lessons, skills and terms</span></span>
          <kbd className="sidebar__kbd" aria-hidden="true">Ctrl K</kbd>
        </button>
        <nav className="sidebar__nav">
          {(['Learn', 'Build', 'You'] as const).map((group) => (
            <div key={group} className="sidebar__group">
              <span className="sidebar__group-label" aria-hidden="true">{group}</span>
              {NAV_ITEMS.filter((n) => n.group === group).map((item) => (
                <NavLink key={item.id} to={item.path} end={item.path === '/'} className="nav-link" title={item.label}>
                  <item.icon size={19} strokeWidth={1.8} aria-hidden="true" />
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar__foot">
          <span className="sidebar__label subtle">Local preview · v{__APP_VERSION__}</span>
        </div>
      </aside>

      {/* Phone top bar */}
      <header className="topbar">
        <div className="topbar__brand">
          <Mark />
          <span>{APP_NAME}</span>
        </div>
        <Button variant="ghost" icon onClick={() => setSearchOpen(true)} aria-label="Search">
          <Search size={20} aria-hidden="true" />
        </Button>
      </header>

      <main id="main" tabIndex={-1} className="main">
        <div className={`main__inner${/^\/lab\/.+/.test(location.pathname) ? ' main__inner--wide' : ''}`}>
          <Outlet />
        </div>
      </main>

      {/* Phone bottom bar */}
      <nav className="bottom-nav" aria-label="Primary">
        {NAV_ITEMS.filter((n) => n.mobilePrimary).map((item) => (
          <NavLink key={item.id} to={item.path} end={item.path === '/'} className="bottom-nav__link">
            <item.icon size={21} strokeWidth={1.8} aria-hidden="true" />
            <span>{item.short}</span>
          </NavLink>
        ))}
        <button type="button" className={`bottom-nav__link${moreActive ? ' active' : ''}`} onClick={() => setMoreOpen(true)} aria-haspopup="dialog">
          <Ellipsis size={21} strokeWidth={1.8} aria-hidden="true" />
          <span>More</span>
        </button>
      </nav>

      <Dialog open={moreOpen} onClose={() => setMoreOpen(false)} title="More" labelledBy="more-title" actions={<Button onClick={() => setMoreOpen(false)}>Close</Button>}>
        <nav className="more-list" aria-label="More destinations">
          {secondary.map((item) => (
            <NavLink key={item.id} to={item.path} className="more-list__link">
              <item.icon size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>
                <strong>{item.label}</strong>
                <span className="subtle">{item.description}</span>
              </span>
            </NavLink>
          ))}
        </nav>
      </Dialog>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function isActive(path: string, current: string) {
  return path === '/' ? current === '/' : current.startsWith(path);
}

function Mark() {
  return (
    <svg className="mark" width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--accent)" />
      <path d="M9 22 16 9l7 13" fill="none" stroke="var(--accent-ink)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.8 17h8.4" stroke="var(--gold)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}
