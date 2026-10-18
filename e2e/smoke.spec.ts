import { test, expect, type Page } from '@playwright/test';

const PAGES = [
  { hash: '#/', heading: 'Welcome. Here’s where to start.' },
  { hash: '#/review', heading: 'Nothing due right now' },
  { hash: '#/learn/lesson/values-and-variables', heading: 'Values and variables' },
  { hash: '#/learn/lesson/html-structure', heading: 'HTML: structure and meaning' },
  { hash: '#/learn', heading: 'Paths, skills and lessons' },
  { hash: '#/learn/path/chess', heading: 'Chess game' },
  { hash: '#/learn/path/automation', heading: 'Business automation' },
  { hash: '#/learn/lesson/chess-board-as-data', heading: 'A chess board as data' },
  { hash: '#/learn/lesson/validating-input', heading: 'Never trust incoming data' },
  { hash: '#/lab/lead-workflow', heading: 'A simulated lead workflow' },
  { hash: '#/learn/lesson/how-a-page-reaches-you', heading: 'How a web page reaches your screen' },
  { hash: '#/learn/glossary', heading: 'Glossary' },
  { hash: '#/projects', heading: 'Your four projects' },
  { hash: '#/lab', heading: 'Write, run and debug code' },
  { hash: '#/lab/counter-button', heading: 'Make a button count' },
  { hash: '#/progress/certifications', heading: 'Certifications' },
  { hash: '#/ai', heading: 'Prompts, APIs, tools and agents' },
  { hash: '#/ai/mentor', heading: 'Mentor' },
  { hash: '#/ai/coach', heading: 'Prompt coach' },
  { hash: '#/ai/request', heading: 'Requests, tokens and cost' },
  { hash: '#/ai/structured', heading: 'Structured outputs' },
  { hash: '#/ai/tools', heading: 'Tool calling, step by step' },
  { hash: '#/ai/injection', heading: 'Prompt injection lab' },
  { hash: '#/learn/lesson/structured-outputs', heading: 'Structured outputs you can trust' },
  { hash: '#/learn/lesson/prompt-injection', heading: 'Defending against prompt injection' },
  { hash: '#/lab/tool-dispatcher', heading: 'A safe tool dispatcher' },
  { hash: '#/lab/sql-overdue-followups', heading: 'SQL: overdue follow-ups' },
  { hash: '#/lab/capstone-follow-up-agent', heading: 'Capstone: a white-label follow-up agent' },
  { hash: '#/learn/lesson/sql-basics', heading: 'Asking a database questions with SQL' },
  { hash: '#/learn/lesson/accessible-forms', heading: 'Forms everyone can use' },
  { hash: '#/learn/path/finance', heading: 'Finance tracker' },
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

test('completing a lesson updates mastery, Home and Progress', async ({ page }) => {
  await page.goto('/#/learn/lesson/how-a-page-reaches-you');
  // Activity 1: put steps in order using the move buttons until correct.
  const correct = [
    'You type an address and press Enter',
    "The browser looks up the server's address in DNS",
    'The browser sends an HTTP request to the server',
    'The server sends back a response with HTML',
    'The browser requests the CSS, JavaScript and images the HTML mentions',
    'The browser draws the page and runs its scripts',
  ];
  const items = page.locator('.order-item__text');
  for (let target = 0; target < correct.length; target++) {
    const texts = await items.allTextContents();
    let from = texts.indexOf(correct[target]!);
    while (from > target) {
      await page.getByRole('button', { name: `Move “${correct[target]}” up` }).click();
      from--;
    }
  }
  await page.getByRole('button', { name: 'Check order' }).click();
  await expect(page.getByText('All 6 in place.')).toBeVisible();
  // Activity 2: multiple choice.
  await page.getByText('The server was reached, but it has nothing at that address.').click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText('Correct.', { exact: true })).toBeVisible();
  // Summary shows completion and the next review.
  await expect(page.getByText('Lesson complete')).toBeVisible();
  await expect(page.getByText(/Next review:/)).toBeVisible();
  await expect(page.locator('.summary').getByText('Demonstrated independently')).toBeVisible();

  await page.goto('/#/progress');
  await expect(page.locator('#skill-how-web-works').getByText('Demonstrated independently')).toBeVisible();
  await page.goto('/#/');
  await expect(page.getByRole('heading', { level: 1, name: 'Today’s plan' })).toBeVisible();
  await expect(page.getByText(/Nothing due right now/)).toBeVisible();
  await expect(page.locator('.upcoming').getByText('How a web page reaches your screen')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Today’s plan' })).toBeVisible();
});
