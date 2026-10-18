import { test, expect } from '@playwright/test';

test.describe('AI Workshop', () => {
  test('simulated mode makes no network requests to the AI server', async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', (r) => r.url().includes('/api/') && apiCalls.push(r.url()));
    await page.goto('/#/ai/mentor');
    await page.getByLabel('Your message').fill('What is JSON?');
    await page.getByRole('radio', { name: 'Explain' }).click();
    await page.getByRole('button', { name: 'Ask' }).click();
    await expect(page.locator('.ai-response')).toContainText('JSON:');
    await expect(page.locator('.ai-response .ai-source')).toHaveText('Simulated');
    expect(apiCalls).toEqual([]);
  });

  test('Local server mode reaches the real server through the proxy, and stays simulated without a key', async ({ page }) => {
    await page.goto('/#/settings');
    const panel = page.locator('#ai');
    await panel.getByRole('radio', { name: 'Local server' }).click();
    await expect(panel.getByRole('status', { name: 'AI connection' })).toContainText('No API key is set on the server');
    await page.goto('/#/ai/coach');
    await page.getByRole('button', { name: 'Try it' }).click();
    await expect(page.locator('.ai-response')).toContainText('nothing was generated');
    await expect(page.locator('.ai-response .ai-source')).toHaveText('Simulated');
  });

  test('the API key never appears in the page or its storage', async ({ page }) => {
    await page.goto('/#/settings');
    await page.locator('#ai').getByRole('radio', { name: 'Local server' }).click();
    await page.goto('/#/ai');
    const dump = await page.evaluate(() => document.documentElement.outerHTML + JSON.stringify({ ...localStorage }));
    expect(dump).not.toMatch(/sk-ant|ANTHROPIC_API_KEY=/);
  });

  test('structured outputs: switching on every safety step leaves nothing wrong or crashed', async ({ page }) => {
    await page.goto('/#/ai/structured');
    for (const name of ['Remove code fences', 'Extract the JSON', 'Validate against the schema', 'Reject unknown fields', 'Retry once with the error', 'Fall back to a person']) {
      await page.getByRole('switch', { name }).click();
    }
    const results = page.getByRole('status', { name: 'Evaluation results' });
    await expect(results.locator('[data-k="wrong"] strong')).toHaveText('0');
    await expect(results.locator('[data-k="crashed"] strong')).toHaveText('0');
  });

  test('temperature slider reshapes the word probabilities', async ({ page }) => {
    await page.goto('/#/ai/request');
    const top = page.locator('.ai-bars li').first().locator('.ai-bars__pct');
    const before = await top.textContent();
    await page.getByLabel('Temperature').fill('0');
    await expect(top).toHaveText('100.0%');
    expect(before).not.toBe('100.0%');
  });

  test('Code Lab review finds problems and jumps to the line', async ({ page }) => {
    await page.goto('/#/lab/label-the-form');
    if ((page.viewportSize()?.width ?? 1000) < 900) await page.getByRole('radio', { name: /^Task/ }).click();
    await page.getByRole('button', { name: 'Review my code' }).click();
    const list = page.getByRole('list', { name: 'Review findings' });
    await expect(list).toContainText('Accessibility');
    await list.getByRole('button', { name: /index\.html, line \d+/ }).first().click();
    await expect(page.getByRole('tab', { name: 'index.html' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('region', { name: 'Code editor' })).toBeVisible();
  });
});
