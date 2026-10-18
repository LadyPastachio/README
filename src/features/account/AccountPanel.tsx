import './account.css';
import { useEffect, useState } from 'react';
import { CloudUpload, CloudDownload, LogOut, Download, RefreshCw } from 'lucide-react';
import { api, type AccountUser } from '@/core/account/api';
import { useAccount } from '@/core/account/useAccount';
import { useSettings } from '@/core/settings/SettingsContext';
import { useLearning } from '@/core/learning/LearningContext';
import { createBackup, planImport, applyImport, BACKUP_KEY_NAMES, type ImportPlan } from '@/core/backup/backup';
import { Button, Dialog, Notice, Segmented } from '@/design/components';
import { useToast } from '@/app/Toast';
import { downloadText, dateStamp } from '@/features/settings/fileHelpers';

/** Settings → Account and sync. Everything here needs the academy server; without it the panel says so. */
export function AccountPanel() {
  const { state, refresh, setState } = useAccount();
  if (state.status === 'checking') return <p className="muted" role="status">Checking for the academy server…</p>;
  if (state.status === 'unavailable') {
    return (
      <div className="account">
        <Notice kind="info">
          <strong>Accounts need the academy server.</strong> Run <code>npm run server</code> on your computer, then check again. Until then, everything stays on this device, as it always has.
        </Notice>
        <div><Button size="sm" onClick={() => void refresh()}><RefreshCw size={14} aria-hidden="true" /> Check again</Button></div>
      </div>
    );
  }
  if (state.status === 'signed-out') return <SignIn onSignedIn={(user) => setState({ status: 'signed-in', user })} />;
  return <SignedIn user={state.user} onSignedOut={() => setState({ status: 'signed-out' })} />;
}

function SignIn({ onSignedIn }: { onSignedIn: (u: AccountUser) => void }) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const r = mode === 'in' ? await api<{ user: AccountUser }>('POST', 'auth/login', { email, password }) : await api<{ user: AccountUser }>('POST', 'auth/register', { email, name, password });
    setBusy(false);
    if (!r.ok) return setError(r.error);
    setPassword('');
    toast(mode === 'in' ? 'Signed in' : 'Account created');
    onSignedIn(r.data.user);
  }

  return (
    <div className="account">
      <p className="muted">An account lets you keep a copy of your progress on the academy server and join private learning circles. It's optional: the academy works fully without one.</p>
      <Segmented label="Account" value={mode} onChange={(m) => { setMode(m); setError(''); }} options={[{ value: 'in', label: 'Sign in' }, { value: 'up', label: 'Create account' }]} />
      <form className="account__form" onSubmit={submit}>
        {mode === 'up' && (
          <div className="field">
            <label className="field__label" htmlFor="acct-name">Display name</label>
            <input id="acct-name" className="input" autoComplete="nickname" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
            <span className="field__hint">What circle members see. Your email is never shown to them.</span>
          </div>
        )}
        <div className="field">
          <label className="field__label" htmlFor="acct-email">Email</label>
          <input id="acct-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="acct-password">Password</label>
          <input id="acct-password" className="input" type="password" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={mode === 'up' ? 'acct-password-hint' : undefined} />
          {mode === 'up' && <span className="field__hint" id="acct-password-hint">At least 10 characters. A few unrelated words is easy to remember and hard to guess.</span>}
        </div>
        {error && <p className="account__error" role="alert">{error}</p>}
        <div><Button type="submit" variant="primary" disabled={busy}>{busy ? 'One moment…' : mode === 'in' ? 'Sign in' : 'Create account'}</Button></div>
      </form>
    </div>
  );
}

