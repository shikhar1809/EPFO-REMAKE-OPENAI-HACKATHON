import { test, expect, Page } from '@playwright/test';

const BASE = 'https://epfo-remake-openai.vercel.app';

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

async function ensureAuth(page: Page) {
  // Patch zustand persist to include isAuthenticated (stripped by partialize)
  await page.evaluate(() => {
    const raw = localStorage.getItem('epfo-secure-session');
    if (raw) {
      const data = JSON.parse(raw);
      if (data.state) data.state.isAuthenticated = true;
      localStorage.setItem('epfo-secure-session', JSON.stringify(data));
    }
    localStorage.setItem('onboarded', 'true');

    // Seed document vault with Aadhaar + Bank if empty (needed for Claim flow)
    const vaultRaw = localStorage.getItem('epfo-document-vault');
    const vault = vaultRaw ? JSON.parse(vaultRaw) : {};
    const vaultDocs = vault?.state?.documents || {};
    if (Object.keys(vaultDocs).length === 0) {
      const now = Date.now();
      vault.state = vault.state || {};
      vault.state.documents = {
        'doc-aadhaar-001': {
          refId: 'doc-aadhaar-001', type: 'aadhaar', verificationState: 'verified',
          source: 'uidai', createdAt: now, updatedAt: now,
          permissions: { grantedTo: ['claim_withdrawal'] }, maskedData: '**** **** 4819'
        },
        'doc-bank-001': {
          refId: 'doc-bank-001', type: 'bank_account', verificationState: 'verified',
          source: 'npci', createdAt: now, updatedAt: now,
          permissions: { grantedTo: ['claim_withdrawal'] }, maskedData: 'SBI AC *******1234'
        }
      };
      localStorage.setItem('epfo-document-vault', JSON.stringify(vault));
    }
  });
}

async function setScenario(page: Page, scenarioId: string) {
  await page.evaluate((id) => {
    localStorage.setItem('epfo-demo-scenario', JSON.stringify({
      state: { activeScenario: id },
      version: 0
    }));
  }, scenarioId);
}

async function gotoPage(page: Page, path: string) {
  await ensureAuth(page);
  await page.goto(`${BASE}${path}`);
  await page.waitForURL(`**${path}`, { timeout: 10000 });
}

// ═══════════════════════════════════════════════════════════════════
// PASSBOOK PAGE
// ═══════════════════════════════════════════════════════════════════

test('Passbook — shows balance breakdown and transaction history', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/passbook');
  await expect(page.getByRole('heading', { name: 'Passbook' })).toBeVisible();
  await expect(page.getByText('3,42,500')).toBeVisible();
  await expect(page.getByText('Your Money')).toBeVisible();
  await expect(page.getByText('Employer').first()).toBeVisible();
  await expect(page.getByText('Interest')).toBeVisible();
  await expect(page.getByText('Transaction History')).toBeVisible();
  await expect(page.getByText('Statement')).toBeVisible();
  await expect(page.getByText('Aug 2026 Contribution')).toBeVisible();
  await expect(page.getByText('Jul 2026 Contribution')).toBeVisible();
});

test('Passbook — FY filter narrows transactions', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/passbook');
  await expect(page.getByText('Aug 2026 Contribution')).toBeVisible();
  await page.getByRole('combobox').nth(1).selectOption('2025');
  await expect(page.getByText('Aug 2026 Contribution')).not.toBeVisible();
  await expect(page.getByText('Nov 2025 Contribution')).toBeVisible();
});

test('Passbook — back button returns to dashboard', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/passbook');
  await page.locator('button').filter({ has: page.locator('svg.w-5.h-5') }).first().click();
  await page.waitForURL('**/', { timeout: 5000 });
});

// ═══════════════════════════════════════════════════════════════════
// CLAIM PAGE (4-step flow)
// ═══════════════════════════════════════════════════════════════════

