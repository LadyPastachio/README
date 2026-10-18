import { describe, expect, it } from 'vitest';
import { coachPrompt } from './promptCoach';
import { estimateCost, estimateTokens, formatUsd, softmax } from './tokens';

describe('prompt coach', () => {
  it('finds almost nothing in a vague prompt, and says why', () => {
    const r = coachPrompt('Make a nice email');
    expect(r.passed).toBeLessThanOrEqual(1);
    expect(r.vagueWords).toEqual(['nice']);
    expect(r.checks.find((c) => c.id === 'specific')?.detail).toMatch(/Only 4 words/);
    expect(r.skeleton).toMatch(/Context:/);
    expect(r.skeleton).toMatch(/Format:/);
  });

  it('passes every check for a full specification', () => {
    const prompt =
      'You are replying for a small web studio to a customer who asked about prices. Write a reply email in under 80 words, in 2 short paragraphs. ' +
      'Use only the information below; if the answer isn\'t there, say a person will follow up. Never offer discounts. ' +
      'For example: "Hi Sam, thanks for asking…". A good answer states the audit price and invites them to book.\n<information>Audits start at $490.</information>';
    const r = coachPrompt(prompt);
    expect(r.checks.filter((c) => !c.passed).map((c) => c.id)).toEqual([]);
    expect(r.skeleton).toBe(prompt);
  });

  it('handles an empty prompt', () => {
    const r = coachPrompt('   ');
    expect(r.words).toBe(0);
    expect(r.passed).toBe(0);
    expect(r.skeleton.startsWith('[Your task')).toBe(true);
  });
});

describe('tokens, cost and temperature', () => {
  it('estimates tokens at about four characters each', () => {
    expect(estimateTokens('')).toBe(0);
    expect(estimateTokens('abc')).toBe(1);
    expect(estimateTokens('x'.repeat(400))).toBe(100);
  });

  it('prices input and output separately', () => {
    expect(estimateCost('claude-opus-5-5', 1_000_000, 0)).toBe(4);
    expect(estimateCost('claude-opus-5-5', 0, 1_000_000)).toBe(20);
    expect(estimateCost('claude-haiku-5-5', 2000, 500)).toBeCloseTo(0.00045, 8);
    expect(formatUsd(0.00045)).toBe('$0.00045');
    expect(formatUsd(1.5)).toBe('$1.50');
  });

  it('sharpens at low temperature and flattens at high temperature', () => {
    const scores = [3, 2, 1];
    const cold = softmax(scores, 0.2);
    const hot = softmax(scores, 2);
    expect(cold[0]!).toBeGreaterThan(0.99);
    expect(hot[0]!).toBeLessThan(0.6);
    expect(hot.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(softmax(scores, 0)).toEqual([1, 0, 0]);
    expect(softmax([2, 2, 1], 0)).toEqual([0.5, 0.5, 0]);
  });
});
