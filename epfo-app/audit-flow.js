import { chromium, devices } from 'playwright';
import fs from 'fs';

const artifactDir = "C:\\Users\\royal\\.gemini\\antigravity\\brain\\64867d92-3d64-423f-9c36-1f76e47d935a\\scratch\\audit";
if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

const issues = [];
const screenshots = [];

function logIssue(severity, page, description, suggestion) {
  const issue = { severity, page, description, suggestion };
  issues.push(issue);
  console.log(`[${severity}] ${page}: ${description}`);
}

async function shot(page, name, label) {
  const path = `${artifactDir}\\${name}.png`;
  await page.screenshot({ path, fullPage: false });
  screenshots.push({ path, label });
  console.log(`📸 ${label}`);
}

(async () => {
  console.log('\n====== EPFO REMAKE – FULL PRODUCT AUDIT ======\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    colorScheme: 'light'
  });
  const page = await context.newPage();

  // Capture all console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // ─── SCREEN 1: Language Selection ───────────────────────────────────────────
  console.log('\n── Screen 1: Language Selection ──');
  await page.goto('http://localhost:5173/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1200);
  await shot(page, '01-language', 'Language Selection');

  const langOptions = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()).filter(Boolean));
  console.log('  Language options found:', langOptions.filter(l => ['English','हिंदी','मराठी','தமிழ்','తెలుగు','বাংলা'].includes(l)));
  
  if (!langOptions.includes('English')) logIssue('CRITICAL', 'Language Screen', 'No English option found', 'Check language button render');

  // Check if back button exists on first screen (it shouldn't overwhelm)
  const backBtnVisible = await page.$('button:has-text("←")');
  if (backBtnVisible) logIssue('UX', 'Language Screen', 'Back button shown on first screen (nowhere to go back to)', 'Hide back button on step 1');

  // ─── SCREEN 2: User Type ─────────────────────────────────────────────────────
  console.log('\n── Screen 2: User Type ──');
  await page.click('text=English');
  await page.waitForTimeout(600);
  await shot(page, '02-user-type', 'User Type Selection');

  const userTypeText = await page.textContent('body');
  if (!userTypeText.includes('new user') || !userTypeText.includes('returning')) {
    logIssue('CRITICAL', 'User Type', 'Missing new/returning user options', 'Check step render');
  }

  // ─── SCREEN 3: Identity Discovery ────────────────────────────────────────────
  console.log('\n── Screen 3: Identity Discovery ──');
  await page.click('text=I am a new user');
  await page.waitForTimeout(600);
  await shot(page, '03-identity', 'Identity Discovery');

  const identityBody = await page.textContent('body');
  if (!identityBody.includes('UAN')) {
    logIssue('HIGH', 'Identity', 'UAN option not visible', 'Check identity step');
  }
  if (!identityBody.includes("don't have")) {
    logIssue('MEDIUM', 'Identity', 'No option for users without UAN — first-timers will be stuck', 'Add "I don\'t have a UAN" flow clearly');
  }

  // ─── SCREEN 4: UAN Verification ──────────────────────────────────────────────
  console.log('\n── Screen 4: UAN Verification ──');
  await page.click('text=Yes, login with UAN');
  await page.waitForTimeout(600);
  await shot(page, '04-uan', 'UAN Verification');

  // Test: What happens with wrong UAN length?
  await page.fill('input[placeholder="Enter 12-digit UAN"]', '123');
  const verifyBtnDisabled = await page.$('button[disabled]:has-text("Verify")');
  if (!verifyBtnDisabled) {
    logIssue('HIGH', 'UAN Screen', 'Verify button not disabled for short UAN — user can submit garbage', 'Disable button until 12 digits entered');
  } else {
    console.log('  ✅ Verify button correctly disabled for short UAN');
  }

  // Test: No OTP step — security gap
  logIssue('HIGH', 'UAN Screen', 'UAN verification has NO OTP or password — any UAN number "works". Not realistic.', 'Add mock OTP/MPIN step to mirror EPFO UMANG flow');

  await page.fill('input[placeholder="Enter 12-digit UAN"]', '123456789012');
  await page.click('button:has-text("Verify")');
  await page.waitForTimeout(1500);
  await shot(page, '05-profile', 'Profile Setup (Post UAN)');

  // ─── SCREEN 5: Profile Setup ──────────────────────────────────────────────────
  console.log('\n── Screen 5: Profile Setup ──');
  const profileBody = await page.textContent('body');
  if (!profileBody.includes('UAN Verified')) {
    logIssue('MEDIUM', 'Profile Setup', 'No clear UAN Verified success state visible', 'Ensure success badge is prominent');
  }
  if (!profileBody.includes('name') && !profileBody.includes('Name')) {
    logIssue('LOW', 'Profile Setup', 'Profile setup does not ask for user name — greeting says "Citizen"', 'Add name/mobile field in profile setup');
  }

  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(600);

  // ─── SCREEN 6: Prerequisites ──────────────────────────────────────────────────
  console.log('\n── Screen 6: Prerequisites (One-time Security) ──');
  await shot(page, '06-prerequisites', 'Prerequisites / Security Setup');
  const preBody = await page.textContent('body');
  if (!preBody.includes('Security')) {
    logIssue('MEDIUM', 'Prerequisites', 'Security setup screen not found', 'Check step render');
  }
  
  // Check: Is this screen necessary? Could overwhelm users
  logIssue('UX', 'Prerequisites', 'Security Q&A step adds friction — most users won\'t expect this in a PF app', 'Consider replacing with a PIN setup (4-digit MPIN) which is more familiar from UMANG/EPFO');

  await page.click('button:has-text("Verify & Continue")');
  await page.waitForTimeout(600);

  // ─── SCREEN 7: DigiLocker / Vault ─────────────────────────────────────────────
  console.log('\n── Screen 7: DigiLocker Vault ──');
  await shot(page, '07-vault-intro', 'Document Vault Intro');
  const vaultBody = await page.textContent('body');
  if (!vaultBody.includes('DigiLocker')) {
    logIssue('HIGH', 'Vault', 'DigiLocker brand not mentioned clearly', 'Trust signals are important here');
  }

  await page.click('button:has-text("Connect with DigiLocker")');
  await page.waitForTimeout(1000);
  await shot(page, '08-vault-syncing', 'Vault Syncing Animation');
  
  await page.waitForSelector('text=Vault Ready!', { timeout: 10000 });
  await page.waitForTimeout(500);
  await shot(page, '09-vault-ready', 'Vault Ready');

  const vaultReadyBody = await page.textContent('body');
  if (!vaultReadyBody.includes('Aadhaar') || !vaultReadyBody.includes('PAN')) {
    logIssue('MEDIUM', 'Vault Ready', 'Fetched documents not shown clearly after sync', 'List fetched docs with checkmarks');
  }

  // ─── SCREEN 8: Dashboard ──────────────────────────────────────────────────────
  console.log('\n── Screen 8: Main Dashboard ──');
  await page.click('button:has-text("Go to Dashboard")');
  await page.waitForTimeout(6000); // scene transition
  await shot(page, '10-dashboard', 'Main Dashboard');

  const dashBody = await page.textContent('body');
  if (!dashBody.includes('Smart Agent')) logIssue('HIGH', 'Dashboard', 'Smart Agent option missing', 'Check flowChoice render');
  if (!dashBody.includes('Traditional')) logIssue('HIGH', 'Dashboard', 'Traditional flow option missing', 'Check flowChoice render');
  if (!dashBody.includes('Past Requests')) logIssue('MEDIUM', 'Dashboard', 'Past Requests section missing', 'Check section render');

  logIssue('UX', 'Dashboard', 'Dashboard shows TWO big choices (Smart Agent / Traditional) — first-time users may not know which to pick. No guidance text.', 'Add "Recommended for first time" tag on Smart Agent');

  // ─── SCREEN 9: Smart Agent Flow ───────────────────────────────────────────────
  console.log('\n── Screen 9: Smart Agent Flow ──');
  await page.click('text=Use Smart Agent');
  await page.waitForTimeout(700);
  await shot(page, '11-agent-input', 'Smart Agent Input');

  const agentBody = await page.textContent('body');
  if (!agentBody.includes('What would you like')) {
    logIssue('HIGH', 'Smart Agent', 'Agent prompt area not found', 'Check render');
  }

  // Check for suggestion chips / quick actions
  const hasSuggestions = await page.$('button:has-text("Withdraw PF")') || await page.$('button:has-text("withdraw")');
  if (!hasSuggestions) {
    logIssue('UX', 'Smart Agent', 'No suggestion chips/quick-action buttons — blank textarea is intimidating for rural users', 'Add 3-4 quick tap chips: "Withdraw PF", "Check Balance", "Transfer PF", "Raise Grievance"');
  }

  await page.fill('textarea', 'Withdraw PF');
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(4000);
  await shot(page, '12-agent-loading', 'Agent Initialization Loading');
  
  // Wait for 6s loading
  await page.waitForTimeout(4000);
  await shot(page, '13-agent-steps', 'Agent Steps Generated');

  const stepsBody = await page.textContent('body');
  if (!stepsBody.includes('steps')) {
    logIssue('HIGH', 'Agent Steps', 'Steps not generated after loading', 'Check SmartFlowEngine state');
  }

  // ─── SCREEN 10: Traditional Flow ──────────────────────────────────────────────
  console.log('\n── Screen 10: Traditional Workflows ──');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  await page.click('text=Use Traditional Workflow');
  await page.waitForTimeout(600);
  await shot(page, '14-traditional-flow', 'Traditional Flow Options');

  const tradBody = await page.textContent('body');
  const expectedWorkflows = ['Passbook', 'Claim', 'Transfer', 'Grievance', 'Document'];
  expectedWorkflows.forEach(wf => {
    if (!tradBody.includes(wf)) {
      logIssue('HIGH', 'Traditional Flow', `"${wf}" workflow missing from traditional menu`, `Add ${wf} option`);
    }
  });

  // ─── SCREEN 11: Passbook ──────────────────────────────────────────────────────
  console.log('\n── Screen 11: Passbook ──');
  const passbookBtn = await page.$('text=Passbook');
  if (passbookBtn) {
    await passbookBtn.click();
    await page.waitForTimeout(600);
    await shot(page, '15-passbook', 'Passbook Page');
    const pbBody = await page.textContent('body');
    if (!pbBody.includes('balance') && !pbBody.includes('Balance')) {
      logIssue('HIGH', 'Passbook', 'No balance figure shown', 'Display mock PF balance prominently');
    }
    if (!pbBody.includes('transaction') && !pbBody.includes('Transaction') && !pbBody.includes('contribution')) {
      logIssue('MEDIUM', 'Passbook', 'No transaction history visible', 'Show contribution history table');
    }
    await page.goBack();
    await page.waitForTimeout(600);
  } else {
    logIssue('HIGH', 'Traditional Flow', 'Passbook button not found', 'Check render');
  }

  // ─── SCREEN 12: Claim ─────────────────────────────────────────────────────────
  console.log('\n── Screen 12: Claim ──');
  const claimBtn = await page.$('text=Claim');
  if (claimBtn) {
    await claimBtn.click();
    await page.waitForTimeout(600);
    await shot(page, '16-claim', 'Claim Page');
    const claimBody = await page.textContent('body');
    if (!claimBody.includes('Form 19') && !claimBody.includes('Form 31') && !claimBody.includes('withdraw')) {
      logIssue('MEDIUM', 'Claim Page', 'No EPFO form references (Form 19/31) — real EPFO users expect these', 'Reference actual EPFO form names');
    }
    await page.goBack();
    await page.waitForTimeout(600);
  }

  // ─── SCREEN 13: History Page ──────────────────────────────────────────────────
  console.log('\n── Screen 13: History Page ──');
  await page.goto('http://localhost:5173/history');
  await page.waitForTimeout(800);
  await shot(page, '17-history', 'History Page');
  const histBody = await page.textContent('body');
  if (!histBody.includes('Past') && !histBody.includes('history') && !histBody.includes('History')) {
    logIssue('MEDIUM', 'History', 'History page content missing', 'Check route and render');
  }
  const searchInput = await page.$('input[type="text"], input[placeholder*="Search"]');
  if (!searchInput) {
    logIssue('MEDIUM', 'History', 'No search bar on history page', 'Add search input for filtering requests');
  }

  // ─── SCREEN 14: Language Switcher Test ────────────────────────────────────────
  console.log('\n── Screen 14: Language Switcher ──');
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(1000);
  const langSwitcher = await page.$('select');
  if (!langSwitcher) {
    logIssue('HIGH', 'Language Switcher', 'Language switcher not visible on screen', 'Check MobileFrame header render');
  } else {
    await langSwitcher.selectOption('hi');
    await page.waitForTimeout(800);
    await shot(page, '18-hindi-mode', 'Hindi Language Mode');
    const hindiBody = await page.textContent('body');
    // Check if anything changed to Hindi
    if (hindiBody.includes('Select Your Language') || hindiBody.includes('English')) {
      logIssue('MEDIUM', 'Language Switcher', 'Language switch to Hindi does not translate page content — still shows English', 'Complete i18n translation files for all languages');
    }
    await langSwitcher.selectOption('en');
    await page.waitForTimeout(500);
  }

  // ─── SCREEN 15: Font Size Accessibility ──────────────────────────────────────
  console.log('\n── Screen 15: Accessibility (Font Size) ──');
  const fontIncBtn = await page.$('button:has-text("A+")');
  if (!fontIncBtn) {
    logIssue('HIGH', 'Accessibility', 'Font size A+/A- buttons not found', 'Check MobileFrame header render');
  } else {
    await fontIncBtn.click();
    await fontIncBtn.click();
    await page.waitForTimeout(400);
    await shot(page, '19-large-font', 'Large Font Mode (Senior Mode)');
    // Reset
    const fontDecBtn = await page.$('button:has-text("A-")');
    if (fontDecBtn) { await fontDecBtn.click(); await fontDecBtn.click(); }
  }

  // ─── Console errors summary ───────────────────────────────────────────────────
  if (consoleErrors.length > 0) {
    consoleErrors.forEach(e => logIssue('CRITICAL', 'JavaScript', `Console error: ${e}`, 'Fix runtime error'));
  }

  await browser.close();

  // ─── WRITE AUDIT REPORT ──────────────────────────────────────────────────────
  const criticals = issues.filter(i => i.severity === 'CRITICAL');
  const highs = issues.filter(i => i.severity === 'HIGH');
  const mediums = issues.filter(i => i.severity === 'MEDIUM');
  const uxIssues = issues.filter(i => i.severity === 'UX');
  const lows = issues.filter(i => i.severity === 'LOW');

  const report = {
    summary: { criticals: criticals.length, highs: highs.length, mediums: mediums.length, uxIssues: uxIssues.length, lows: lows.length },
    issues,
    consoleErrors,
    screenshots
  };

  fs.writeFileSync(`${artifactDir}\\audit-report.json`, JSON.stringify(report, null, 2));

  console.log('\n====== AUDIT COMPLETE ======');
  console.log(`CRITICAL: ${criticals.length} | HIGH: ${highs.length} | MEDIUM: ${mediums.length} | UX: ${uxIssues.length} | LOW: ${lows.length}`);
  console.log(`Report: ${artifactDir}\\audit-report.json`);
})();
