import { test, expect, type Page } from '@playwright/test';
import { LAB_EXERCISES } from '../src/content/lab/exercises';

const PAGE = (body: string) =>
  `<!doctype html>\n<html lang="en">\n<head>\n  <title>T</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n${body}\n  <script src="script.js"></script>\n</body>\n</html>\n`;

/** Seeds an exercise's saved code before the app loads. */
async function seed(page: Page, id: string, files: { html?: string; css?: string; js?: string }, prediction?: string) {
  await page.addInitScript(
    ([id, files, prediction]) => {
      const store = JSON.parse(localStorage.getItem('academy:lab') || '{"version":1,"workspaces":{}}');
      store.workspaces[id as string] = { files, updatedAt: new Date().toISOString(), ...(prediction ? { prediction } : {}) };
      localStorage.setItem('academy:lab', JSON.stringify(store));
      localStorage.setItem('academy:test-marker', 'keep-me');
    },
    [id, { html: PAGE('<main><h1>Hi</h1></main>'), css: '', js: '', ...files }, prediction] as const,
  );
}

const consoleText = (page: Page) => page.getByRole('region', { name: 'Console' });
/** On narrow layouts (under 900px) the lab shows one panel at a time. */
async function openPane(page: Page, name: 'Task' | 'Code' | 'Preview' | 'Console') {
  if ((page.viewportSize()?.width ?? 1000) < 900) await page.getByRole('radio', { name: new RegExp(`^${name}`) }).click();
}

test.describe('sandbox', () => {
  test('learner code cannot reach the app, its storage or the network', async ({ page }) => {
    await seed(page, 'playground', {
      js: [
        'try { console.log("parent title: " + parent.document.title); } catch (e) { console.log("parent blocked: " + e.name); }',
        'try { localStorage.getItem("academy:settings"); console.log("storage readable"); } catch (e) { console.log("storage blocked"); }',
        'fetch("https://example.com").then(() => console.log("network reached")).catch(() => console.log("network blocked"));',
      ].join('\n'),
    });
    await page.goto('/#/lab/playground');
    await openPane(page, 'Console');
    const c = consoleText(page);
    await expect(c.getByText('parent blocked: SecurityError')).toBeVisible();
    await expect(c.getByText('storage blocked')).toBeVisible();
    await expect(c.getByText('network blocked')).toBeVisible();
    await expect(c.getByText('network reached')).toHaveCount(0);
    await expect(c.getByText(/storage readable|parent title/)).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('academy:test-marker'))).toBe('keep-me');
    await expect(page.locator('iframe.lab-frame')).toHaveAttribute('sandbox', 'allow-scripts allow-modals');
  });

  test('an infinite loop is stopped and the app stays responsive', async ({ page }) => {
    await seed(page, 'playground', { js: 'console.log("before");\nwhile (true) {}\n' });
    await page.goto('/#/lab/playground');
    await openPane(page, 'Console');
    await expect(consoleText(page).getByText('A loop never stopped')).toBeVisible({ timeout: 8000 });
    await expect(consoleText(page).getByText('before')).toBeVisible();
    await openPane(page, 'Code');
    await page.getByRole('tab', { name: /style\.css/ }).click();
    await expect(page.getByRole('tab', { name: /style\.css/ })).toHaveAttribute('aria-selected', 'true');
  });

  test('runtime errors point to the right line, in plain language', async ({ page }) => {
    await seed(page, 'playground', { js: 'const a = 1;\nconsole.log(a);\ntotl + 1;\n' });
    await page.goto('/#/lab/playground');
    await openPane(page, 'Console');
    await expect(consoleText(page).getByText('JavaScript doesn\'t know “totl”')).toBeVisible();
    await expect(consoleText(page).getByRole('button', { name: 'script.js, line 3' })).toBeVisible();
  });

  test('syntax errors are caught before running', async ({ page }) => {
    await seed(page, 'playground', { js: 'console.log("hi");\nlet x = (1 + ;\n' });
    await page.goto('/#/lab/playground');
    await openPane(page, 'Console');
    await expect(consoleText(page).getByRole('button', { name: 'script.js, line 2' })).toBeVisible();
    await expect(consoleText(page).getByText('hi', { exact: true })).toHaveCount(0);
  });

  test('warns when style.css is not linked', async ({ page }) => {
    await seed(page, 'playground', { html: '<h1>No links</h1>', css: 'h1 { color: red; }' });
    await page.goto('/#/lab/playground');
    await openPane(page, 'Console');
    await expect(consoleText(page).getByText(/style\.css isn't linked/)).toBeVisible();
  });
});

