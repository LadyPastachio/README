import { useMemo, useState } from 'react';
import { PRICING, PRICING_CHECKED, estimateCost, estimateTokens, formatUsd, softmax, type PricedModel } from '@/core/ai/tokens';
import { Range, Segmented } from '@/design/components';
import { JsonBlock } from './shared';

/** Illustrative next-word scores after "Thanks for your message. Our audit costs". Made up for teaching, not taken from a real model. */
const NEXT = [
  { word: '$490', score: 4.2 },
  { word: 'from', score: 3.4 },
  { word: 'around', score: 2.6 },
  { word: 'nothing', score: 0.9 },
  { word: '$49', score: 0.5 },
];

export function RequestTool() {
  const [model, setModel] = useState<PricedModel>('claude-opus-5-5');
  const [system, setSystem] = useState('You reply to website enquiries for a small studio. Use only the approved facts. If the answer is not there, say a person will follow up.');
  const [message, setMessage] = useState('Hi! How much is a website audit?');
  const [maxTokens, setMaxTokens] = useState(300);
  const [temp, setTemp] = useState(10);
  const t = temp / 10;

  const inTokens = estimateTokens(system) + estimateTokens(message) + 8;
  const body = { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: message }] };
  const probs = useMemo(() => softmax(NEXT.map((n) => n.score), t), [t]);
  const perCall = estimateCost(model, inTokens, maxTokens);

  return (
    <div className="ai-tool">
      <div className="ai-tool__intro">
        <p>What your code actually sends to a model API, roughly what it costs, and why answers vary.</p>
      </div>
      <div className="ai-request">
        <div className="ai-form">
          <label className="field-label" htmlFor="req-system">System prompt (your rules)</label>
          <textarea id="req-system" rows={3} value={system} onChange={(e) => setSystem(e.target.value)} />
          <label className="field-label" htmlFor="req-message">User message (untrusted input)</label>
          <textarea id="req-message" rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
          <span className="field-label" id="req-model">Model</span>
          <Segmented label="Model" value={model} options={(Object.keys(PRICING) as PricedModel[]).map((m) => ({ value: m, label: PRICING[m].label }))} onChange={setModel} />
          <label className="field-label" htmlFor="req-max">Longest answer (max_tokens)</label>
          <Range id="req-max" label="max_tokens" min={50} max={2000} step={50} value={maxTokens} onChange={setMaxTokens} />
        </div>
        <div className="ai-request__out">
          <span className="field-label">Request body</span>
          <JsonBlock value={body} label="Request body" />
          <dl className="ai-costs">
            <div><dt>Input</dt><dd className="tabular">≈ {inTokens} tokens</dd></div>
            <div><dt>Output (at most)</dt><dd className="tabular">{maxTokens} tokens</dd></div>
            <div><dt>One call, at most</dt><dd className="tabular">{formatUsd(perCall)}</dd></div>
            <div><dt>1,000 leads a month</dt><dd className="tabular">{formatUsd(perCall * 1000)}</dd></div>
          </dl>
          <p className="subtle ai-fine">
            Token counts are estimates (about 4 characters per token; real tokenizers vary). Prices: {PRICING[model].label} ${PRICING[model].input} per million input tokens and ${PRICING[model].output} per million output tokens, from Anthropic's model documentation, checked {PRICING_CHECKED}. Confirm current prices before relying on them.
          </p>
        </div>
      </div>

      <section className="ai-temp" aria-labelledby="temp-title">
        <h3 id="temp-title" className="panel__title">Why the same prompt gives different answers</h3>
        <p className="muted">A model scores every possible next word, then picks one at random, weighted by those scores. Temperature reshapes the odds. The scores below are invented for illustration; the math is real.</p>
        <p className="ai-temp__sentence">“Thanks for your message. Our audit costs <strong>…</strong>”</p>
        <label className="field-label" htmlFor="temp">Temperature: {t.toFixed(1)}</label>
        <Range id="temp" label="Temperature" min={0} max={20} value={temp} onChange={setTemp} />
        <ul className="ai-bars">
          {NEXT.map((n, i) => (
            <li key={n.word}>
              <span className="ai-bars__word mono">{n.word}</span>
              <span className="ai-bars__track"><span className="ai-bars__fill" style={{ width: `${(probs[i]! * 100).toFixed(1)}%` }} /></span>
              <span className="ai-bars__pct tabular">{(probs[i]! * 100).toFixed(1)}%</span>
            </li>
          ))}
        </ul>
        <p className="muted">
          {t === 0 ? 'At 0 the top word always wins: repeatable, but stiff.' : t < 0.7 ? 'Low: almost always the likeliest word.' : t <= 1.2 ? 'Around 1: mostly likely words, with some variety.' : 'High: unlikely words, like "$49", become real possibilities. That\'s why prices and facts must come from code, not the model.'}
        </p>
      </section>
    </div>
  );
}