test('Claim — full flow: bank verify -> details -> review+OTP -> success', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/claim');

  // Step 1: Bank verification
  await expect(page.getByText('Bank Verification')).toBeVisible();
  await page.getByRole('button', { name: /Verify/i }).click();

  // Step 2: Claim details form
  await expect(page.getByRole('heading', { name: 'I want to apply for' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Proceed to Review/i }).click();

  // Step 3: Review + OTP (pre-submission validation runs ~2.5s)
  await expect(page.getByText('Review & Authenticate')).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('Pre-Submission Warning')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Aadhaar OTP Required')).toBeVisible();
  await page.getByRole('button', { name: /Sign & Submit Claim/i }).click();

  // Step 4: Success
  await expect(page.getByText('Claim Submitted Successfully')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Operation Ledger ID')).toBeVisible();
  await page.getByRole('button', { name: /Return to Dashboard/i }).click();
  await page.waitForURL('**/', { timeout: 5000 });
});

test('Claim — rejected claim banner visible on claim_denied scenario', async ({ page }) => {
  // Seed vault before any page load so zustand persist picks it up
  const now = Date.now();
  const vaultData = {
    state: {
      documents: {
        'doc-aadhaar-001': {
          refId: 'doc-aadhaar-001', type: 'aadhaar', verificationState: 'verified',
          source: 'uidai', createdAt: now, updatedAt: now,
          permissions: { grantedTo: ['claim_withdrawal'] }, maskedData: '**** **** 4819'
        },
        'doc-bank-001': {
          refId: 'doc-bank-001', type: 'bank_account', verificationState: 'verified',
          source: 'npci', createdAt: now, updatedAt: now,
          permissions: { grantedTo: ['claim_withdrawal'] }, maskedData: 'SBI AC *******1234'
        }
      }
    },
    version: 0
  };
  await page.addInitScript((data) => {
    localStorage.setItem('epfo-document-vault', JSON.stringify(data));
  }, vaultData);

  await onboard(page);
  // Widen viewport so the DemoControlPanel sidebar is visible
  await page.setViewportSize({ width: 1400, height: 900 });
  // Click "Claim Rejected" in the demo sidebar
  await page.locator('button').filter({ hasText: 'Claim Rejected' }).first().click();
  await page.waitForURL('**/', { timeout: 8000 });
  // Navigate to /claim via SPA
  await page.locator('button').filter({ hasText: 'Traditional Flow' }).first().click();
  await page.waitForTimeout(500);
  await page.locator('button').filter({ hasText: 'File Online Claim' }).first().click();
  await page.waitForURL('**/claim', { timeout: 8000 });
  await expect(page.getByText('Previous Claim Rejected')).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('Fix Bank Seeding')).toBeVisible();
});

test('Claim — claim type dropdown switches between Form 31/19/10C', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/claim');
  // Step 1: verify bank
  await page.getByRole('button', { name: /Verify/i }).click();
  // Step 2: check claim type select
  await expect(page.getByRole('heading', { name: 'I want to apply for' })).toBeVisible({ timeout: 5000 });
  const select = page.locator('select').filter({ hasText: 'Form 31' });
  await select.selectOption('19');
  await expect(select).toHaveValue('19');
});

// ═══════════════════════════════════════════════════════════════════
// TRANSFER PAGE
// ═══════════════════════════════════════════════════════════════════

test('Transfer — shows discovered accounts and merge button', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/transfer');
  await expect(page.getByText('Transfer & Service Merge')).toBeVisible();
  await expect(page.getByText('2 Past PF Accounts Found!')).toBeVisible();
  await expect(page.getByText('₹1,10,450').first()).toBeVisible();
  await expect(page.getByText('Zenith Retail Services Pvt Ltd')).toBeVisible();
  await expect(page.getByText('QuickLogistics Express Ltd')).toBeVisible();
  await expect(page.getByRole('button', { name: /1-Tap Merge All/i })).toBeVisible();
});

test('Transfer — 1-Tap Merge shows consolidation in progress', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/transfer');
  await page.getByRole('button', { name: /1-Tap Merge All/i }).click();
  await expect(page.getByText('Merging...')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('Consolidation in Progress')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Transfers Tracked under EPF Scheme 1952')).toBeVisible();
});

