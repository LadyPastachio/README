import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

// Uses the system Chromium if one is pre-installed (cloud sandbox); otherwise
// Playwright's own browser. Run `npx playwright install chromium` once locally.
const SANDBOX_CHROMIUM = '/opt/pw-browsers/chromium';
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || (existsSync(SANDBOX_CHROMIUM) ? SANDBOX_CHROMIUM : undefined);

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: executablePath ? { executablePath } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1360, height: 860 } } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1100 }, hasTouch: true } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [
    {
      command: 'npm run build && npx vite preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // The local AI server with no key: tests check the real proxy and status path, and never spend money.
      command: 'node server/index.ts',
      url: 'http://127.0.0.1:8787/api/ai/status',
      env: { ANTHROPIC_API_KEY: '', PORT: '8787' },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
