import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Users, MessageSquareCode, Share2, ArrowRight, RefreshCw } from 'lucide-react';
import { api, type CircleDetail, type CircleSummary } from '@/core/account/api';
import { useAccount } from '@/core/account/useAccount';
import { PageHeader, Panel, Button, Notice } from '@/design/components';
import './circles.css';

const PRINCIPLES = [
  { icon: Lock, title: 'Private by default', text: 'Nothing is shared unless you share a specific item. Your answers, explanations and learning profile are never shared.' },
  { icon: Users, title: 'Your own pace', text: 'Members follow their own paths and schedules. Nobody waits for, or is rushed by, the group.' },
  { icon: MessageSquareCode, title: 'Review each other\'s code', text: 'Comment on work a friend has shared with the circle, and get feedback on yours.' },
  { icon: Share2, title: 'Share on purpose', text: 'Members see names, never emails. Delete anything you shared, or leave, at any time.' },
];

export function CirclesPage() {
  const { state, refresh } = useAccount();
  return (
    <>
      <PageHeader eyebrow="Learning Circles" title="Learn alongside friends" description="Small private groups for sharing progress, reviewing code and encouraging each other, each at your own pace." />
      <div className="lab-parts">
        {PRINCIPLES.map((p) => (
          <Panel key={p.title} as="div" className="lab-part">
            <p.icon size={20} className="subtle" aria-hidden="true" />
            <h2 className="panel__title">{p.title}</h2>
            <p className="muted">{p.text}</p>
          </Panel>
        ))}
      </div>
      <div className="circles-main">
        {state.status === 'checking' && <p className="muted" role="status">Checking for the academy server…</p>}
        {state.status === 'unavailable' && (
          <Notice kind="info">
            <strong>Circles need the academy server.</strong> Circles store shared items on a server, so they need <code>npm run server</code> running (or the academy hosted somewhere your friends can reach).{' '}
            <Button size="sm" variant="ghost" onClick={() => void refresh()}><RefreshCw size={14} aria-hidden="true" /> Check again</Button>
          </Notice>
        )}
        {state.status === 'signed-out' && (
          <Notice kind="info"><strong>Sign in to use circles.</strong> Create an account or sign in from Settings. <Link to="/settings#account">Go to Account</Link></Notice>
        )}
        {state.status === 'signed-in' && <MyCircles />}
      </div>
    </>
  );
}

function MyCircles() {
  const [circles, setCircles] = useState<CircleSummary[] | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    void api<{ circles: CircleSummary[] }>('GET', 'circles').then((r) => (r.ok ? setCircles(r.data.circles) : setError(r.error)));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const r = await api<CircleDetail>('POST', 'circles', { name });
    if (!r.ok) return setError(r.error);
    navigate(`/circles/${r.data.id}`);
  }
  async function join(e: React.FormEvent) {
    e.preventDefault();
    const r = await api<CircleDetail>('POST', 'circles/join', { code });
    if (!r.ok) return setError(r.error);
    navigate(`/circles/${r.data.id}`);
  }

  return (
    <div className="circles-grid">
      <Panel title="Your circles">
        {circles === null ? <p className="muted">Loading…</p> : circles.length === 0 ? (
          <p className="muted">You're not in a circle yet. Start one and invite a friend, or join with a code someone sent you.</p>
        ) : (
          <ul className="circle-list">
            {circles.map((c) => (
              <li key={c.id}>
                <Link to={`/circles/${c.id}`} className="circle-link">
                  <span><strong>{c.name}</strong><span className="subtle small">{c.members} member{c.members === 1 ? '' : 's'}{c.role === 'owner' ? ' · you own it' : ''}</span></span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <div className="circles-forms">
        <Panel title="Start a circle">
          <form onSubmit={create} className="circles-form">
            <label className="field__label" htmlFor="circle-name">Circle name</label>
            <input id="circle-name" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Saturday coders" />
            <div><Button type="submit" variant="primary" disabled={!name.trim()}>Create</Button></div>
          </form>
        </Panel>
        <Panel title="Join with a code">
          <form onSubmit={join} className="circles-form">
            <label className="field__label" htmlFor="circle-code">Invite code</label>
            <input id="circle-code" className="input mono" value={code} onChange={(e) => setCode(e.target.value)} maxLength={40} autoComplete="off" autoCapitalize="characters" />
            <div><Button type="submit" disabled={code.trim().length < 6}>Join</Button></div>
          </form>
        </Panel>
        {error && <p className="account__error" role="alert">{error}</p>}
      </div>
    </div>
  );
}
