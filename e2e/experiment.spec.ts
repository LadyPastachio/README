import { test, expect, type Page } from '@playwright/test';
import { getExperiment } from '../src/content/experiments';

const X = getExperiment('first-webpage')!;
const URL = '/#/lab/experiment/first-webpage';
const narrow = (page: Page) => (page.viewportSize()?.width ?? 1000) < 900;
const frame = (page: Page) => page.frameLocator('iframe[title="Live preview of your webpage"]');

async function show(page: Page, pane: 'Steps' | 'Code' | 'Preview') {
  if (narrow(page)) await page.getByRole('radio', { name: new RegExp(`^${pane}`) }).click();
}
/** Replaces a file's content in the editor, the way a learner would by selecting all and typing. */
async function setFile(page: Page, file: 'index.html' | 'style.css' | 'script.js', content: string) {
  await show(page, 'Code');
  await page.getByRole('tab', { name: new RegExp(`^${file.replace('.', '\\.')}`) }).click();
  const editor = page.getByRole('region', { name: 'Code editor' }).locator('.cm-content');
  await editor.click();
  await page.keyboard.press('ControlOrMeta+a');
  await page.keyboard.insertText(content);
}
async function runCode(page: Page) {
  await show(page, 'Code');
  await page.getByRole('region', { name: 'Code editor' }).getByRole('button', { name: 'Run Code' }).click();
}
async function checkWork(page: Page) {
  await show(page, 'Steps');
  await page.getByRole('button', { name: 'Check My Work' }).click();
  return page.locator('.xp-feedback');
}
const HTML_DONE = X.starter.html.replace('Hello, world!', 'Welcome to My Website!');
const CSS_BG = X.starter.css.replace('#f4f1ea', '#dce8f2');
const CSS_BOTH = CSS_BG.replace('#365b49', '#8a4f7d');
const JS_DONE = X.starter.js.replace('You made this webpage interactive!', 'I can build interactive websites!');

test('1. the starter files load and work together, with no AI provider', async ({ page }) => {
  const api: string[] = [];
  page.on('request', (r) => r.url().includes('/api/') && api.push(r.url()));
  await page.goto(URL);
  await expect(page.getByRole('heading', { level: 1, name: 'Build Your First Interactive Webpage' })).toBeVisible();
  await show(page, 'Preview');
  await expect(frame(page).getByRole('heading', { name: 'Hello, world!' })).toBeVisible();
  expect(await frame(page).locator('body').evaluate((b) => getComputedStyle(b).backgroundColor)).toBe('rgb(244, 241, 234)');
  await frame(page).getByRole('button', { name: 'Click me' }).click();
  await expect(frame(page).locator('#message')).toHaveText('You made this webpage interactive!');
  expect(api).toEqual([]);
});

test('2-5. each step: HTML, CSS and JavaScript edits change the preview, and checks catch failure and success', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto(URL);
  // Step 1: failure first, then success
  const fb = await checkWork(page);
  await expect(fb).toContainText('still says "Hello, world!"');
  await setFile(page, 'index.html', X.starter.html.replace('Hello, world!', 'Welcome to my website'));
  await expect(await checkWork(page)).toContainText('Close!');
  await setFile(page, 'index.html', HTML_DONE);
  await runCode(page);
  await show(page, 'Preview');
  await expect(frame(page).getByRole('heading', { name: 'Welcome to My Website!' })).toBeVisible();
  await expect(await checkWork(page)).toContainText('Correct! Your heading has changed');
  await page.getByRole('button', { name: 'Next step' }).click();

  // Step 2: the wrong rule is explained, then success
  await expect(page.getByRole('heading', { name: 'Change the appearance' })).toBeVisible();
  await setFile(page, 'style.css', X.starter.css.replace('#365b49', '#dce8f2'));
  await expect(await checkWork(page)).toContainText("You changed the button's color instead");
  await setFile(page, 'style.css', CSS_BG);
  await runCode(page);
  await show(page, 'Preview');
  await expect.poll(() => frame(page).locator('body').evaluate((b) => getComputedStyle(b).backgroundColor)).toBe('rgb(220, 232, 242)');
  await expect(await checkWork(page)).toContainText('Correct!');
  await page.getByRole('button', { name: 'Next step' }).click();

  // Step 3
  await expect(await checkWork(page)).toContainText('still has its original green');
  await setFile(page, 'style.css', CSS_BOTH);
  await expect(await checkWork(page)).toContainText('The button is purple');
  await page.getByRole('button', { name: 'Next step' }).click();

  // Step 4: clicking the button in the preview runs the JavaScript
  await setFile(page, 'script.js', JS_DONE);
  await runCode(page);
  await show(page, 'Preview');
  await frame(page).getByRole('button', { name: 'Click me' }).click();
  await expect(frame(page).locator('#message')).toHaveText('I can build interactive websites!');
  await expect(await checkWork(page)).toContainText('The message changes when you click');
  await page.getByRole('button', { name: 'Next step' }).click();

  // Step 5: the chosen change is checked
  await expect(await checkWork(page)).toContainText('First choose which change');
  await page.getByLabel(/Write a new message/).check();
  await expect(await checkWork(page)).toContainText('same message as before');
  await setFile(page, 'script.js', JS_DONE.replace('I can build interactive websites!', 'Hello from me!'));
  await expect(await checkWork(page)).toContainText('Your new message appears');
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: 'You built your first interactive webpage' })).toBeVisible();
  await expect(page.getByText('5 of 5 steps done')).toBeVisible();

  // Progress survives a reload
  await page.reload();
  await expect(page.getByText('5 of 5 steps done')).toBeVisible();
});

