import { Bot, FlaskConical, PlugZap, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AIResponse, AIStatus } from '@/core/ai/types';
import { Button } from '@/design/components';

/** Every response says where it came from. */
export function SourceBadge({ source }: { source: AIResponse['source'] }) {
  return (
    <span className="ai-source" data-source={source}>
      {source === 'live' ? <PlugZap size={12} aria-hidden="true" /> : <FlaskConical size={12} aria-hidden="true" />}
      {source === 'live' ? 'Live model' : 'Simulated'}
    </span>
  );
}

export function StatusBanner({ mode, status, checking, onRefresh }: { mode: 'simulated' | 'local-server'; status: AIStatus; checking: boolean; onRefresh: () => void }) {
  const live = mode === 'local-server' && status.live;
  return (
    <div className="mode-banner ai-status" data-live={live} role="status" aria-label="AI connection">
      <span className="mode-dot" aria-hidden="true" />
      <div className="ai-status__text">
        <strong>{live ? `Live: ${status.model}` : mode === 'local-server' ? 'Local server not available: simulated' : 'Simulated mode'}</strong>{' '}
        <span className="muted">
          {live
            ? `Requests go to your local server, which holds the API key.${status.remainingToday !== null ? ` ${status.remainingToday} of ${status.dailyLimit} requests left today.` : ''}`
            : mode === 'local-server'
              ? status.reason
              : 'Responses come from rules and the academy\'s own content, never a model. Nothing you type leaves this browser.'}
        </span>{' '}
        <Link to="/settings#ai">Change in Settings</Link>
      </div>
      {mode === 'local-server' && (
        <Button size="sm" variant="ghost" onClick={onRefresh} disabled={checking}>
          <RefreshCw size={14} aria-hidden="true" /> {checking ? 'Checking…' : 'Check again'}
        </Button>
      )}
    </div>
  );
}

export function ResponseCard({ res, children }: { res: AIResponse; children?: React.ReactNode }) {
  return (
    <div className="ai-response" data-source={res.source} aria-live="polite">
      <div className="ai-response__head">
        <Bot size={16} aria-hidden="true" />
        <SourceBadge source={res.source} />
        {res.usage && <span className="subtle tabular">{res.usage.input} in · {res.usage.output} out tokens</span>}
      </div>
      {res.notice && <p className="ai-response__notice">{res.notice}</p>}
      <div className="ai-response__text">{res.text}</div>
      {children}
    </div>
  );
}

export function JsonBlock({ value, label }: { value: unknown; label?: string }) {
  return (
    <pre className="ai-json" aria-label={label} tabIndex={0}>
      <code>{typeof value === 'string' ? value : JSON.stringify(value, null, 2)}</code>
    </pre>
  );
}
