import { describe, expect, it, vi, afterEach } from 'vitest';
import { progressSummary } from './progressSummary';
import { api } from './api';
import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { ev } from '@/core/learning/testHelpers';
import { isGraded } from '@/content/schema';

const solve = (id: string) =>
  LESSONS.find((l) => l.id === id)!.activities.filter(isGraded).map((a, i) => ev({ lessonId: id, activityId: a.id, sessionId: `s-${id}`, at: new Date(Date.UTC(2026, 9, 1, 10, 0, i)).toISOString() }));
const pass = (id: string) => ev({ lessonId: id, activityId: 'checks', context: 'lab', kind: 'lab', sessionId: `lab-${id}` });

afterEach(() => vi.unstubAllGlobals());

describe('progress summary for circles', () => {
  it('says when nothing is demonstrated yet', () => {
    expect(progressSummary([], LESSONS, LAB_EXERCISES, null)).toBe('Just getting started: no skills demonstrated yet.');
  });
  it('lists demonstrated skills and the current milestone, and nothing private', () => {
    const events = [...solve('values-and-variables'), pass('counter-button')];
    const text = progressSummary(events, LESSONS, LAB_EXERCISES, 'web');
    expect(text).toMatch(/Demonstrated independently: .*JavaScript basics/);
    expect(text).toMatch(/Working on: Interactive website/);
    expect(text).not.toMatch(/confidence|answer|explanation/i);
  });
});

describe('api helper', () => {
  it('reports an unreachable server in plain language', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))));
    expect(await api('GET', 'auth/me')).toEqual({ ok: false, status: 0, error: expect.stringMatching(/npm run server/) });
  });
  it('treats a non-JSON answer (a static host without the server) as unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response('<html>not found</html>', { status: 404 }))));
    expect((await api('GET', 'auth/me')).ok).toBe(false);
  });
  it('passes server error messages through', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(JSON.stringify({ error: 'Email or password is incorrect.' }), { status: 401 }))));
    expect(await api('POST', 'auth/login', {})).toEqual({ ok: false, status: 401, error: 'Email or password is incorrect.' });
  });
});