test.describe('exercises', () => {
  for (const ex of LAB_EXERCISES.filter((x) => x.kind !== 'playground')) {
    test(`${ex.id}: starter fails a check, reference solution passes all`, async ({ page }, info) => {
      test.skip(info.project.name !== 'desktop', 'Content check runs once');
      const check = async () => {
        await page.getByRole('button', { name: 'Check my work' }).click();
        await expect(page.locator('.lab-criteria li[data-state="running"]')).toHaveCount(0, { timeout: 8000 });
        await expect(page.locator('.lab-criteria li[data-state="idle"]')).toHaveCount(0);
      };
      const prediction = ex.predict ? ex.predict.answer : undefined;
      await seed(page, ex.id, ex.starter, prediction);
      await page.goto(`/#/lab/${ex.id}`);
      await check();
      expect(await page.locator('.lab-criteria li[data-state="fail"]').count(), 'starter should fail at least one check').toBeGreaterThan(0);

      const ctx = await page.context().browser()!.newContext();
      const p2 = await ctx.newPage();
      await seed(p2, ex.id, { ...ex.starter, ...ex.solution }, prediction);
      await p2.goto(`${info.project.use.baseURL}/#/lab/${ex.id}`);
      await p2.getByRole('button', { name: 'Check my work' }).click();
      await expect(p2.locator('.lab-criteria li[data-state="running"]')).toHaveCount(0, { timeout: 8000 });
      const failing = await p2.locator('.lab-criteria li[data-state="fail"]').allTextContents();
      expect(failing, 'solution should pass every check').toEqual([]);
      await expect(p2.getByText('All checks pass.')).toBeVisible();
      await expect(p2.getByText('You did this on your own.')).toBeVisible();
      await ctx.close();
    });
  }
});

test('passing an exercise counts toward the skill on My Progress', async ({ page }) => {
  const ex = LAB_EXERCISES.find((x) => x.id === 'style-a-card')!;
  await seed(page, ex.id, { ...ex.starter, ...ex.solution });
  await page.goto('/#/lab/style-a-card');
  const isMobile = (page.viewportSize()?.width ?? 1000) < 900;
  if (isMobile) await page.getByRole('radio', { name: 'Task' }).click();
  await page.getByRole('button', { name: 'Check my work' }).click();
  await expect(page.getByText('All checks pass.')).toBeVisible();
  await page.goto('/#/progress');
  await expect(page.locator('#skill-css-layout').getByText('Demonstrated independently')).toBeVisible();
});

test('certifications page lists providers with sources and a verified date', async ({ page }) => {
  await page.goto('/#/progress/certifications');
  await expect(page.getByRole('heading', { level: 1, name: 'Certifications' })).toBeVisible();
  await expect(page.getByText(/Details were checked on/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Visit provider/ }).first()).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.getByText('freeCodeCamp').first()).toBeVisible();
});

test('all three file tabs are fully visible at this screen size', async ({ page }) => {
  await page.goto('/#/lab/counter-button');
  if ((page.viewportSize()?.width ?? 1000) < 900) await page.getByRole('radio', { name: 'Code' }).click();
  for (const name of ['index.html', 'style.css', 'script.js']) {
    const fits = await page.getByRole('tab', { name }).evaluate((el) => {
      const r = el.getBoundingClientRect();
      const bar = el.closest('.lab-tabs')!.getBoundingClientRect();
      return r.left >= bar.left - 1 && r.right <= bar.right + 1;
    });
    expect(fits, `${name} tab should fit`).toBe(true);
  }
});

test('one panel at a time on narrow screens', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 1000) >= 900, 'Narrow layouts only');
  await page.goto('/#/lab/counter-button');
  await expect(page.getByRole('heading', { name: 'Make a button count' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Code editor' })).toBeHidden();
  await page.getByRole('radio', { name: 'Code' }).click();
  await expect(page.getByRole('region', { name: 'Code editor' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Make a button count' })).toBeHidden();
});
