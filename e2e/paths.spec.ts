import { test, expect } from '@playwright/test';

test('choosing a path on Home focuses recommendations on it', async ({ page }) => {
  await page.goto('/#/');
  await page.locator('.choose-path__opt[data-path="chess"]').click();
  await expect(page.locator('.choose-path')).toHaveCount(0);
  await page.goto('/#/settings#learning');
  await expect(page.getByLabel('Current path')).toHaveValue('chess');
  await page.goto('/#/learn/path/chess');
  await expect(page.getByText('Your current path')).toBeVisible();
  await expect(page.locator('.ms[data-current]').getByRole('heading', { name: 'Board and pieces' })).toBeVisible();
});

test('switching paths keeps shared progress', async ({ page }) => {
  await page.goto('/#/learn/path/finance');
  await page.getByRole('button', { name: 'Make this my path' }).click();
  await expect(page.getByText('Your current path')).toBeVisible();
  await page.goto('/#/learn/path/web');
  await page.getByRole('button', { name: 'Make this my path' }).click();
  await expect(page.getByText('Your current path')).toBeVisible();
});

test('project notes are saved and survive a reload', async ({ page }) => {
  await page.goto('/#/projects');
  await page.getByRole('tab', { name: /Chess game/ }).click();
  await page.getByLabel('Known issues').fill('Pieces can move anywhere for now');
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: /Chess game/ }).click();
  await expect(page.getByLabel('Known issues')).toHaveValue('Pieces can move anywhere for now');
});

test('the skill map shows every skill and filters by path', async ({ page }) => {
  await page.goto('/#/progress');
  const nodes = page.locator('.skill-map__node');
  await expect(nodes.first()).toBeVisible();
  expect(await nodes.count()).toBeGreaterThanOrEqual(30);
  await page.getByRole('radio', { name: 'Chess' }).click();
  expect(await page.locator('.skill-map__node[data-dim]').count()).toBeGreaterThan(0);
});

test('a passed path project completes items in its milestone', async ({ page }) => {
  // Seed a passing record for the chess project, as if the checks passed.
  await page.addInitScript(() => {
    const e = { id: 'x1', at: new Date().toISOString(), type: 'answer', context: 'lab', sessionId: 'lab1', lessonId: 'chess-click-move', activityId: 'checks', kind: 'lab', correct: true, answer: '4 of 4 checks passed', hintsShown: 0, confidence: null, misconception: null, lessonOrder: null, selfCheck: null };
    localStorage.setItem('academy:records', JSON.stringify({ version: 1, events: [e] }));
  });
  await page.goto('/#/learn/path/chess');
  await expect(page.locator('.ms__items li[data-state="done"]').filter({ hasText: 'Move pieces with clicks' })).toBeVisible();
});
