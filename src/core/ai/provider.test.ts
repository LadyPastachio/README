import { describe, expect, it, vi } from 'vitest';
import { fetchStatus, serverProvider, toServerBody } from './provider';
import { simulate } from './simulated';

const json = (status: number, body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }));

describe('simulated provider', () => {
  it('labels everything as simulated', () => {
    for (const mode of ['socratic', 'explain', 'review', 'debug', 'quiz'] as const) expect(simulate({ task: 'mentor', mode, input: 'arrays' }).source).toBe('simulated');
  });
  it('guides with questions on the detected topic, without answers', () => {
    const r = simulate({ task: 'mentor', mode: 'socratic', input: 'my for loop never stops' });
    expect(r.text).toMatch(/condition/);
    expect(r.text.match(/\?/g)!.length).toBeGreaterThanOrEqual(2);
  });
  it('explains glossary terms and admits what it cannot explain', () => {
    expect(simulate({ task: 'mentor', mode: 'explain', input: 'What is HTTP?' }).text).toMatch(/^HTTP: /);
    expect(simulate({ task: 'mentor', mode: 'explain', input: 'quantum gravity' }).text).toMatch(/can only explain terms from the academy's glossary/);
  });
  it('reviews code with the rule checks', () => {
    const r = simulate({ task: 'mentor', mode: 'review', input: '', code: { html: '', css: '', js: 'var a = 1;\nif (a == 2) {}' } });
    expect(r.findings!.map((f) => f.id)).toEqual(['loose-equality', 'var']);
    expect(r.text).toMatch(/2 findings/);
  });
  it('debugs by explaining a pasted error message', () => {
    expect(simulate({ task: 'mentor', mode: 'debug', input: 'Uncaught ReferenceError: totl is not defined' }).text).toMatch(/doesn't know “totl”/);
  });
  it('quizzes from real review questions on the topic', () => {
    const r = simulate({ task: 'mentor', mode: 'quiz', input: 'json' });
    expect(r.quiz!.options.filter((o) => o.correct)).toHaveLength(1);
    expect(r.quiz!.from).toMatch(/JSON/i);
  });
  it('is honest that a prompt test generated nothing', () => {
    expect(simulate({ task: 'prompt-test', input: 'Write a poem' }).text).toMatch(/nothing was generated/);
  });
});

describe('server provider', () => {
  it('sends only task, mode, input and context, never a system prompt', () => {
    const body = toServerBody({ task: 'mentor', mode: 'review', input: 'check this', code: { html: '<p>', css: '', js: 'let a' } });
    expect(Object.keys(body).sort()).toEqual(['context', 'input', 'mode', 'task']);
    expect(body.context).toMatch(/--- index.html ---\n<p>\n--- script.js ---\nlet a/);
    expect(toServerBody({ task: 'prompt-test', input: 'x'.repeat(5000) }).input).toHaveLength(4000);
  });
  it('returns live answers with usage', async () => {
    const f = vi.fn(() => json(200, { text: 'Live answer', model: 'claude-opus-5-5', inputTokens: 40, outputTokens: 9, remainingToday: 49 }));
    const r = await serverProvider(f as unknown as typeof fetch).complete({ task: 'mentor', mode: 'explain', input: 'JSON' });
    expect(r).toMatchObject({ text: 'Live answer', source: 'live', usage: { input: 40, output: 9 }, remainingToday: 49 });
  });
  it('falls back to a labeled simulated answer on errors and network failure', async () => {
    const limited = await serverProvider((() => json(429, { error: 'Daily limit of 50 requests reached.' })) as unknown as typeof fetch).complete({ task: 'mentor', mode: 'socratic', input: 'loop' });
    expect(limited.source).toBe('simulated');
    expect(limited.notice).toMatch(/Daily limit/);
    const down = await serverProvider((() => Promise.reject(new TypeError('Failed to fetch'))) as unknown as typeof fetch).complete({ task: 'mentor', mode: 'socratic', input: 'loop' });
    expect(down.notice).toMatch(/isn't reachable/);
  });
  it('reports status: live, no key, or not running', async () => {
    expect((await fetchStatus((() => json(200, { live: true, model: 'm', remainingToday: 3, dailyLimit: 50 })) as unknown as typeof fetch)).live).toBe(true);
    expect((await fetchStatus((() => json(200, { live: false, reason: 'No API key is set on the server, so responses are simulated.' })) as unknown as typeof fetch)).reason).toMatch(/No API key/);
    expect((await fetchStatus((() => Promise.reject(new Error('x'))) as unknown as typeof fetch)).reason).toMatch(/isn't running/);
    expect((await fetchStatus((() => json(500, {})) as unknown as typeof fetch)).reason).toMatch(/status 500/);
  });
});
