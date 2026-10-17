import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { StorageAdapter } from '../persistence/storage';
import { loadRecords, saveRecords, newId, type LearningEvent } from './records';

type NewEvent = Omit<LearningEvent, 'id' | 'at'>;

interface LearningContextValue {
  events: LearningEvent[];
  /** Records one event. Returns false if the browser refused to save it. */
  record: (event: NewEvent) => boolean;
  /** Re-reads records from storage (after an import or reset). */
  reload: () => void;
  saveFailed: boolean;
}

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ storage, children, now = () => new Date() }: { storage: StorageAdapter; children: ReactNode; now?: () => Date }) {
  const [events, setEvents] = useState<LearningEvent[]>(() => loadRecords(storage));
  const [saveFailed, setSaveFailed] = useState(false);

  const record = useCallback(
    (event: NewEvent) => {
      const full: LearningEvent = { ...event, id: newId(), at: now().toISOString() };
      // Read the latest saved copy first, so two open tabs don't erase each other's records.
      const next = [...loadRecords(storage), full];
      const ok = saveRecords(storage, next);
      setEvents(next);
      setSaveFailed(!ok);
      return ok;
    },
    [storage, now],
  );

  const reload = useCallback(() => setEvents(loadRecords(storage)), [storage]);

  const value = useMemo(() => ({ events, record, reload, saveFailed }), [events, record, reload, saveFailed]);
  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
}

export function useLearning(): LearningContextValue {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning must be used inside <LearningProvider>');
  return ctx;
}
