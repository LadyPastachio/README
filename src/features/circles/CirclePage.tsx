import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2, UserMinus, Copy, LogOut } from 'lucide-react';
import { api, type CircleDetail, type ShareContent } from '@/core/account/api';
import { useSettings } from '@/core/settings/SettingsContext';
import { useLearning } from '@/core/learning/LearningContext';
import { loadLabStore } from '@/core/lab/workspaceStore';
import { loadProjectNotes } from '@/core/projects/notesStore';
import { progressSummary } from '@/core/account/progressSummary';
import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES, getLabExercise } from '@/content/lab/exercises';
import { PATHS } from '@/content/paths';
import { PageHeader, Panel, Button, Dialog, CodeBlock, Segmented, Notice } from '@/design/components';
import { NotFoundPage } from '@/app/NotFoundPage';
import { useToast } from '@/app/Toast';
import { copyText } from '@/features/settings/fileHelpers';
import './circles.css';

type Kind = 'progress' | 'code' | 'note';

export function CirclePage() {
  const { circleId } = useParams();
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState('');
  const [invite, setInvite] = useState<{ code: string; expiresAt: string; uses: number } | null>(null);
  const [confirm, setConfirm] = useState<null | 'leave' | 'delete'>(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    void api<CircleDetail>('GET', `circles/${circleId}`).then((r) => {
      if (r.ok) setCircle(r.data);
      else if (r.status === 404 || r.status === 401) setMissing(true);
      else setError(r.error);
    });
  }, [circleId]);

  if (missing) return <NotFoundPage />;
  if (!circle) return <p className="muted" role="status">{error || 'Loading…'}</p>;
  const owner = circle.role === 'owner';

  const act = async <T,>(p: Promise<import('@/core/account/api').ApiResult<T>>, onOk?: (d: T) => void) => {
    const r = await p;
    if (!r.ok) return setError(r.error);
    setError('');
    onOk?.(r.data);
  };

  return (
    <>
      <PageHeader eyebrow="Learning circle" title={circle.name} breadcrumbs={[{ to: '/circles', label: 'Learning Circles' }]}
        description={`${circle.members.length} member${circle.members.length === 1 ? '' : 's'}. Only members can see what's shared here.`} />
      {error && <p className="account__error" role="alert">{error}</p>}
      <div className="circle-layout">
        <div className="circle-feed">
          <ShareComposer circleId={circle.id} onShared={(c) => { setCircle(c); toast('Shared with the circle'); }} onError={setError} />
          {circle.shares.length === 0 ? (
            <Panel><p className="muted">Nothing shared yet. Share your progress, some code you'd like feedback on, or a note.</p></Panel>
          ) : circle.shares.map((s) => (
            <article key={s.id} className="share" data-kind={s.kind}>
              <header className="share__head">
                <span className="share__kind">{s.kind === 'code' ? 'Code' : s.kind === 'progress' ? 'Progress' : 'Note'}</span>
                <h2 className="share__title">{s.title}</h2>
                <span className="subtle small">{s.mine ? 'You' : s.author} · {new Date(s.createdAt).toLocaleDateString()}</span>
                {(s.mine || owner) && (
                  <Button size="sm" variant="ghost" icon aria-label={`Remove “${s.title}”`} title="Remove" onClick={() => void act(api<CircleDetail>('DELETE', `shares/${s.id}`), (c) => { setCircle(c); toast('Removed'); })}><Trash2 size={14} aria-hidden="true" /></Button>
                )}
              </header>
              <ShareBody content={s.content} kind={s.kind} />
              <section className="share__comments" aria-label={`Comments on ${s.title}`}>
                {s.comments.map((c) => (
                  <div key={c.id} className="comment">
                    <strong>{c.mine ? 'You' : c.author}</strong> <span className="comment__body">{c.body}</span>
                    {c.mine && <button type="button" className="link-button subtle small" onClick={() => void act(api('DELETE', `comments/${c.id}`), () => setCircle({ ...circle, shares: circle.shares.map((x) => (x.id === s.id ? { ...x, comments: x.comments.filter((y) => y.id !== c.id) } : x)) }))}>Delete</button>}
                  </div>
                ))}
                <CommentBox shareTitle={s.title} onSubmit={(body) => act(api<CircleDetail>('POST', `shares/${s.id}/comments`, { body }), setCircle)} />
              </section>
            </article>
          ))}
        </div>
        <aside className="circle-side">
          <Panel title="Members">
            <ul className="member-list">
              {circle.members.map((m) => (
                <li key={m.id}>
                  <span>{m.name}{m.you ? ' (you)' : ''}{m.role === 'owner' ? <span className="subtle small"> · owner</span> : null}</span>
                  {owner && !m.you && <Button size="sm" variant="ghost" icon aria-label={`Remove ${m.name}`} title="Remove from circle" onClick={() => void act(api('DELETE', `circles/${circle.id}/members/${m.id}`), () => setCircle({ ...circle, members: circle.members.filter((x) => x.id !== m.id) }))}><UserMinus size={14} aria-hidden="true" /></Button>}
                </li>
              ))}
            </ul>
          </Panel>
          {owner && (
            <Panel title="Invite someone">
              <p className="muted small">Send them a code. It works 5 times and expires after 7 days.</p>
              {invite ? (
                <div className="invite">
                  <code className="invite__code" aria-label="Invite code">{invite.code}</code>
                  <Button size="sm" onClick={async () => toast((await copyText(invite.code)) ? 'Code copied' : 'Copy was blocked by the browser')}><Copy size={14} aria-hidden="true" /> Copy</Button>
                  <p className="subtle small">Expires {new Date(invite.expiresAt).toLocaleDateString()}.</p>
                </div>
              ) : (
                <Button size="sm" variant="primary" onClick={() => void act(api<{ code: string; expiresAt: string; uses: number }>('POST', `circles/${circle.id}/invites`, {}), setInvite)}>Create invite code</Button>
              )}
            </Panel>
          )}
          <div>
            {owner
              ? <Button size="sm" variant="ghost" className="btn--danger-ghost" onClick={() => setConfirm('delete')}><Trash2 size={14} aria-hidden="true" /> Delete circle</Button>
              : <Button size="sm" variant="ghost" onClick={() => setConfirm('leave')}><LogOut size={14} aria-hidden="true" /> Leave circle</Button>}
          </div>
        </aside>
      </div>
      <Dialog open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === 'delete' ? 'Delete this circle?' : 'Leave this circle?'} labelledBy="circle-confirm-title"
        actions={<><Button onClick={() => setConfirm(null)}>Cancel</Button><Button variant="danger" onClick={() => void act(confirm === 'delete' ? api('DELETE', `circles/${circle.id}`) : api('POST', `circles/${circle.id}/leave`, {}), () => { toast(confirm === 'delete' ? 'Circle deleted' : 'You left the circle'); navigate('/circles'); })}>{confirm === 'delete' ? 'Delete' : 'Leave'}</Button></>}>
        <p className="muted">{confirm === 'delete' ? 'Everything shared in this circle, and its comments, will be deleted for everyone.' : 'You\'ll lose access to what\'s shared here. Your own shares stay unless you remove them first.'}</p>
      </Dialog>
    </>
  );
}

