import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAI } from '@/core/ai/useAI';
import { MENTOR_MODES, MODE_INFO, type AIResponse, type MentorMode } from '@/core/ai/types';
import { useSettings } from '@/core/settings/SettingsContext';
import { Button, Segmented } from '@/design/components';
import { ResponseCard } from './shared';

export function MentorTool() {
  const { settings, updateAI } = useSettings();
  const [params] = useSearchParams();
  const initial = (MENTOR_MODES as readonly string[]).includes(params.get('mode') ?? '') ? (params.get('mode') as MentorMode) : settings.ai.mentorMode;
  const [mode, setMode] = useState<MentorMode>(initial);
  const [input, setInput] = useState('');
  const [res, setRes] = useState<AIResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const ai = useAI();

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setBusy(true);
    setPicked(null);
    setRes(await ai.complete({ task: 'mentor', mode, input }));
    setBusy(false);
  }

  return (
    <div className="ai-tool">
      <div className="ai-tool__intro">
        <p>Five ways to get help. Each one behaves differently on purpose: a mentor who always hands over answers stops you learning.</p>
      </div>
      <Segmented
        label="Mentor mode"
        value={mode}
        options={MENTOR_MODES.map((m) => ({ value: m, label: MODE_INFO[m].label }))}
        onChange={(m) => {
          setMode(m);
          setRes(null);
          updateAI({ mentorMode: m });
        }}
      />
      <p className="muted ai-mode-blurb">{MODE_INFO[mode].blurb}</p>
      <form onSubmit={ask} className="ai-form">
        <label htmlFor="mentor-input" className="visually-hidden">Your message</label>
        <textarea id="mentor-input" rows={mode === 'review' ? 8 : 3} value={input} onChange={(e) => setInput(e.target.value)} placeholder={MODE_INFO[mode].placeholder} className={mode === 'review' ? 'mono' : ''} maxLength={4000} />
        <div className="ai-form__row">
          <span className="subtle tabular">{input.length} / 4000</span>
          <Button type="submit" variant="primary" disabled={busy || !input.trim()}>{busy ? 'Thinking…' : 'Ask'}</Button>
        </div>
      </form>
      {res && (
        <ResponseCard res={res}>
          {res.quiz && (
            <div className="ai-quiz">
              <p className="ai-quiz__q">{res.quiz.prompt}</p>
              {res.quiz.code && <pre className="ai-json"><code>{res.quiz.code}</code></pre>}
              <div className="ai-quiz__options" role="group" aria-label="Answers">
                {res.quiz.options.map((o) => (
                  <button key={o.key} type="button" className="ai-quiz__opt" data-state={picked ? (o.correct ? 'correct' : picked === o.key ? 'wrong' : '') : ''} aria-pressed={picked === o.key} disabled={!!picked} onClick={() => setPicked(o.key)}>
                    <span className="ai-quiz__key">{o.key}</span> {o.text}
                  </button>
                ))}
              </div>
              {picked && <p className="ai-quiz__why">{res.quiz.options.find((o) => o.key === picked)!.correct ? 'Correct. ' : 'Not quite. '}{res.quiz.options.find((o) => o.key === picked)!.why}</p>}
            </div>
          )}
        </ResponseCard>
      )}
    </div>
  );
}
