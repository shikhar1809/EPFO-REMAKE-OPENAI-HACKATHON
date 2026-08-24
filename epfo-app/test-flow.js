import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    console.log('Step 1: Language selection');
    await page.waitForSelector('text=Select Your Language');
    await page.click('text=English');

    console.log('Step 2: User Type selection');
    await page.waitForSelector('text=Are you a new or returning user?');
    await page.click('text=I am a new user');

    console.log('Step 4: Identity Discovery');
    await page.waitForSelector('text=Identity Discovery');
    await page.click('text=Yes, login with UAN');

    console.log('Step 5: UAN Verification');
    await page.waitForSelector('text=Verify UAN');
    await page.fill('input[placeholder="Enter 12-digit UAN"]', '123456789012');
    await page.click('button:has-text("Verify")');

    console.log('Step 6: Profile Setup');
    await page.waitForSelector('text=UAN Verified', { timeout: 5000 });
    await page.click('button:has-text("Continue")');

    console.log('Step 6b: Prerequisites');
    await page.waitForSelector('text=One-Time Security Setup', { timeout: 5000 });
    await page.click('button:has-text("Verify & Continue")');

    console.log('Step 7: Vault Intro (DigiLocker)');
    await page.waitForSelector('text=Document Vault');
    await page.click('button:has-text("Connect with DigiLocker")');
    // Wait for the fetching simulation to complete
    await page.waitForSelector('text=Vault Ready!', { timeout: 10000 });
    await page.click('button:has-text("Go to Dashboard")');

    console.log('Step 8: Dashboard Flow Selection');
    await page.waitForSelector('text=How would you like to proceed?');
    console.log('Dashboard reached! Selecting Smart Agent flow.');
    await page.click('text=Use Smart Agent');

    console.log('Step 8b: Agent Input');
    await page.waitForSelector('text=What would you like to do today?');
    console.log('Dashboard reached!');
    await page.fill('textarea[placeholder="Try \\"I want to withdraw my PF\\" or tap the mic to speak..."]', 'Withdraw PF');
    await page.click('button:has-text("Send")');

    // 9. Workflow engine execution
    console.log('Step 9: Smart Flow Engine - Start');
    // Wait for 6s initialization animation to complete before button appears
    await page.waitForTimeout(6500);
    
    // Execute first step
    console.log('Executing step 1 (Verify Identity)');
    await page.click('button:has-text("Let Agent Execute Step")');

    // Wait for bank verification form
    console.log('Step 10: Bank Verification Form');
    await page.waitForSelector('text=Please verify your bank account details.', { timeout: 10000 });
    await page.fill('input[placeholder="XXXX"]', '1234');
    await page.click('button:has-text("Verify & Continue")');

    // Execute gather_documents step
    console.log('Executing step 3 (Gather Documents)');
    await page.waitForSelector('text=Let Agent Execute Step', { timeout: 10000 });
    await page.click('button:has-text("Let Agent Execute Step")');

    // Wait for claim details form
    console.log('Step 11: Claim Details Form');
    await page.waitForSelector('text=Please provide the details for your claim.', { timeout: 10000 });
    await page.selectOption('select', 'illness');
    await page.fill('input[placeholder="Amount Required (₹)"]', '50000');
    await page.click('button:has-text("Prepare Claim")');

    // Wait for step-up auth
    console.log('Step 12: Sensitive Action (Step-Up Auth)');
    await page.waitForSelector('text=This will submit your claim.', { timeout: 10000 });
    await page.fill('input[placeholder="Enter Aadhaar OTP (use 1234)"]', '1234');
    await page.click('button:has-text("Sign & Submit Claim")');

    // Wait for completion
    console.log('Step 13: Workflow Completion');
    await page.waitForSelector('text=Task completed successfully.', { timeout: 10000 });
    await page.click('button:has-text("Return to Dashboard")');

    console.log('Step 14: Back to Dashboard');
    await page.waitForSelector('text=How would you like to proceed?', { timeout: 10000 });
    console.log('Test completed successfully! The interactive agentic flow works end-to-end.');

  } catch (error) {
    console.error('Test failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