function ShareBody({ content, kind }: { content: ShareContent; kind: Kind }) {
  if (kind === 'code' && content.files) {
    const ex = content.exerciseId ? getLabExercise(content.exerciseId) : undefined;
    const names = { html: 'index.html', css: 'style.css', js: ex?.language === 'sql' ? 'query.sql' : 'script.js' } as const;
    return (
      <div className="share__body">
        {ex && <p className="subtle small">From the Code Lab exercise <Link to={`/lab/${ex.id}`}>{ex.title}</Link></p>}
        {(['html', 'css', 'js'] as const).filter((k) => content.files![k]?.trim()).map((k) => <CodeBlock key={k} code={content.files![k]!} label={names[k]} />)}
      </div>
    );
  }
  return <p className="share__body share__text">{content.text}</p>;
}

function CommentBox({ shareTitle, onSubmit }: { shareTitle: string; onSubmit: (body: string) => Promise<void> }) {
  const [body, setBody] = useState('');
  return (
    <form className="comment-box" onSubmit={async (e) => { e.preventDefault(); if (!body.trim()) return; await onSubmit(body); setBody(''); }}>
      <label className="visually-hidden" htmlFor={`c-${shareTitle}`}>Comment on {shareTitle}</label>
      <input id={`c-${shareTitle}`} className="input" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a kind, specific comment…" maxLength={2000} />
      <Button type="submit" size="sm" disabled={!body.trim()}>Comment</Button>
    </form>
  );
}

