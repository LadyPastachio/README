import { useCallback, useEffect, useState } from 'react';
import { useSettings } from '@/core/settings/SettingsContext';
import { OFFLINE_STATUS, fetchStatus, serverProvider } from './provider';
import { simulatedProvider } from './simulated';
import type { AIRequest, AIResponse, AIStatus } from './types';

/**
 * The one way screens use AI. In simulated mode nothing touches the network;
 * the server status is only checked when you switch to "Local server".
 */
export function useAI() {
  const { settings } = useSettings();
  const mode = settings.ai.mode;
  const [status, setStatus] = useState<AIStatus>(OFFLINE_STATUS);
  const [checking, setChecking] = useState(false);

  const refresh = useCallback(async () => {
    if (mode !== 'local-server') {
      setStatus(OFFLINE_STATUS);
      return;
    }
    setChecking(true);
    setStatus(await fetchStatus());
    setChecking(false);
  }, [mode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const complete = useCallback(
    async (req: AIRequest): Promise<AIResponse> => {
      const provider = mode === 'local-server' && status.live ? serverProvider() : simulatedProvider;
      const res = await provider.complete(req);
      if (res.remainingToday !== undefined) setStatus((s) => ({ ...s, remainingToday: res.remainingToday ?? s.remainingToday }));
      if (mode === 'local-server' && !status.live && !res.notice) return { ...res, notice: status.reason };
      return res;
    },
    [mode, status.live, status.reason],
  );

  return { mode, status, checking, refresh, complete, live: mode === 'local-server' && status.live };
}
