import { test, expect, Page } from '@playwright/test';

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

function clickScenario(page: Page, matchText: string) {
  return page.locator('button').filter({ hasText: matchText }).first().click();
}

// ─── SCENARIO 1: Happy Path ────────────────────────────────────

test('1. happy — balance visible, no scenario cards', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Everything Works');
  await expect(page.getByText('₹2,34,560')).toBeVisible();
  await expect(page.getByText('KYC Not Completed')).not.toBeVisible();
  await expect(page.getByText('PF Claim Rejected')).not.toBeVisible();
  await expect(page.getByText('Waiting for Employer')).not.toBeVisible();
  await expect(page.getByText('PF Advance Rejected')).not.toBeVisible();
  await expect(page.getByText('e-Nomination Not Filed')).not.toBeVisible();
  await expect(page.getByText('Pension Certificate Mismatch')).not.toBeVisible();
  await expect(page.getByText('Bank Account Not Verified')).not.toBeVisible();
  await expect(page.getByText('Aadhaar Linked to Wrong UAN')).not.toBeVisible();
  await expect(page.getByText('Multiple Accounts')).not.toBeVisible();
});

// ─── SCENARIO 2: no_kyc ───────────────────────────────────────

test('2. no_kyc — KYC card → Complete KYC → /documents', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Prerequisite Blocks Claim');
  await expect(page.getByRole('heading', { name: 'KYC Not Completed' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Complete KYC Now' }).click();
  await page.waitForURL('**/documents', { timeout: 5000 });
});

// ─── SCENARIO 3: kyc_wrong ────────────────────────────────────

test('3. kyc_wrong — navigates to /kyc-mismatch', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Name/DOB Differs');
  await page.waitForURL('**/kyc-mismatch', { timeout: 5000 });
});

// ─── SCENARIO 4: claim_denied ─────────────────────────────────

test('4. claim_denied — card → Appeal via Smart Flow (loading → /smart-flow)', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Need to Appeal');
  await expect(page.getByRole('heading', { name: 'PF Claim Rejected' })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Appeal via Smart Flow')).toBeVisible();
  await expect(page.getByRole('button', { name: 'File Grievance', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Appeal via Smart Flow' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=Generating step-by-step plan')).toBeVisible();
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

test('4b. claim_denied — card → File Grievance → /grievance', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Need to Appeal');
  await expect(page.getByRole('heading', { name: 'PF Claim Rejected' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'File Grievance', exact: true }).click();
  await page.waitForURL('**/grievance', { timeout: 5000 });
});

// ─── SCENARIO 5: employer_hold ─────────────────────────────────

test('5. employer_hold — SLA card → Escalate to EPFO', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'SLA Tracking');
  await expect(page.getByRole('heading', { name: 'Waiting for Employer Approval' })).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('3 / 5 days elapsed')).toBeVisible();
  await expect(page.getByText('TCS (Tata Consultancy Services)').first()).toBeVisible();

  await page.getByRole('button', { name: 'Escalate to EPFO' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

// ─── SCENARIO 6: no_exit ──────────────────────────────────────

test('6. no_exit — navigates to /mark-exit', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Transfer Blocked');
  await page.waitForURL('**/mark-exit', { timeout: 5000 });
});

// ─── SCENARIO 7: multi_uan ────────────────────────────────────

test('7. multi_uan — merge card → Merge with Smart Flow', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Merge Required');
  await expect(page.getByRole('heading', { name: 'Action Required: Multiple Accounts' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Merge with Smart Flow' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

// ─── SCENARIO 9: no_nominee ───────────────────────────────────

test('9a. no_nominee — card → File e-Nomination → loading → /smart-flow', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Claim Stuck');
  await expect(page.getByRole('heading', { name: 'e-Nomination Not Filed' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'File e-Nomination' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

test('9b. no_nominee — card → Why is this needed → loading → /smart-flow', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Claim Stuck');
  await expect(page.getByRole('heading', { name: 'e-Nomination Not Filed' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Why is this needed?' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

// ─── SCENARIO 10: pension_cert ─────────────────────────────────

test('10a. pension_cert — card → Resolve via Smart Flow', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Scheme Cert Fails');
  await expect(page.getByRole('heading', { name: 'Pension Certificate Mismatch' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Resolve via Smart Flow' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

// ─── SCENARIO 11: advance_rejected ─────────────────────────────

test('11a. advance_rejected — card → Check Eligibility', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Eligibility Mismatch');
  await expect(page.getByRole('heading', { name: 'PF Advance Rejected' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Check Eligibility' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

test('11b. advance_rejected — card → Learn Rules', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Eligibility Mismatch');
  await expect(page.getByRole('heading', { name: 'PF Advance Rejected' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Learn Rules' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

// ─── SCENARIO 12: bank_not_seeded ─────────────────────────────

test('12a. bank_not_seeded — card → Update Bank Details → /documents', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Disbursement Fails');
  await expect(page.getByRole('heading', { name: 'Bank Account Not Verified' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Update Bank Details' }).click();
  await page.waitForURL('**/documents', { timeout: 5000 });
});

test('12b. bank_not_seeded — card → Get Help → /smart-flow', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Disbursement Fails');
  await expect(page.getByRole('heading', { name: 'Bank Account Not Verified' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Get Help' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

// ─── SCENARIO 13: aadhaar_conflict ─────────────────────────────

test('13a. aadhaar_conflict — card → Fix via Smart Flow', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Wrong UAN Linkage');
  await expect(page.getByRole('heading', { name: 'Aadhaar Linked to Wrong UAN' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Fix via Smart Flow' }).click();
  await expect(page.locator('text=Analyzing request & rules')).toBeVisible({ timeout: 3000 });
  await page.waitForURL('**/smart-flow', { timeout: 8000 });
});

test('13b. aadhaar_conflict — card → File Grievance → /grievance', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Wrong UAN Linkage');
  await expect(page.getByRole('heading', { name: 'Aadhaar Linked to Wrong UAN' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'File Grievance', exact: true }).click();
  await page.waitForURL('**/grievance', { timeout: 5000 });
});

// ─── RESET ─────────────────────────────────────────────────────

test('Reset clears scenario state', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Need to Appeal');
  await expect(page.getByRole('heading', { name: 'PF Claim Rejected' })).toBeVisible({ timeout: 5000 });
  await page.locator('button').filter({ hasText: /^Reset$/ }).click();
  await expect(page.getByRole('heading', { name: 'PF Claim Rejected' })).not.toBeVisible({ timeout: 3000 });
});

// ─── DASHBOARD CARDS CLEAR AFTER RESOLUTION ────────────────────

test('bank_not_seeded — error clears after visiting /documents', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Disbursement Fails');
  await expect(page.getByRole('heading', { name: 'Bank Account Not Verified' })).toBeVisible({ timeout: 5000 });
  // Click the card's button → goes to /documents → clears scenario
  await page.getByRole('button', { name: 'Update Bank Details' }).click();
  await page.waitForURL('**/documents', { timeout: 5000 });
  await expect(page.locator('text=Document Vault').first()).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(300);
  // Go back to dashboard → error should be gone
  await page.goBack();
  await page.waitForURL('**/', { timeout: 5000 });
  await page.waitForTimeout(500);
  await expect(page.getByText('Bank Account Not Verified')).not.toBeVisible();
});

test('bank_not_seeded — re-selecting from left panel restores error card', async ({ page }) => {
  await onboard(page);
  await clickScenario(page, 'Disbursement Fails');
  await expect(page.getByRole('heading', { name: 'Bank Account Not Verified' })).toBeVisible({ timeout: 5000 });
  // Visit resolution page → clears scenario
  await page.getByRole('button', { name: 'Update Bank Details' }).click();
  await page.waitForURL('**/documents', { timeout: 5000 });
  await expect(page.locator('text=Document Vault').first()).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(300);
  await page.goBack();
  await page.waitForURL('**/', { timeout: 5000 });
  await page.waitForTimeout(500);
  await expect(page.getByText('Bank Account Not Verified')).not.toBeVisible();
  // Re-select from left panel → error should reappear
  await clickScenario(page, 'Disbursement Fails');
  await expect(page.getByRole('heading', { name: 'Bank Account Not Verified' })).toBeVisible({ timeout: 5000 });
});
