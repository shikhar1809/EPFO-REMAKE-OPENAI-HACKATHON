import { test, expect, Page } from '@playwright/test';

test.setTimeout(120000);

const BASE = 'http://localhost:5173';

async function onboard(page: Page) {
  await page.goto(BASE);
  await page.getByText('English', { exact: true }).first().click();
  await page.getByText('I understand, continue').click();
  await page.getByText('I am a returning user').click();
  await page.getByRole('button', { name: /Get OTP/i }).click();
  await page.getByRole('button', { name: /Verify OTP/i }).click();
  await page.waitForURL('**/');
  await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });
}

test('AI Agent - End to end Withdraw PF flow with 5 star feedback', async ({ page }) => {
  await onboard(page);
  
  await page.locator('button').filter({ hasText: 'Smart Flow' }).first().click();
  await expect(page.locator('textarea')).toBeVisible({ timeout: 5000 });
  
  const textarea = page.locator('textarea');
  await textarea.fill('I want to withdraw my PF due to a medical emergency');
  await textarea.press('Enter');
  
  await page.waitForURL('**/smart-flow', { timeout: 15000 });
  await expect(page.getByText('Plan Ready')).toBeVisible({ timeout: 15000 });
  
  // 1. Start execution
  await page.getByRole('button', { name: 'Start Workflow' }).click();
  
  // Step 1: Check Bank & Eligibility (needs_user)
  await expect(page.getByText('To determine eligibility, verify the last 4 digits')).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Verify & Continue' }).click();
  
  // Step 2: Gather docs (planned)
  await expect(page.getByRole('button', { name: 'Execute Next Step' })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Execute Next Step' }).click();
  await expect(page.getByText('Gather Documents from Vault')).toBeVisible({ timeout: 10000 });
  
  // Step 3: Review claim (needs_user)
  await expect(page.getByText('We found your verified Cheque/Passbook in the Vault.')).toBeVisible({ timeout: 15000 });
  await page.locator('select').last().selectOption('illness');
  await page.getByRole('button', { name: 'Prepare Claim' }).click();
  
  // Step 4: Submit claim with Aadhaar OTP (sensitive_action)
  await expect(page.getByText('Authentication Required')).toBeVisible({ timeout: 10000 });
  await page.getByPlaceholder('Enter Aadhaar OTP').fill('1234');
  await page.getByRole('button', { name: 'Sign & Submit Claim' }).click();
  
  // 5. Completion and Feedback
  await expect(page.getByText('All Steps Completed')).toBeVisible({ timeout: 15000 });
  
  // Give 5 stars
  const stars = page.locator('button').filter({ has: page.locator('.lucide-star') });
  await stars.nth(4).click();
  
  await page.locator('textarea').fill('Great AI agent, very helpful and fast!');
  await page.getByRole('button', { name: 'Submit Feedback' }).click();
  
  await expect(page.getByText('Your feedback has been recorded.')).toBeVisible({ timeout: 5000 });
  
  await page.getByRole('button', { name: 'Back to Dashboard' }).last().click();
  await page.waitForURL('**/', { timeout: 5000 });
});

test('AI Agent - End to end KYC Mismatch flow with 5 star feedback', async ({ page }) => {
  await onboard(page);
  
  await page.locator('button').filter({ hasText: 'Smart Flow' }).first().click();
  await expect(page.locator('textarea')).toBeVisible({ timeout: 5000 });
  
  const textarea = page.locator('textarea');
  await textarea.fill('My name and DOB is wrong in EPFO');
  await textarea.press('Enter');
  
  await page.waitForURL('**/smart-flow', { timeout: 15000 });
  await expect(page.getByText('Plan Ready')).toBeVisible({ timeout: 15000 });
  
  await page.getByRole('button', { name: 'Start Workflow' }).click();
  
  // Step 1: Verify Identity (not in NEEDS_USER_STEPS, auto-skips after 1.5s)
  await expect(page.getByText('Verify Identity & UAN')).toBeVisible({ timeout: 10000 });
  
  // Step 2: Detect mismatch (needs_user)
  await expect(page.getByText('Analyze KYC Mismatch')).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Review & Proceed' }).click();
  
  // Step 3: Draft declaration (needs_user)
  await expect(page.getByText('Draft Joint Declaration')).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Confirm & Proceed to Sign' }).click();
  
  // Step 4: Submit with Aadhaar OTP (sensitive_action)
  await expect(page.getByText('Authentication Required')).toBeVisible({ timeout: 10000 });
  await page.getByPlaceholder('Enter Aadhaar OTP').fill('1234');
  await page.getByRole('button', { name: 'Sign & Submit Declaration' }).click();
  
  // Completion and Feedback
  await expect(page.getByText('Pending Employer Approval')).toBeVisible({ timeout: 15000 });
  
  await page.getByRole('button', { name: 'Back to Dashboard' }).last().click();
  await page.waitForURL('**/', { timeout: 5000 });
});

test('AI Agent - Refine intent into multi-phase flow', async ({ page }) => {
  await onboard(page);
  
  await page.locator('button').filter({ hasText: 'Smart Flow' }).first().click();
  
  const textarea = page.locator('textarea');
  await textarea.fill('I want to mark my exit');
  await textarea.press('Enter');
  
  await page.waitForURL('**/smart-flow', { timeout: 15000 });
  await expect(page.getByText('Plan Ready')).toBeVisible({ timeout: 15000 });
  
  // Refine intent
  const refineInput = page.getByPlaceholder('Tell the agent what to change...');
  await refineInput.fill('Mark my exit and then withdraw my PF');
  await refineInput.press('Enter');
  
  await expect(page.getByText('Phase 1: Mark Exit Date')).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('Phase 2: Withdraw PF')).toBeVisible({ timeout: 15000 });
});
