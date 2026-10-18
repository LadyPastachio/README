import { test, expect } from '@playwright/test';

test('the check-in can be completed and shapes the next lesson', async ({ page }) => {
  await page.goto('/#/');
  await page.getByRole('link', { name: 'Start (2 min)' }).click();
  await page.getByRole('group', { name: 'Helpful formats' }).getByRole('checkbox', { name: 'Real-world analogies' }).click();
  await page.getByRole('button', { name: /^Next/ }).click();
  await page.getByRole('button', { name: /^Next/ }).click();
  await page.getByRole('button', { name: /^Next/ }).click();
  await page.getByRole('radio', { name: /Business automation/ }).click();
  await page.getByRole('button', { name: /Finish/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('How do you learn best?')).toHaveCount(0);
  await page.goto('/#/learn/lesson/http-and-apis');
  await expect(page.getByText(/Opened for you because of what you said/)).toBeVisible();
  await expect(page.locator('.help__analogy')).toContainText('shop counter');
});

test('"Let me experiment" opens lesson code in the Code Lab and runs it', async ({ page }) => {
  await page.goto('/#/learn/lesson/values-and-variables');
  await page.getByRole('button', { name: 'Experiment' }).click();
  await page.getByRole('button', { name: 'Open in Code Lab' }).first().click();
  await expect(page).toHaveURL(/#\/lab\/playground/);
  if ((page.viewportSize()?.width ?? 1000) < 900) await page.getByRole('radio', { name: /^Console/ }).click();
  await expect(page.getByRole('region', { name: 'Console' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Console' }).getByText(/console\.log output|budget|1200/).first()).toBeVisible();
});

test('lesson controls are reachable and usable on this screen size', async ({ page }) => {
  await page.goto('/#/learn/lesson/money-math');
  for (const name of ['Simpler', 'Analogy', 'Step by step', 'Another example', 'Compare', 'Challenge me']) {
    await page.getByRole('toolbar', { name: 'Lesson controls' }).getByRole('button', { name }).click();
    await expect(page.locator('.help__card')).toBeVisible();
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