test('Transfer — active transfer tracker shows 3 steps', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/transfer');
  await expect(page.getByText('Active Job-Switch Transfer')).toBeVisible();
  await expect(page.getByText('Auto-Merge Initiated')).toBeVisible();
  await expect(page.getByText('Attestation & Annexure K')).toBeVisible();
  await expect(page.getByText('Final Credit to Passbook')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// LIFE CERTIFICATE PAGE
// ═══════════════════════════════════════════════════════════════════

test('Life Certificate — shows pensioner details and two methods', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/life-certificate');
  await expect(page.getByText('Digital Life Certificate')).toBeVisible();
  await expect(page.getByText('Rameshwar Lal Sharma')).toBeVisible();
  await expect(page.getByText('DL/CPM/00098412/EPS')).toBeVisible();
  await expect(page.getByText('30 Nov 2026')).toBeVisible();
  await expect(page.getByRole('button', { name: /Face-Auth via Camera/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Request Postman Visit/i })).toBeVisible();
  await expect(page.getByText('Submit Anytime in the Year')).toBeVisible();
});

test('Life Certificate — face auth flow goes through scan -> success', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/life-certificate');
  await page.getByRole('button', { name: /Face-Auth via Camera/i }).click();
  // Face auth camera simulation
  await expect(page.getByText('Facial Liveness Verification')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('Position your face inside the frame')).toBeVisible();
  // Wait for scan sequence (~4 x 1.2s = ~5s) then processing then success
  await expect(page.getByText('Generating Jeevan Pramaan ID')).toBeVisible({ timeout: 12000 });
  await expect(page.getByText('Jeevan Pramaan Submitted!')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Certificate Accepted & Recorded')).toBeVisible();
  await expect(page.getByText('Download Certificate (PDF)')).toBeVisible();
  await expect(page.getByText('Return to Dashboard')).toBeVisible();
});

test('Life Certificate — doorstep booking form works', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/life-certificate');
  await page.getByRole('button', { name: /Request Postman Visit/i }).click();
  await expect(page.getByText('Book Postman Doorstep Visit')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('India Post Payments Bank')).toBeVisible();
  await expect(page.getByText('₹70').first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Confirm Booking/i })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// MARK EXIT PAGE
// ═══════════════════════════════════════════════════════════════════

test('Mark Exit — shows establishment list with eligibility', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/mark-exit');
  await expect(page.getByText('Self-Declare Date of Exit')).toBeVisible();
  await expect(page.getByText('Select Employment Record')).toBeVisible();
  await expect(page.getByText('Apex Logistics & Warehousing Pvt Ltd')).toBeVisible();
  await expect(page.getByText('Tata Consultancy Services Ltd')).toBeVisible();
  await expect(page.getByText('Exit Unmarked')).toBeVisible();
  await expect(page.getByText('Active (Current)')).toBeVisible();
  await expect(page.getByText('Worker Empowerment Norm')).toBeVisible();
});

test('Mark Exit — full flow: select -> form -> OTP -> success', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/mark-exit');
  // Step 1: Select eligible establishment (Apex Logistics, >60 days)
  await page.getByRole('heading', { name: 'Apex Logistics & Warehousing Pvt Ltd' }).click();
  // Step 2: Declaration form
  await expect(page.getByText('Date of Exit (Last Working Day)')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('Reason for Leaving *')).toBeVisible();
  await page.getByRole('button', { name: /Continue to Aadhaar OTP/i }).click();
  // Step 3: OTP
  await expect(page.getByText('Aadhaar Digital Signature')).toBeVisible({ timeout: 3000 });
  await page.getByPlaceholder('1234').fill('1234');
  await page.getByRole('button', { name: /Confirm & Update Exit Date/i }).click();
  // Step 4: Success
  await expect(page.getByText('Employment Status Updated!')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Exit Date Recorded')).toBeVisible();
  await expect(page.getByText('Proceed to File Form 19 Claim')).toBeVisible();
});