function SignedIn({ user, onSignedOut }: { user: AccountUser; onSignedOut: () => void }) {
  const { storage, reload } = useSettings();
  const learning = useLearning();
  const toast = useToast();
  const [remote, setRemote] = useState<{ updatedAt: string | null; bytes: number } | null>(null);
  const [confirmUpload, setConfirmUpload] = useState(false);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [error, setError] = useState('');

  async function loadRemote() {
    const r = await api<{ updatedAt: string | null; bytes: number }>('GET', 'sync');
    if (r.ok) setRemote({ updatedAt: r.data.updatedAt, bytes: r.data.bytes });
  }
  useEffect(() => {
    void loadRemote();
  }, []);

  async function upload() {
    setConfirmUpload(false);
    const r = await api<{ updatedAt: string }>('PUT', 'sync', { backup: createBackup(storage, __APP_VERSION__) });
    if (!r.ok) return setError(r.error);
    setError('');
    toast('This device\'s progress is saved to your account');
    void loadRemote();
  }

  async function prepareDownload() {
    const r = await api<{ backup: unknown }>('GET', 'sync');
    if (!r.ok) return setError(r.error);
    if (!r.data.backup) return setError('Your account has no saved progress yet.');
    setError('');
    setPlan(planImport(JSON.stringify(r.data.backup), storage));
  }

  function confirmDownload() {
    if (plan?.ok && applyImport(plan, storage)) {
      reload();
      learning.reload();
      toast('Progress restored from your account');
    } else toast('Nothing was changed');
    setPlan(null);
  }

  async function exportData() {
    const r = await api<unknown>('GET', 'account/export');
    if (!r.ok) return setError(r.error);
    toast(downloadText(`academy-account-${dateStamp()}.json`, JSON.stringify(r.data, null, 2)) ? 'Account data downloaded' : 'Download was blocked by the browser');
  }

  async function signOut() {
    await api('POST', 'auth/logout', {});
    toast('Signed out');
    onSignedOut();
  }

  async function deleteAccount() {
    const r = await api('POST', 'account/delete', { password: deletePassword });
    if (!r.ok) return setError(r.error);
    setConfirmDelete(false);
    setDeletePassword('');
    toast('Account deleted. Progress on this device is untouched.');
    onSignedOut();
  }

  return (
    <div className="account">
      <p>Signed in as <strong>{user.name}</strong> <span className="muted">({user.email})</span></p>
      <div className="account__sync">
        <div>
          <span className="eyebrow">Saved on your account</span>
          <p className="muted" role="status">{remote === null ? 'Checking…' : remote.updatedAt ? `Last saved ${new Date(remote.updatedAt).toLocaleString()} (${Math.max(1, Math.round(remote.bytes / 1024))} KB)` : 'Nothing saved yet.'}</p>
        </div>
        <div className="btn-row">
          <Button size="sm" variant="primary" onClick={() => setConfirmUpload(true)}><CloudUpload size={14} aria-hidden="true" /> Save this device's progress</Button>
          <Button size="sm" onClick={() => void prepareDownload()} disabled={!remote?.updatedAt}><CloudDownload size={14} aria-hidden="true" /> Restore to this device</Button>
        </div>
        <p className="subtle small">Saving and restoring only happen when you press these buttons. Each one shows what will change first.</p>
      </div>
      {error && <p className="account__error" role="alert">{error}</p>}
      <div className="btn-row">
        <Button size="sm" variant="ghost" onClick={() => void exportData()}><Download size={14} aria-hidden="true" /> Download my account data</Button>
        <Button size="sm" variant="ghost" onClick={() => void signOut()}><LogOut size={14} aria-hidden="true" /> Sign out</Button>
        <Button size="sm" variant="ghost" className="btn--danger-ghost" onClick={() => { setError(''); setConfirmDelete(true); }}>Delete account</Button>
      </div>

      <Dialog open={confirmUpload} onClose={() => setConfirmUpload(false)} title="Save this device's progress to your account?" labelledBy="upload-title"
        actions={<><Button onClick={() => setConfirmUpload(false)}>Cancel</Button><Button variant="primary" onClick={() => void upload()}>Save</Button></>}>
        <p className="muted">Your settings, learning profile, learning records, Code Lab code and project notes from this device will be saved to your account{remote?.updatedAt ? ', replacing the copy saved there now' : ''}.</p>
      </Dialog>

      <Dialog open={!!plan?.ok} onClose={() => setPlan(null)} title="Restore your account's progress to this device?" labelledBy="download-title"
        actions={<><Button onClick={() => setPlan(null)}>Cancel</Button><Button variant="primary" onClick={confirmDownload}>Restore</Button></>}>
        {plan?.ok && (
          <>
            <p className="muted">Saved {new Date(plan.exportedAt).toLocaleString()}.</p>
            <ul className="plan-list">{plan.entries.map((e) => <li key={e.key}><strong>{BACKUP_KEY_NAMES[e.key] ?? e.key}</strong>: {e.replacesExisting ? 'will replace what this device has now' : 'will be added'}</li>)}</ul>
          </>
        )}
      </Dialog>
      {plan && !plan.ok && <Notice kind="danger">{plan.error}</Notice>}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?" labelledBy="delete-account-title"
        actions={<><Button onClick={() => setConfirmDelete(false)}>Cancel</Button><Button variant="danger" onClick={() => void deleteAccount()} disabled={!deletePassword}>Delete account</Button></>}>
        <p className="muted">This permanently removes your account, the progress saved on it, circles you own (with everything shared in them), and your shares and comments in other circles. Progress on this device is not touched.</p>
        <div className="field">
          <label className="field__label" htmlFor="delete-password">Your password</label>
          <input id="delete-password" className="input" type="password" autoComplete="current-password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
        </div>
        {error && <p className="account__error" role="alert">{error}</p>}
      </Dialog>
    </div>
  );
}
