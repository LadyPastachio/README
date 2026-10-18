import { test, expect, type Page, type Browser } from '@playwright/test';

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function signUp(page: Page, name: string, email: string) {
  await page.goto('/#/settings');
  const panel = page.locator('#account');
  await panel.getByRole('radio', { name: 'Create account' }).click();
  await panel.getByLabel('Display name').fill(name);
  await panel.getByLabel('Email').fill(email);
  await panel.getByLabel('Password', { exact: true }).fill('correct horse battery');
  await panel.getByRole('button', { name: 'Create account' }).click();
  await expect(panel.getByText(`Signed in as ${name}`)).toBeVisible();
}

async function newPage(browser: Browser, baseURL: string | undefined, viewport: { width: number; height: number } | null) {
  const ctx = await browser.newContext({ baseURL, viewport: viewport ?? undefined });
  return ctx.newPage();
}

test('two friends: create a circle, invite, share progress and comment', async ({ page, browser, baseURL, viewport }) => {
  const id = unique();
  await signUp(page, 'Olu', `olu-${id}@example.com`);
  await page.goto('/#/circles');
  await page.getByLabel('Circle name').fill('Saturday coders');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Saturday coders' })).toBeVisible();
  await page.getByRole('button', { name: 'Create invite code' }).click();
  const code = (await page.getByLabel('Invite code').textContent())!.trim();
  expect(code).toMatch(/^[A-Z2-9]{10}$/);

  const friend = await newPage(browser, baseURL, viewport);
  await signUp(friend, 'Mei', `mei-${id}@example.com`);
  await friend.goto('/#/circles');
  await friend.getByLabel('Invite code').fill(code);
  await friend.getByRole('button', { name: 'Join' }).click();
  await expect(friend.getByRole('heading', { level: 1, name: 'Saturday coders' })).toBeVisible();
  await friend.getByRole('button', { name: 'Share something' }).click();
  await expect(friend.getByText('Members will see')).toBeVisible();
  await friend.getByRole('button', { name: 'Share', exact: true }).click();
  await expect(friend.getByRole('heading', { name: 'My progress' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'My progress' })).toBeVisible();
  await expect(page.getByText(/Mei ·/)).toBeVisible();
  const body = await page.locator('main').innerText();
  expect(body).not.toContain(`mei-${id}@example.com`);
  await page.getByLabel('Comment on My progress').fill('Great start!');
  await page.getByRole('button', { name: 'Comment' }).click();
  await expect(page.getByText('Great start!')).toBeVisible();

  await friend.reload();
  await expect(friend.getByText('Great start!')).toBeVisible();
  await friend.context().close();
});

test('an outsider cannot open a circle by its address', async ({ page, browser, baseURL, viewport }) => {
  const id = unique();
  await signUp(page, 'Ana', `ana-${id}@example.com`);
  await page.goto('/#/circles');
  await page.getByLabel('Circle name').fill('Private');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Private' })).toBeVisible();
  const url = page.url();

  const outsider = await newPage(browser, baseURL, viewport);
  await signUp(outsider, 'Oz', `oz-${id}@example.com`);
  await outsider.goto(url);
  await expect(outsider.getByRole('heading', { level: 1, name: /not found|can't find|doesn't exist/i })).toBeVisible();
  await outsider.context().close();
});

test('progress saved to an account can be restored on another device, after confirming', async ({ page, browser, baseURL, viewport }) => {
  const id = unique();
  const email = `sync-${id}@example.com`;
  await signUp(page, 'Sam', email);
  await page.locator('#appearance').getByRole('radio', { name: 'Dark' }).click();
  const panel = page.locator('#account');
  await panel.getByRole('button', { name: "Save this device's progress" }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();
  await expect(panel.getByText(/Last saved/)).toBeVisible();

  const other = await newPage(browser, baseURL, viewport);
  await other.goto('/#/settings');
  const p2 = other.locator('#account');
  await p2.getByLabel('Email').fill(email);
  await p2.getByLabel('Password', { exact: true }).fill('correct horse battery');
  await p2.getByRole('button', { name: 'Sign in' }).click();
  await expect(p2.getByText('Signed in as Sam')).toBeVisible();
  expect(await other.evaluate(() => document.documentElement.dataset.theme)).not.toBe('dark');
  await p2.getByRole('button', { name: 'Restore to this device' }).click();
  const dialog = other.getByRole('dialog');
  await expect(dialog.getByText('Settings and learning profile')).toBeVisible();
  await dialog.getByRole('button', { name: 'Restore' }).click();
  await expect.poll(() => other.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  await other.context().close();
});

test('signing out and deleting an account', async ({ page }) => {
  const id = unique();
  await signUp(page, 'Del', `del-${id}@example.com`);
  const panel = page.locator('#account');
  await panel.getByRole('button', { name: 'Delete account' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Your password').fill('wrong password here');
  await dialog.getByRole('button', { name: 'Delete account' }).click();
  await expect(dialog.getByRole('alert')).toContainText('incorrect');
  await dialog.getByLabel('Your password').fill('correct horse battery');
  await dialog.getByRole('button', { name: 'Delete account' }).click();
  await expect(panel.getByRole('radio', { name: 'Sign in' })).toBeVisible();
  await panel.getByLabel('Email').fill(`del-${id}@example.com`);
  await panel.getByLabel('Password', { exact: true }).fill('correct horse battery');
  await panel.getByRole('button', { name: 'Sign in' }).click();
  await expect(panel.getByRole('alert')).toContainText('incorrect');
});
