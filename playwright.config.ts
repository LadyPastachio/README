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
  // Production setup: the academy server serves the built app with its security headers (CSP and others)
  // plus the API, exactly as in deployment. No AI key and a throwaway database, so tests never spend money or keep data.
  webServer: {
    command: 'npm run build && node server/index.ts',
    url: 'http://localhost:4173',
    env: { ANTHROPIC_API_KEY: '', PORT: '4173', STATIC_DIR: 'dist', DATABASE_PATH: ':memory:', SIGNUPS_PER_HOUR: '1000' },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
