import { LESSONS, getLesson } from '@/content/lessons';
import { DEFAULT_SETTINGS } from '../settings/schema';
import { availableHelp, chooseAutoOpen, helpEffects } from './help';
import { ev } from './testHelpers';
import { experimentFiles, looksLikeCss } from '@/features/learn/experiment';
import { findLinks } from '../lab/buildDocument';

const lesson = getLesson('conditions')!;
const profile = (p: Partial<typeof DEFAULT_SETTINGS.profile>) => ({ ...DEFAULT_SETTINGS.profile, ...p });
const help = (kind: string, session: string, at: number) => ev({ lessonId: 'x', activityId: `help:${kind}`, type: 'help', kind: 'explain', correct: null, sessionId: session, at: new Date(Date.UTC(2026, 9, 1, 10, 0, at)).toISOString() });
const ans = (id: string, correct: boolean, session: string, at: number) => ev({ lessonId: 'x', activityId: id, correct, sessionId: session, at: new Date(Date.UTC(2026, 9, 1, 10, 0, at)).toISOString() });

describe('lesson help', () => {
  it('every lesson offers the core controls, and diagram/compare only where they exist', () => {
    for (const l of LESSONS) {
      const offered = availableHelp(l);
      for (const k of ['simpler', 'analogy', 'steps', 'example', 'challenge'] as const) expect(offered, l.id).toContain(k);
      expect(offered.includes('diagram')).toBe(l.sections.some((s) => s.diagram));
      expect(offered.includes('compare')).toBe(!!l.alternatives.compare);
    }
  });

  it('opens nothing automatically without preferences or evidence', () => {
    expect(chooseAutoOpen(lesson, DEFAULT_SETTINGS.profile, [])).toBeNull();
  });

  it('opens what you said helps, skipping formats you find frustrating', () => {
    expect(chooseAutoOpen(lesson, profile({ preferredFormats: ['analogies'] }), [])).toEqual({ kind: 'analogy', because: 'you-said' });
    expect(chooseAutoOpen(lesson, profile({ preferredFormats: ['diagrams', 'step-by-step'] }), [])).toEqual({ kind: 'steps', because: 'you-said' }); // no diagram in this lesson
    expect(chooseAutoOpen(lesson, profile({ preferredFormats: ['analogies'], frustratingFormats: ['analogies'] }), [])).toBeNull();
  });

  it('prefers evidence over stated preference when a kind of help clearly works', () => {
    const events = [
      // Three visits where "steps" was used, then the next answer was right.
      help('steps', 'a', 1), ans('q1', true, 'a', 2), help('steps', 'b', 3), ans('q2', true, 'b', 4), help('steps', 'c', 5), ans('q3', true, 'c', 6),
      // Visits without help: mostly wrong first time.
      ans('q4', false, 'd', 7), ans('q5', false, 'e', 8), ans('q6', true, 'f', 9),
    ];
    const fx = helpEffects(events).find((h) => h.kind === 'steps')!;
    expect(fx).toMatchObject({ uses: 3, after: 100, baseline: 33 });
    expect(chooseAutoOpen(lesson, profile({ preferredFormats: ['analogies'] }), events)).toEqual({ kind: 'steps', because: 'it-helped' });
  });

  it('needs at least three uses before trusting the evidence', () => {
    const events = [help('example', 'a', 1), ans('q1', true, 'a', 2), ans('q4', false, 'd', 7)];
    expect(chooseAutoOpen(lesson, DEFAULT_SETTINGS.profile, events)).toBeNull();
  });
});

describe('experiments', () => {
  it('turns each kind of lesson code into a runnable Code Lab page', () => {
    const js = experimentFiles('console.log(1);');
    expect(js.js).toContain('console.log(1)');
    expect(findLinks(js.html)).toEqual({ css: true, js: true });
    const css = experimentFiles('.nav {\n  display: flex;\n  gap: 16px;\n}');
    expect(looksLikeCss('.nav { display: flex; }')).toBe(true);
    expect(css.css).toContain('display: flex');
    expect(css.html).toContain('class="nav"');
    const html = experimentFiles('<main>\n  <h1>Hi</h1>\n</main>');
    expect(html.html).toContain('<h1>Hi</h1>');
    expect(findLinks(html.html).js).toBe(true);
    expect(experimentFiles('{\n  "a": 1\n}').js).toContain('const data =');
  });
  it('every lesson code example becomes a page with linked files', () => {
    for (const l of LESSONS) for (const s of l.sections) if (s.code) expect(findLinks(experimentFiles(s.code).html), `${l.id}/${s.heading}`).toEqual({ css: true, js: true });
  });
});
