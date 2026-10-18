/**
 * Rough token and cost estimates for teaching. Real tokenizers split text
 * differently per model and language; this uses the common rule of thumb of
 * about 4 characters per token for English, and says so wherever it's shown.
 */

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.round(text.length / 4));
}

/** Published prices in US dollars per million tokens. Checked 2026-10-18 against Anthropic's model documentation. */
export const PRICING = {
  'claude-opus-5-5': { label: 'Claude Opus 5.5', input: 4, output: 20 },
  'claude-haiku-5-5': { label: 'Claude Haiku 5.5', input: 0.1, output: 0.5 },
} as const;
export type PricedModel = keyof typeof PRICING;
export const PRICING_CHECKED = '2026-10-18';

export function estimateCost(model: PricedModel, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

export function formatUsd(n: number): string {
  if (n === 0) return '$0';
  if (n < 0.01) return `$${n.toFixed(5).replace(/0+$/, '')}`;
  return `$${n.toFixed(2)}`;
}

/**
 * Turns scores into probabilities at a given temperature (softmax).
 * Low temperature sharpens toward the top choice; high temperature flattens.
 * Temperature 0 means always pick the top choice.
 */
export function softmax(scores: number[], temperature: number): number[] {
  if (scores.length === 0) return [];
  if (temperature <= 0) {
    const max = Math.max(...scores);
    const winners = scores.filter((s) => s === max).length;
    return scores.map((s) => (s === max ? 1 / winners : 0));
  }
  const scaled = scores.map((s) => s / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}
