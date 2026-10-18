import { describe, expect, it } from 'vitest';
import { DEFAULT_PIPELINE, SAMPLES, evaluate, runPipeline, type PipelineOptions } from './structured';
import { ATTACKS, runAttack, type Defense } from './injection';
import { buildSteps, checkArgs } from './toolLoop';

const ALL: PipelineOptions = { stripFences: true, extractJson: true, validate: true, strict: true, retry: true, fallback: true };
const sample = (id: string) => SAMPLES.find((s) => s.id === id)!;

describe('structured-output pipeline', () => {
  it('with no safety steps, only clean output works and bad data slips through', () => {
    const r = evaluate(DEFAULT_PIPELINE);
    expect(runPipeline(sample('clean'), DEFAULT_PIPELINE).outcome).toBe('correct');
    expect(runPipeline(sample('fenced'), DEFAULT_PIPELINE).outcome).toBe('crashed');
    expect(runPipeline(sample('bad-enum'), DEFAULT_PIPELINE).outcome).toBe('wrong');
    expect(r.wrong + r.crashed).toBeGreaterThan(r.correct);
  });

  it('with every step on, nothing is wrong or crashes', () => {
    const r = evaluate(ALL);
    expect(r.wrong).toBe(0);
    expect(r.crashed).toBe(0);
    expect(r.correct).toBe(SAMPLES.length - 1);
    expect(runPipeline(sample('long'), ALL).outcome).toBe('handoff');
  });

  it('strict mode is what rejects an injected extra field', () => {
    const loose = { ...ALL, strict: false, retry: false };
    const extraLoose = runPipeline(sample('extra'), loose);
    expect(extraLoose.outcome).toBe('correct');
    expect(extraLoose.data).not.toHaveProperty('offer');
    expect(runPipeline(sample('extra'), { ...DEFAULT_PIPELINE }).data).toHaveProperty('offer');
    const strict = runPipeline(sample('extra'), { ...ALL, retry: false });
    expect(strict.outcome).toBe('handoff');
    expect(strict.steps.join(' ')).toMatch(/unrecognized key/i);
  });

  it('retries pass the error back and recover truncated output', () => {
    const r = runPipeline(sample('truncated'), ALL);
    expect(r.outcome).toBe('correct');
    expect(r.steps).toContain('Asked the model again, including the error');
  });

  it('every sample has a unique id and parses-or-fails deterministically', () => {
    expect(new Set(SAMPLES.map((s) => s.id)).size).toBe(SAMPLES.length);
    expect(evaluate(ALL)).toEqual(evaluate(ALL));
  });
});

describe('injection lab', () => {
  const on = (...d: Defense[]) => new Set(d);
  it('every attack succeeds with no defenses, and the control question gets a guessed answer', () => {
    for (const a of ATTACKS) expect(runAttack(a, on()).outcome).toBe(a.benign ? 'guessed' : 'succeeded');
  });
  it('prompt-level defenses only reduce risk; code-enforced ones stop attacks', () => {
    const prompt = on('delimit', 'knowledge');
    expect(ATTACKS.filter((a) => !a.benign).every((a) => runAttack(a, prompt).outcome === 'reduced')).toBe(true);
    const all = on('delimit', 'knowledge', 'allowlist', 'validate', 'approval');
    expect(ATTACKS.filter((a) => !a.benign).every((a) => runAttack(a, all).outcome === 'stopped')).toBe(true);
    expect(runAttack(ATTACKS.find((a) => a.benign)!, all).outcome).toBe('answered');
  });
  it('names the layers that stopped an attack', () => {
    expect(runAttack(ATTACKS.find((a) => a.id === 'hidden')!, on('allowlist', 'approval')).by).toEqual(['allowlist', 'approval']);
  });
});

describe('tool-calling stepper', () => {
  it('books only after approval when approval is required', () => {
    const steps = buildSteps({ scenario: 'available', requireApproval: true });
    const approval = steps.findIndex((s) => s.actor === 'person');
    const booking = steps.findIndex((s) => s.title === 'Your code books it');
    expect(approval).toBeGreaterThan(-1);
    expect(approval).toBeLessThan(booking);
    expect(steps.at(-1)!.payload).toMatchObject({ verified: true });
  });
  it('skips the person step without approval and says it is risky', () => {
    const steps = buildSteps({ scenario: 'available', requireApproval: false });
    expect(steps.some((s) => s.actor === 'person')).toBe(false);
    expect(steps.find((s) => s.title === 'Your code books it')!.explain).toMatch(/risky/);
  });
  it('offers real alternatives and books nothing when the slot is taken', () => {
    const steps = buildSteps({ scenario: 'taken', requireApproval: true });
    expect(steps.some((s) => s.title.includes('books'))).toBe(false);
    expect(steps.at(-1)!.payload).toMatchObject({ verified: true });
  });
  it('rejects malformed arguments with an error result, then continues', () => {
    expect(checkArgs.safeParse({ date: 'Thursday', time: '11am' }).success).toBe(false);
    const steps = buildSteps({ scenario: 'bad-args', requireApproval: false });
    const rejected = steps.find((s) => s.title.includes('rejected'))!;
    expect(JSON.stringify(rejected.payload)).toMatch(/"is_error":true/);
    expect(JSON.stringify(rejected.payload)).toMatch(/YYYY-MM-DD/);
    expect(steps.some((s) => s.title === 'Your code books it')).toBe(true);
  });
});
