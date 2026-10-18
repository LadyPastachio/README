import { test, expect, type Page } from '@playwright/test';

async function seedQuery(page: Page, id: string, query: string) {
  await page.addInitScript(([id, query]) => {
    const store = JSON.parse(localStorage.getItem('academy:lab') || '{"version":1,"workspaces":{}}');
    store.workspaces[id as string] = { files: { html: '', css: '', js: query }, updatedAt: new Date().toISOString() };
    localStorage.setItem('academy:lab', JSON.stringify(store));
  }, [id, query] as const);
}

async function openPanel(page: Page, name: 'Task' | 'Query' | 'Results') {
  if ((page.viewportSize()?.width ?? 1000) < 900) await page.getByRole('radio', { name }).click();
}

test.describe('SQL workspace', () => {
  test('runs a query and shows the result as a table', async ({ page }) => {
    await seedQuery(page, 'sql-new-leads', "SELECT name, status FROM leads WHERE status = 'new' ORDER BY id;");
    await page.goto('/#/lab/sql-new-leads');
    await openPanel(page, 'Query');
    await page.getByRole('button', { name: 'Run' }).click();
    await openPanel(page, 'Results');
    const table = page.getByRole('region', { name: 'Results' }).getByRole('table');
    await expect(table).toBeVisible();
    await expect(table.getByRole('columnheader')).toHaveText(['name', 'status']);
    await expect(table.getByRole('row')).toHaveCount(5);
    await expect(page.getByText('4 rows')).toBeVisible();
  });

  test('explains errors, such as an unknown table', async ({ page }) => {
    await seedQuery(page, 'sql-new-leads', 'SELECT * FROM customers;');
    await page.goto('/#/lab/sql-new-leads');
    await openPanel(page, 'Query');
    await page.getByRole('button', { name: 'Run' }).click();
    await openPanel(page, 'Results');
    await expect(page.getByText("The query didn't run")).toBeVisible();
    await expect(page.getByText(/no such table: customers/)).toBeVisible();
  });

  test('stops a query that never ends, and keeps working afterwards', async ({ page }) => {
    await seedQuery(page, 'sql-new-leads', 'WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n) SELECT count(*) FROM n;');
    await page.goto('/#/lab/sql-new-leads');
    await openPanel(page, 'Query');
    await page.getByRole('button', { name: 'Run' }).click();
    await openPanel(page, 'Results');
    await expect(page.getByText(/ran for more than 2 seconds/)).toBeVisible({ timeout: 6000 });
    await openPanel(page, 'Task');
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.locator('.lab-criteria li[data-state="running"]')).toHaveCount(0, { timeout: 8000 });
    await expect(page.locator('.lab-criteria li[data-state="fail"]').first()).toBeVisible();
  });

  test('practice data is fresh on every run, so changes do not persist', async ({ page }) => {
    await seedQuery(page, 'sql-new-leads', "DELETE FROM leads; SELECT count(*) AS n FROM leads;");
    await page.goto('/#/lab/sql-new-leads');
    await openPanel(page, 'Query');
    await page.getByRole('button', { name: 'Run' }).click();
    await openPanel(page, 'Results');
    await expect(page.getByRole('cell', { name: '0' })).toBeVisible();
    // Same page, same engine: replace the query and run again.
    const editor = page.getByRole('region', { name: 'Code editor' }).locator('.cm-content');
    await openPanel(page, 'Query');
    await editor.click();
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.insertText('SELECT count(*) AS n FROM leads;');
    await expect(editor).toHaveText('SELECT count(*) AS n FROM leads;');
    await page.getByRole('button', { name: 'Run' }).click();
    await openPanel(page, 'Results');
    await expect(page.getByRole('cell', { name: '7' })).toBeVisible({ timeout: 10000 });
  });
});
