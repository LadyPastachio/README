import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Automated accessibility audit (axe-core, WCAG 2.1 A and AA rules) on every main screen, in light and dark themes. */
const PAGES = [
  '#/', '#/learn', '#/learn/path/web', '#/learn/lesson/functions', '#/learn/lesson/structured-outputs', '#/learn/glossary', '#/review',
  '#/projects', '#/lab', '#/lab/counter-button', '#/lab/sql-new-leads', '#/lab/experiment/first-webpage', '#/ai', '#/ai/mentor', '#/ai/coach', '#/ai/request', '#/ai/structured',
  '#/ai/tools', '#/ai/injection', '#/progress', '#/progress/certifications', '#/circles', '#/settings', '#/welcome',
];

for (const theme of ['light', 'dark'] as const) {
  for (const hash of PAGES) {
    test(`${hash} has no detectable accessibility violations (${theme})`, async ({ page }, info) => {
      test.skip(info.project.name === 'tablet', 'Desktop and phone layouts cover the tablet rules');
      test.setTimeout(60_000); // axe on the largest pages (Settings) can take a while on slow machines
      await page.addInitScript((t) => localStorage.setItem('academy:settings', JSON.stringify({ appearance: { theme: t } })), theme);
      await page.goto(`/${hash}`);
      await expect(page.locator('h1').first()).toBeVisible();
      await page.waitForTimeout(300);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).exclude('iframe')
        // CodeMirror's scroller holds a contenteditable editor that the keyboard reaches with Tab; axe doesn't count contenteditable as focusable.
        .disableRules(['scrollable-region-focusable'])
        .analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help} → ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(summary).toEqual([]);
    });
  }
}
