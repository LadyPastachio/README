import { describe, expect, it } from 'vitest';
import { EXPERIMENTS, experimentsForLesson, getExperiment, parseExperiments } from './index';
import { LESSONS } from '@/content/lessons';
import { SKILLS } from '@/content/skills';
import { normalizeExperiments } from '@/core/experiments/progressStore';

describe('guided experiments', () => {
  it('are valid, linked to real lessons and skills, with unique step ids', () => {
    expect(EXPERIMENTS.length).toBeGreaterThan(0);
    for (const x of EXPERIMENTS) {
      for (const l of x.lessons) expect(LESSONS.some((lesson) => lesson.id === l), `${x.id} → ${l}`).toBe(true);
      expect(SKILLS.some((s) => s.id === x.skill)).toBe(true);
      const ids = x.steps.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('give every step a task, an expected result, at least two hints and a check', () => {
    for (const x of EXPERIMENTS) for (const s of x.steps) {
      expect(s.task.length, s.id).toBeGreaterThan(0);
      expect(s.hints.length, s.id).toBeGreaterThanOrEqual(2);
      expect(!!s.test || !!s.choices?.length, s.id).toBe(true);
    }
  });

  it('have check code that parses', () => {
    for (const x of EXPERIMENTS) for (const s of x.steps) {
      for (const code of [s.test, ...(s.choices ?? []).map((c) => c.test)].filter(Boolean)) {
        expect(() => new Function('doc', 'logs', 'source', code!), s.id).not.toThrow();
      }
    }
  });

  it('first webpage: starter files match the brief and link each other', () => {
    const x = getExperiment('first-webpage')!;
    expect(x.starter.html).toContain('<h1 id="greeting">Hello, world!</h1>');
    expect(x.starter.html).toContain('<link rel="stylesheet" href="style.css">');
    expect(x.starter.html).toContain('<script src="script.js"></script>');
    expect(x.starter.css).toContain('background-color: #f4f1ea;');
    expect(x.starter.css).toContain('background-color: #365b49;');
    expect(x.starter.js).toContain('message.textContent = "You made this webpage interactive!";');
    expect(x.steps.map((s) => s.file)).toEqual(['html', 'css', 'css', 'js', null]);
    expect(experimentsForLesson('html-structure').map((e) => e.id)).toContain('first-webpage');
  });

  it('rejects a step with neither a check nor choices', () => {
    const x = getExperiment('first-webpage')!;
    const broken = { ...x, id: 'broken', steps: [{ ...x.steps[0]!, test: undefined }] };
    expect(() => parseExperiments([broken])).toThrow(/Experiment "broken" is invalid/);
  });

  it('keeps valid saved progress and drops damaged entries', () => {
    const files = { html: 'a', css: 'b', js: 'c' };
    const out = normalizeExperiments({ version: 1, experiments: { good: { files, step: 1 }, bad: { step: 'x' } } });
    expect(Object.keys(out.experiments)).toEqual(['good']);
    expect(out.experiments.good).toMatchObject({ files, step: 1, completed: [], choice: null });
    expect(normalizeExperiments('garbage').experiments).toEqual({});
  });
});
