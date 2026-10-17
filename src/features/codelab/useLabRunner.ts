import { useCallback, useEffect, useRef, useState } from 'react';
import { buildDocument, type LabFiles, type CheckSpec } from '@/core/lab/buildDocument';
import { explainError, type Explanation } from '@/core/lab/explainError';
import { newId } from '@/core/learning/records';

export type ConsoleEntry =
  | { id: string; kind: 'log'; level: 'log' | 'info' | 'warn' | 'error'; text: string }
  | { id: string; kind: 'error'; name: string; message: string; line: number | null; col: number | null; explanation: Explanation }
  | { id: string; kind: 'notice'; text: string };

export interface CheckResult { id: string; passed: boolean; error?: string }

/**
 * Runs learner code in the sandboxed iframe and collects what comes back.
 * Each run gets a new id; messages from older runs (or anything that isn't
 * our iframe) are ignored.
 */
export function useLabRunner(onChecks?: (results: CheckResult[]) => void) {
  const iframe = useRef<HTMLIFrameElement>(null);
  const runId = useRef('');
  const [srcDoc, setSrcDoc] = useState('');
  const [frameKey, setFrameKey] = useState(0);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [checks, setChecks] = useState<CheckResult[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<number | null>(null);
  const onChecksRef = useRef(onChecks);
  onChecksRef.current = onChecks;

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!iframe.current || e.source !== iframe.current.contentWindow) return;
      const d = e.data as { __lab?: boolean; run?: string; type?: string } & Record<string, unknown>;
      if (!d || d.__lab !== true || d.run !== runId.current) return;
      if (d.type === 'console') {
        setEntries((list) => [...list, { id: newId('c'), kind: 'log', level: (d.level as 'log') ?? 'log', text: String(d.text ?? '') }]);
      } else if (d.type === 'error') {
        const message = String(d.message ?? '');
        setEntries((list) => [
          ...list,
          { id: newId('c'), kind: 'error', name: String(d.name ?? 'Error'), message, line: typeof d.line === 'number' ? d.line : null, col: typeof d.col === 'number' ? d.col : null, explanation: explainError(message) },
        ]);
      } else if (d.type === 'checks') {
        const results = Array.isArray(d.results) ? (d.results as CheckResult[]) : [];
        setChecks(results);
        setChecking(false);
        onChecksRef.current?.(results);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const run = useCallback((files: LabFiles, checkSpecs: CheckSpec[] = []) => {
    const id = newId('run');
    runId.current = id;
    const built = buildDocument(files, id, checkSpecs);
    const notices: ConsoleEntry[] = [];
    if (!built.linked.css && files.css.trim()) notices.push({ id: newId('c'), kind: 'notice', text: 'style.css isn\'t linked from index.html, so its styles aren\'t applied. Add <link rel="stylesheet" href="style.css"> inside <head>.' });
    if (!built.linked.js && files.js.trim()) notices.push({ id: newId('c'), kind: 'notice', text: 'script.js isn\'t linked from index.html, so it doesn\'t run. Add <script src="script.js"></script> before </body>.' });
    setEntries(notices);
    setChecks(null);
    setChecking(checkSpecs.length > 0);
    setSrcDoc(built.html);
    setFrameKey((k) => k + 1);
    setLastRunAt(Date.now());
    return built;
  }, []);

  // If checks never report back (for example, the page never finished loading), stop waiting.
  useEffect(() => {
    if (!checking) return;
    const t = setTimeout(() => {
      setChecking(false);
      setEntries((list) => [...list, { id: newId('c'), kind: 'notice', text: 'The checks didn\'t finish. The page may have an error that stops it loading; look for a red message above.' }]);
    }, 8000);
    return () => clearTimeout(t);
  }, [checking, frameKey]);

  const clear = useCallback(() => setEntries([]), []);
  return { iframe, srcDoc, frameKey, entries, checks, checking, run, clear, lastRunAt };
}
