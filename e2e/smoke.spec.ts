import { test, expect, type Page } from '@playwright/test';

const PAGES = [
  { hash: '#/', heading: 'What to work on next' },
  { hash: '#/learn', heading: 'Paths, skills and lessons' },
  { hash: '#/learn/path/chess', heading: 'Chess game' },
  { hash: '#/learn/lesson/how-a-page-reaches-you', heading: 'How a web page reaches your screen' },
  { hash: '#/learn/glossary', heading: 'Glossary' },
  { hash: '#/projects', heading: 'Your four projects' },
  { hash: '#/lab', heading: 'Write, run and debug code' },
  { hash: '#/ai', heading: 'Prompts, APIs, tools and agents' },
  { hash: '#/progress', heading: 'What you can actually do' },
  { hash: '#/circles', heading: 'Learn alongside friends' },
  { hash: '#/settings', heading: 'Settings' },
];

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'page should not scroll sideways').toBeLessThanOrEqual(0);
}

for (const p of PAGES) {
  test(`${p.hash} renders without errors or sideways scroll`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(`/${p.hash}`);
    await expect(page.getByRole('heading', { level: 1, name: p.heading })).toBeVisible();
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
    if (process.env.SCREENSHOTS) {
      const name = p.hash.replace(/[#/]+/g, '-').replace(/^-|-$/g, '') || 'home';
      await page.screenshot({ path: `test-results/shots/${info.project.name}-${name}.png`, fullPage: true });
    }
  });
}

test('navigation adapts to screen size', async ({ page }, info) => {
  await page.goto('/#/');
  const bottomNav = page.locator('.bottom-nav');
  const sidebar = page.locator('.sidebar');
  if (info.project.name === 'mobile') {
    await expect(bottomNav).toBeVisible();
    await expect(sidebar).toBeHidden();
    await page.getByRole('button', { name: 'More' }).click();
    await page.getByRole('link', { name: /Settings/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
  } else {
    await expect(sidebar).toBeVisible();
    await expect(bottomNav).toBeHidden();
    await sidebar.getByRole('link', { name: 'AI Workshop' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Prompts, APIs, tools and agents' })).toBeVisible();
  }
});

test('theme setting survives a reload', async ({ page }) => {
  await page.goto('/#/settings');
  await page.getByRole('radio', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('radio', { name: 'Dark' })).toHaveAttribute('aria-checked', 'true');
});

test('search finds a glossary term and opens it', async ({ page }) => {
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('/');
  await page.getByRole('searchbox', { name: 'Search' }).fill('prompt injection');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/glossary#prompt-injection/);
  await expect(page.locator('#prompt-injection')).toBeInViewport();
});

test('backup round-trip restores settings after confirmation', async ({ page }) => {
  await page.goto('/#/settings');
  await page.getByRole('radio', { name: 'Indigo' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download backup' }).click();
  const file = await (await download).path();
  await page.getByRole('radio', { name: 'Moss' }).click();
  await page.locator('#import-file').setInputFiles(file!);
  await expect(page.getByRole('heading', { name: 'Restore this backup?' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'moss'); // nothing changes before confirming
  await page.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'indigo');
});

test('rejects a file that is not a backup', async ({ page }) => {
  await page.goto('/#/settings');
  await page.locator('#import-file').setInputFiles({ name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await expect(page.getByText("doesn't look like an Atelier Academy backup")).toBeVisible();
});
