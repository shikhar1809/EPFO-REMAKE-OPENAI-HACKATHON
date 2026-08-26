import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  use: {
    baseURL: 'https://epfo-remake-openai.vercel.app',
    headless: true,
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
  },
});