test('6. hints appear one at a time, retries keep work, and resets ask first', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto(URL);
  await show(page, 'Steps');
  await page.getByText('Need a hint?').click();
  await page.getByRole('button', { name: 'Show a small clue' }).click();
  await expect(page.locator('.xp-hints li')).toHaveCount(1);
  await page.getByRole('button', { name: 'Show a clearer hint' }).click();
  await expect(page.locator('.xp-hints li')).toHaveCount(2);
  await expect(page.locator('.xp-hints')).toContainText('Welcome to My Website!');

  // A failed check keeps the learner's edit
  await setFile(page, 'index.html', X.starter.html.replace('Hello, world!', 'Almost'));
  await checkWork(page);
  await show(page, 'Code');
  await expect(page.locator('.cm-content')).toContainText('Almost');

  // Reset step: cancel keeps the edit, confirm restores it
  await show(page, 'Steps');
  await page.getByRole('button', { name: 'Reset step' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
  await show(page, 'Code');
  await expect(page.locator('.cm-content')).toContainText('Almost');
  await show(page, 'Steps');
  await page.getByRole('button', { name: 'Reset step' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset step' }).click();
  await show(page, 'Code');
  await expect(page.locator('.cm-content')).toContainText('Hello, world!');

  // Pass step 1, change step 2, then reset the whole experiment
  await setFile(page, 'index.html', HTML_DONE);
  await checkWork(page);
  await page.getByRole('button', { name: 'Next step' }).click();
  await setFile(page, 'style.css', CSS_BG);
  await show(page, 'Steps');
  await page.getByRole('button', { name: 'Reset experiment' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset experiment' }).click();
  await expect(page.getByText('0 of 5 steps done')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Change the webpage content' })).toBeVisible();
  await show(page, 'Code');
  await page.getByRole('tab', { name: /^style\.css/ }).click();
  await expect(page.locator('.cm-content')).toContainText('#f4f1ea');
});

test('7. switching file tabs keeps edits, and the starter code can be viewed and restored', async ({ page }) => {
  await page.goto(URL);
  await setFile(page, 'index.html', X.starter.html.replace('Hello, world!', 'Kept while switching'));
  await page.getByRole('tab', { name: /^style\.css/ }).click();
  await page.getByRole('tab', { name: /^script\.js/ }).click();
  await page.getByRole('tab', { name: /^index\.html/ }).click();
  await expect(page.locator('.cm-content')).toContainText('Kept while switching');
  await expect(page.getByRole('tab', { name: /index\.html.*edit this file/i })).toBeVisible();

  await show(page, 'Steps');
  await page.getByRole('button', { name: 'View starter code' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Hello, world!');
  await dialog.getByRole('button', { name: 'Restore this file' }).click();
  await show(page, 'Code');
  await expect(page.locator('.cm-content')).toContainText('Hello, world!');
});

test('8. a code error is explained in plain language', async ({ page }) => {
  await page.goto(URL);
  await setFile(page, 'script.js', X.starter.js.replace('"You made this webpage interactive!"', '"You made this webpage interactive!'));
  await runCode(page);
  await show(page, 'Preview');
  const messages = page.getByLabel('Messages');
  await expect(messages.locator('.lab-log__error')).toBeVisible();
  await expect(messages).toContainText(/script\.js, line \d+/);
});

test('9. on phones the current step stays visible above the code and preview', async ({ page }) => {
  test.skip(!narrow(page), 'Phone and tablet layout only');
  await page.goto(URL);
  await show(page, 'Code');
  await expect(page.locator('.xp-strip').first()).toContainText('Step 1: Change the webpage content');
  await expect(page.locator('.xp-strip').first()).toContainText('index.html');
  await runCode(page);
  await expect(page.getByRole('region', { name: 'Live preview' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test('lessons and the Code Lab offer the experiment', async ({ page }) => {
  await page.goto('/#/learn/lesson/html-structure');
  await page.getByRole('link', { name: /Build Your First Interactive Webpage/ }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Build Your First Interactive Webpage' })).toBeVisible();
  await page.goto('/#/lab');
  await expect(page.getByRole('heading', { name: 'Guided experiments' })).toBeVisible();
});