function ShareComposer({ circleId, onShared, onError }: { circleId: string; onShared: (c: CircleDetail) => void; onError: (e: string) => void }) {
  const { settings, storage } = useSettings();
  const { events } = useLearning();
  const [kind, setKind] = useState<Kind>('progress');
  const [open, setOpen] = useState(false);
  const workspaces = useMemo(() => Object.entries(loadLabStore(storage).workspaces).filter(([id]) => getLabExercise(id)), [storage, open]);
  const [exerciseId, setExerciseId] = useState('');
  const [note, setNote] = useState('');
  const [notePath, setNotePath] = useState('');
  const summary = useMemo(() => progressSummary(events, LESSONS, LAB_EXERCISES, settings.learning.currentPath), [events, settings.learning.currentPath]);

  if (!open) return <div><Button variant="primary" onClick={() => setOpen(true)}>Share something</Button></div>;

  const ws = workspaces.find(([id]) => id === exerciseId)?.[1];
  const ex = exerciseId ? getLabExercise(exerciseId) : undefined;
  const files = ws ? (ex?.language === 'sql' ? { js: ws.files.js } : ws.files) : undefined;
  const preview: { title: string; content: ShareContent } | null =
    kind === 'progress' ? { title: 'My progress', content: { text: summary } }
      : kind === 'code' ? (ws && ex ? { title: ex.title, content: { exerciseId, files } } : null)
        : note.trim() ? { title: notePath ? `Notes: ${PATHS.find((p) => p.id === notePath)?.name}` : 'A note', content: { text: note.trim() } } : null;

  async function share() {
    if (!preview) return;
    const r = await api<CircleDetail>('POST', `circles/${circleId}/shares`, { kind, title: preview.title, content: preview.content });
    if (!r.ok) return onError(r.error);
    setOpen(false);
    setNote('');
    onShared(r.data);
  }

  return (
    <Panel title="Share with the circle" className="composer">
      <Segmented label="What to share" value={kind} onChange={setKind} options={[{ value: 'progress', label: 'My progress' }, { value: 'code', label: 'Code' }, { value: 'note', label: 'A note' }]} />
      {kind === 'progress' && <p className="muted small">Skills by status and your current milestone. Never your answers, explanations or learning profile.</p>}
      {kind === 'code' && (
        workspaces.length === 0 ? <Notice kind="info">You haven't written code in the Code Lab yet. Code you write there can be shared here for review.</Notice> : (
          <div className="field">
            <label className="field__label" htmlFor="share-ex">Code Lab exercise</label>
            <select id="share-ex" className="select" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
              <option value="">Choose one…</option>
              {workspaces.map(([id]) => <option key={id} value={id}>{getLabExercise(id)!.title}</option>)}
            </select>
          </div>
        )
      )}
      {kind === 'note' && (
        <div className="field">
          <label className="field__label" htmlFor="share-note">Note</label>
          <textarea id="share-note" className="input textarea" rows={4} value={note} onChange={(e) => setNote(e.target.value)} maxLength={5000} />
          <div className="btn-row">
            {PATHS.map((p) => {
              const n = loadProjectNotes(storage, p.id);
              const text = [n.design && `Design notes:\n${n.design}`, n.issues && `Known issues:\n${n.issues}`, n.improvements && `Future improvements:\n${n.improvements}`].filter(Boolean).join('\n\n');
              return text ? <Button key={p.id} size="sm" variant="ghost" onClick={() => { setNote(text); setNotePath(p.id); }}>Use my {p.name} notes</Button> : null;
            })}
          </div>
        </div>
      )}
      {preview && (
        <div className="composer__preview">
          <span className="eyebrow">Members will see</span>
          <strong>{preview.title}</strong>
          <ShareBody content={preview.content} kind={kind} />
        </div>
      )}
      <div className="btn-row">
        <Button variant="primary" onClick={() => void share()} disabled={!preview}>Share</Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </Panel>
  );
}