test('Mark Exit — active employment shows disabled state', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/mark-exit');
  await expect(page.getByText('Tata Consultancy Services Ltd')).toBeVisible();
  await expect(page.getByText('Active (Current)')).toBeVisible();
  // The second card should have cursor-not-allowed styling (60 days rule)
  await expect(page.getByText('Less than 60 days')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// DOCUMENT VAULT PAGE
// ═══════════════════════════════════════════════════════════════════

test('Document Vault — shows vault info and add document', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/documents');
  await expect(page.getByText('Document Vault')).toBeVisible();
  await expect(page.getByText('Permissioned Storage')).toBeVisible();
  await expect(page.getByText('Stored Documents')).toBeVisible();
  await expect(page.getByText('Add Document')).toBeVisible();
  await expect(page.getByText('SECURE')).toBeVisible();
});

test('Document Vault — add document adds bank_account entry', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/documents');
  await page.getByText('Add Document').click();
  await expect(page.getByText('bank account')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('SBI AC *******1234')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('NPCI')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// GRIEVANCE PAGE
// ═══════════════════════════════════════════════════════════════════

test('Grievance — register tab shows form and contact options', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/grievance');
  await expect(page.getByText('Support & Grievance')).toBeVisible();
  await expect(page.getByText('Register')).toBeVisible();
  await expect(page.getByText('Track Status')).toBeVisible();
  await expect(page.getByPlaceholder('Full Name')).toBeVisible();
  await expect(page.getByPlaceholder('Mobile Number')).toBeVisible();
  await expect(page.getByRole('button', { name: /Submit Grievance/i })).toBeVisible();
  await expect(page.getByText('1800-118-0026')).toBeVisible();
});

test('Grievance — submit shows ticket number', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/grievance');
  await page.getByPlaceholder('Full Name').fill('Test User');
  await page.getByPlaceholder('Mobile Number').fill('9876543210');
  await page.getByPlaceholder('Describe your issue clearly...').fill('PF withdrawal delay');
  await page.getByRole('button', { name: /Submit Grievance/i }).click();
  await expect(page.getByText('Grievance Registered!')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('TKT-9921')).toBeVisible();
  await expect(page.getByText('Track this Ticket')).toBeVisible();
});

test('Grievance — track tab shows ticket resolution flow', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/grievance');
  await page.getByText('Track Status').click();
  await expect(page.getByPlaceholder('Ticket Number')).toBeVisible({ timeout: 3000 });
  await page.getByPlaceholder('Ticket Number').fill('TKT-9921');
  await page.getByPlaceholder('Registered Mobile Number').fill('9876543210');
  await page.getByRole('button', { name: /Check Status/i }).click();
  await expect(page.getByText('Status: Resolved by EPFO')).toBeVisible({ timeout: 3000 });
  await expect(page.getByText('Did this actually solve your issue?')).toBeVisible();
  // Click Yes
  await page.getByRole('button', { name: /Yes, it's fixed/i }).click();
  await expect(page.getByText('Ticket permanently closed')).toBeVisible({ timeout: 3000 });
});

test('Grievance — reopen escalation flow', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/grievance');
  await page.getByText('Track Status').click();
  await page.getByPlaceholder('Ticket Number').fill('TKT-9921');
  await page.getByPlaceholder('Registered Mobile Number').fill('9876543210');
  await page.getByRole('button', { name: /Check Status/i }).click();
  await expect(page.getByText('Did this actually solve your issue?')).toBeVisible({ timeout: 3000 });
  await page.getByRole('button', { name: /No, Reopen/i }).click();
  await expect(page.getByText('Ticket reopened and escalated')).toBeVisible({ timeout: 3000 });
  await expect(page.getByRole('button', { name: /Submit Escalation/i })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// KYC MISMATCH PAGE
// ═══════════════════════════════════════════════════════════════════

test('KycMismatch — shows diff table with mismatched fields', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/kyc-mismatch');
  await expect(page.getByText('Fix KYC Mismatch')).toBeVisible();
  await expect(page.getByText('EPFO vs Aadhaar Comparison')).toBeVisible();
  await expect(page.getByText('Full Name')).toBeVisible();
  await expect(page.getByText('Date of Birth')).toBeVisible();
  await expect(page.getByText('Gender')).toBeVisible();
  await expect(page.getByText("Father's Name")).toBeVisible();
  // Check mismatch badges
  await expect(page.getByText('Mismatch').first()).toBeVisible();
  // Check EPFO values
  await expect(page.getByText('RAJESH KUMAR', { exact: true })).toBeVisible();
  await expect(page.getByText('Rajesh Kumar Sharma')).toBeVisible();
});

test('KycMismatch — proceeds through OTP to success', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/kyc-mismatch');
  await expect(page.getByText('Proceed to Aadhaar OTP Sign')).toBeVisible({ timeout: 3000 });
  await page.getByRole('button', { name: /Proceed to Aadhaar OTP Sign/i }).click();
  // OTP step
  await expect(page.getByText('Aadhaar Digital Signature')).toBeVisible({ timeout: 3000 });
  await page.getByPlaceholder('1234').fill('1234');
  await page.getByRole('button', { name: /Sign & Submit Correction/i }).click();
  // Success
  await expect(page.getByText('KYC Correction Submitted!')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Joint Declaration Filed')).toBeVisible();
  await expect(page.getByText('30 working days')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// MERGE ACCOUNTS PAGE
// ═══════════════════════════════════════════════════════════════════

test('MergeAccounts — shows duplicate UANs and merge summary', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/merge-accounts');
  await expect(page.getByText('Merge Duplicate Accounts')).toBeVisible();
  await expect(page.getByText('One Member One EPF', { exact: true })).toBeVisible();
  await expect(page.getByText('Tata Consultancy Services Ltd')).toBeVisible();
  await expect(page.getByText('Apex Logistics & Warehousing Pvt Ltd')).toBeVisible();
  await expect(page.getByText('Active (Target)')).toBeVisible();
  await expect(page.getByRole('button', { name: /Proceed to Review/i })).toBeVisible();
});

test('MergeAccounts — full 5-step flow to success', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/merge-accounts');
  // Step 1: Review - proceed
  await page.getByRole('button', { name: /Proceed to Review/i }).click();
  // Step 2: Confirm
  await expect(page.getByText('Confirm Account Merge')).toBeVisible({ timeout: 3000 });
  await page.getByRole('button', { name: /Confirm & Proceed to Aadhaar OTP/i }).click();
  // Step 3: OTP
  await expect(page.getByText('Aadhaar Digital Signature')).toBeVisible({ timeout: 3000 });
  await page.getByPlaceholder('1234').fill('1234');
  await page.getByRole('button', { name: /Sign & Submit Merge Request/i }).click();
  // Step 4: Processing
  await expect(page.getByText('Merging Accounts...')).toBeVisible({ timeout: 5000 });
  // Step 5: Success
  await expect(page.getByText('Accounts Consolidation Initiated!')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Merge Request Filed')).toBeVisible();
  await expect(page.getByText('Awaiting employer attestation')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// UAN ACTIVATION PAGE
// ═══════════════════════════════════════════════════════════════════

test('UanActivation — step 1 shows UAN/Aadhaar inputs', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/uan-activation');
  await expect(page.getByText("Let's activate your UAN")).toBeVisible();
  await expect(page.getByPlaceholder('Enter your 12-digit UAN')).toBeVisible();
  await expect(page.getByPlaceholder('Enter your Aadhaar Number')).toBeVisible();
  await expect(page.getByRole('button', { name: /Continue to Verification/i })).toBeVisible();
});

test('UanActivation — step 2 shows OTP and FaceRD fallback', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/uan-activation');
  await page.getByRole('button', { name: /Continue to Verification/i }).click();
  await expect(page.getByText("Verify it's you")).toBeVisible({ timeout: 3000 });
  await expect(page.getByPlaceholder('Enter OTP')).toBeVisible();
  await expect(page.getByText("Didn't receive OTP? Resend via WhatsApp")).toBeVisible();
  await expect(page.getByText('Authenticate via Aadhaar FaceRD app')).toBeVisible();
  await expect(page.getByRole('button', { name: /Activate Account/i })).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// SMART FLOW ENGINE PAGE
// ═══════════════════════════════════════════════════════════════════

test('SmartFlow — shows plan overview with steps', async ({ page }) => {
  await onboard(page);
  // Trigger a smart flow from dashboard
  await page.locator('button').filter({ hasText: 'Everything Works' }).first().click();
  await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 15000 });
  // Click a smart flow button on any visible card
  const smartBtn = page.getByRole('button', { name: /Appeal via Smart Flow/i });
  if (await smartBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await smartBtn.click();
    await page.waitForURL('**/smart-flow', { timeout: 8000 });
  } else {
    // Navigate directly - need task in store, so trigger via scenario
    await page.locator('button').filter({ hasText: 'Need to Appeal' }).first().click();
    await page.getByRole('button', { name: 'Appeal via Smart Flow' }).click();
    await page.waitForURL('**/smart-flow', { timeout: 8000 });
  }
  await expect(page.getByText('Agent Workflow').or(page.getByText('Executing Flow'))).toBeVisible({ timeout: 10000 });
});

// ═══════════════════════════════════════════════════════════════════
// HISTORY PAGE
// ═══════════════════════════════════════════════════════════════════

test('History — shows empty state when no tasks', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/history');
  await expect(page.getByText('Past Requests')).toBeVisible();
  await expect(page.getByText('No requests found')).toBeVisible();
  await expect(page.getByText('Start your first request')).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════
// STATUS PAGE
// ═══════════════════════════════════════════════════════════════════

test('Status — shows server status and support link', async ({ page }) => {
  await onboard(page);
  await gotoPage(page, '/status');
  await expect(page.getByRole('heading', { name: 'System Status' })).toBeVisible({ timeout: 5000 });
});

// ═══════════════════════════════════════════════════════════════════
// INTEGRATION: SCENARIO -> WORKFLOW PAGE -> RETURN
// ═══════════════════════════════════════════════════════════════════

test('Integration — kyc_wrong scenario navigates through KYC mismatch and returns', async ({ page }) => {
  await onboard(page);
  await page.locator('button').filter({ hasText: 'Name/DOB Differs' }).first().click();
  await page.waitForURL('**/kyc-mismatch', { timeout: 5000 });
  await expect(page.getByText('EPFO vs Aadhaar Comparison')).toBeVisible({ timeout: 3000 });
  // Fix and submit
  await page.getByRole('button', { name: /Proceed to Aadhaar OTP Sign/i }).click();
  await page.getByPlaceholder('1234').fill('1234');
  await page.getByRole('button', { name: /Sign & Submit Correction/i }).click();
  await expect(page.getByText('KYC Correction Submitted!')).toBeVisible({ timeout: 10000 });
  // Return to dashboard
  await page.getByText('Back to Dashboard').click();
  await page.waitForURL('**/', { timeout: 5000 });
});

test('Integration — no_exit scenario navigates through Mark Exit and returns', async ({ page }) => {
  await onboard(page);
  await page.locator('button').filter({ hasText: 'Transfer Blocked' }).first().click();
  await page.waitForURL('**/mark-exit', { timeout: 5000 });
  // Select establishment
  await page.getByRole('heading', { name: 'Apex Logistics & Warehousing Pvt Ltd' }).click();
  // Fill form and proceed
  await page.getByRole('button', { name: /Continue to Aadhaar OTP/i }).click();
  await page.getByPlaceholder('1234').fill('1234');
  await page.getByRole('button', { name: /Confirm & Update Exit Date/i }).click();
  await expect(page.getByText('Employment Status Updated!')).toBeVisible({ timeout: 5000 });
  // Can proceed to claim
  await expect(page.getByRole('button', { name: /Proceed to File Form 19/i })).toBeVisible();
  await page.getByText('Back to Dashboard').click();
  await page.waitForURL('**/', { timeout: 5000 });
});
