import { test, expect, Page } from '@playwright/test';

const BASE = 'https://epfo-remake-openai.vercel.app';

async function stubConnection(page: Page, effectiveType: string, saveData: boolean) {
  await page.addInitScript(
    ({ effectiveType, saveData }) => {
      const changeListeners = new Set<() => void>();
      const conn = {
        effectiveType,
        saveData,
        addEventListener(type: string, listener: () => void) {
          if (type === 'change') changeListeners.add(listener);
        },
        removeEventListener(type: string, listener: () => void) {
          if (type === 'change') changeListeners.delete(listener);
        },
        _setTo(type: string, save: boolean) {
          conn.effectiveType = type;
          conn.saveData = save;
          changeListeners.forEach((listener) => listener());
        },
      };
      Object.defineProperty(window, '__epfoTestConnection', { configurable: true, get: () => conn });
      Object.defineProperty(navigator, 'connection', { configurable: true, get: () => conn });
    },
    { effectiveType, saveData }
  );
}

test('low internet — auto-enables and toasts when connection is slow at boot', async ({ page }) => {
  await stubConnection(page, '2g', true);
  await page.goto(BASE);
  await expect(page.getByText('LOW INTERNET MODE ENABLED').first()).toBeVisible({ timeout: 15000 });
});

test('low internet — global monitor toasts on a live connection dip', async ({ page }) => {
  await stubConnection(page, '4g', false);
  await page.goto(BASE);
  await page.evaluate(() => (window as unknown as { __epfoTestConnection: { _setTo(type: string, save: boolean): void } }).__epfoTestConnection._setTo('2g', true));
  await expect(page.getByText('LOW INTERNET MODE ENABLED').first()).toBeVisible({ timeout: 15000 });
});