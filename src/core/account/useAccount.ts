import { useCallback, useEffect, useState } from 'react';
import { api, type AccountUser } from './api';

export type AccountState =
  | { status: 'checking' }
  | { status: 'unavailable'; error: string }
  | { status: 'signed-out' }
  | { status: 'signed-in'; user: AccountUser };

/** Checks whether the academy server is running and who is signed in. */
export function useAccount() {
  const [state, setState] = useState<AccountState>({ status: 'checking' });

  const refresh = useCallback(async () => {
    const r = await api<{ user: AccountUser | null }>('GET', 'auth/me');
    if (!r.ok) setState({ status: 'unavailable', error: r.error });
    else setState(r.data.user ? { status: 'signed-in', user: r.data.user } : { status: 'signed-out' });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { state, refresh, setState };
}
