import { LESSONS } from '@/content/lessons';
import { LAB_EXERCISES } from '@/content/lab/exercises';
import { CERTIFICATIONS, VERIFIED_ON } from '@/content/certifications';
import { SKILLS } from '@/content/skills';
import { certificationStatus, certsUnlockedBySkill } from './certifications';
import { labResult, skillResult } from './mastery';
import { isGraded } from '@/content/schema';
import { ev } from './testHelpers';

const solveLesson = (id: string, at = '2026-10-01T10:00:00Z') =>
  LESSONS.find((l) => l.id === id)!.activities.filter(isGraded).map((a, i) => ev({ lessonId: id, activityId: a.id, at: new Date(Date.parse(at) + i * 1000).toISOString(), sessionId: `s-${id}` }));
const labPass = (id: string, extra = {}) => ev({ lessonId: id, activityId: 'checks', context: 'lab', kind: 'lab', sessionId: `lab-${id}`, ...extra });

describe('certification catalog', () => {
  it('only uses real skills, https links and at least one source each', () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    for (const c of CERTIFICATIONS) {
      for (const s of c.skills) expect(ids, `${c.id} → ${s}`).toContain(s);
      expect(c.url).toMatch(/^https:\/\//);
      expect(c.sources.length).toBeGreaterThan(0);
      for (const u of c.sources) expect(u).toMatch(/^https:\/\//);
    }
    expect(VERIFIED_ON).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('lab mastery', () => {
  it('ignores failed check runs but not hints or solutions', () => {
    const id = 'first-page';
    expect(labResult([], id).status).toBe('none');
    expect(labResult([labPass(id, { correct: false })], id).status).toBe('supported');
    expect(labResult([labPass(id, { correct: false }), labPass(id, { correct: false }), labPass(id)], id).status).toBe('independent');
    expect(labResult([labPass(id, { hintsShown: 1 })], id).status).toBe('supported');
    expect(labResult([labPass(id, { type: 'reveal', correct: null }), labPass(id)], id).status).toBe('challenge');
    // Hints opened after passing don't count against the pass.
    expect(labResult([labPass(id), labPass(id, { hintsShown: 2, correct: false })], id).status).toBe('independent');
  });

  it('counts toward skills alongside lessons', () => {
    expect(skillResult([labPass('first-page', { correct: false })], 'html', LESSONS, LAB_EXERCISES).status).toBe('supported');
    const both = [...solveLesson('html-structure'), labPass('first-page')];
    expect(skillResult(both, 'html', LESSONS, LAB_EXERCISES).status).toBe('independent');
    // A lab-only skill can reach independent, but not retained (no spaced review).
    expect(skillResult([labPass('style-a-card')], 'css-layout', LESSONS, LAB_EXERCISES).status).toBe('independent');
  });
});

describe('certification readiness', () => {
  it('starts with nothing ready', () => {
    expect(certificationStatus([], LESSONS, LAB_EXERCISES).every((s) => s.readiness === 'later')).toBe(true);
  });

  it('becomes "ready" only when every required skill is demonstrated independently', () => {
    const half = solveLesson('what-a-model-does');
    const s1 = certificationStatus(half, LESSONS, LAB_EXERCISES).find((s) => s.cert.id === 'claude-ai-fluency')!;
    expect(s1.readiness).toBe('building');
    expect(s1.done).toEqual(['ai-literacy']);
    const full = [...half, ...solveLesson('describing-requirements')];
    const statuses = certificationStatus(full, LESSONS, LAB_EXERCISES);
    expect(statuses[0]).toMatchObject({ readiness: 'ready', cert: { id: 'claude-ai-fluency' } });
    expect(certsUnlockedBySkill(statuses, 'tech-communication').map((s) => s.cert.id)).toEqual(['claude-ai-fluency']);
  });

  it('does not count work done with hints', () => {
    const hinted = [...solveLesson('what-a-model-does'), ...solveLesson('describing-requirements').map((e) => ({ ...e, hintsShown: 1 }))];
    expect(certificationStatus(hinted, LESSONS, LAB_EXERCISES).find((s) => s.cert.id === 'claude-ai-fluency')!.readiness).toBe('building');
  });

  it('marks partner-only certifications as unavailable rather than ready', () => {
    const fakeCert = { ...CERTIFICATIONS.find((c) => c.id === 'claude-certified-architect')!, skills: ['ai-literacy'] };
    const s = certificationStatus(solveLesson('what-a-model-does'), LESSONS, LAB_EXERCISES, [fakeCert]);
    expect(s[0]!.readiness).toBe('unavailable');
  });

  it('makes the free Responsive Web Design certification reachable through lessons and labs', () => {
    const events = [...solveLesson('html-structure'), labPass('first-page'), labPass('style-a-card'), labPass('label-the-form')];
    expect(certificationStatus(events, LESSONS, LAB_EXERCISES).find((s) => s.cert.id === 'fcc-responsive-web-design')!.readiness).toBe('ready');
  });
});
