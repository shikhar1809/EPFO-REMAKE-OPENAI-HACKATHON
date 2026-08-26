// Playwright audit script for EPFO-REMAKE
const { chromium } = require('playwright');

const URL = 'https://epfo-remake-openai.vercel.app';
const results = [];

function log(section, status, note) {
  results.push({ section, status, note });
  console.log(`[${status}] ${section}: ${note}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 } // iPhone 14 Pro viewport
  });
  const page = await context.newPage();

  // =========================================================
  // TEST 1: Initial load — does it redirect to onboarding?
  // =========================================================
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    const url = page.url();
    if (url.includes('/onboarding')) {
      log('Initial Load / Route Guard', 'PASS', `Correctly redirected unauthenticated user to /onboarding`);
    } else {
      log('Initial Load / Route Guard', 'FAIL', `Expected /onboarding, got: ${url}`);
    }
  } catch (e) {
    log('Initial Load', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 2: Onboarding step 1 — language selection
  // =========================================================
  try {
    await page.waitForSelector('button', { timeout: 10000 });
    const buttons = await page.$$('button');
    const btnTexts = [];
    for (const btn of buttons) {
      const text = await btn.textContent();
      btnTexts.push(text.trim());
    }
    const hasEnglish = btnTexts.some(t => t.includes('English'));
    const hasHindi = btnTexts.some(t => t.includes('हिंदी'));
    if (hasEnglish && hasHindi) {
      log('Onboarding Step 1 - Language Select', 'PASS', `English and Hindi options visible. All 6 languages should be present.`);
    } else {
      log('Onboarding Step 1 - Language Select', 'WARN', `Could not confirm all language buttons. Found: ${btnTexts.join(', ')}`);
    }
  } catch (e) {
    log('Onboarding Step 1', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 3: Select English, go to user_type step
  // =========================================================
  try {
    await page.click('button:has-text("English")');
    await page.waitForTimeout(800);
    const h1 = await page.$eval('h1', el => el.textContent).catch(() => null);
    if (h1 && (h1.includes('Who are you?') || h1.includes('user') || h1.includes('New') || h1.includes('Welcome'))) {
      log('Onboarding Step 2 - User Type', 'PASS', `Navigated to user type selection after language select. H1: "${h1}"`);
    } else {
      log('Onboarding Step 2 - User Type', 'WARN', `Unexpected H1 after language select: "${h1}"`);
    }
  } catch (e) {
    log('Onboarding Step 2', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 4: Returning user login flow
  // =========================================================
  try {
    // Click "Returning User"
    const returningBtn = page.locator('button').filter({ hasText: /returning|already|login/i }).first();
    await returningBtn.click();
    await page.waitForTimeout(800);
    const h1 = await page.$eval('h1', el => el.textContent).catch(() => '');
    log('Onboarding - Returning User', 'PASS', `Clicked returning user. H1: "${h1}"`);
    
    // UAN input should be pre-filled
    const uanInput = await page.$('input[type="text"]');
    const uanValue = uanInput ? await uanInput.inputValue() : null;
    if (uanValue && uanValue.length === 12) {
      log('Onboarding - UAN Pre-fill', 'PASS', `UAN pre-filled: ${uanValue}`);
    } else {
      log('Onboarding - UAN Pre-fill', 'WARN', `UAN input value: "${uanValue}" — may need manual entry`);
    }
    
    // Click "Get OTP"
    const getOtpBtn = page.locator('button').filter({ hasText: /get otp/i }).first();
    await getOtpBtn.click();
    await page.waitForTimeout(1200);
    
    // OTP input should now appear — fill it
    const otpInput = await page.$('input[placeholder*="OTP"]');
    if (otpInput) {
      await otpInput.fill('1234');
      log('Onboarding - OTP Input', 'PASS', `OTP field appeared and filled with 1234`);
    } else {
      log('Onboarding - OTP Input', 'WARN', `OTP field not found after clicking Get OTP`);
    }
    
    // Verify OTP
    const verifyBtn = page.locator('button').filter({ hasText: /verify otp|login/i }).first();
    await verifyBtn.click();
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    log('Onboarding - Login Flow', finalUrl.includes('onboarding') ? 'WARN' : 'PASS', `After verify OTP — URL: ${finalUrl}`);
    
  } catch (e) {
    log('Onboarding - Returning User', 'ERROR', e.message);
  }

  // Navigate directly to home as authenticated (simulate via localStorage)
  // Reset and use new context to simulate authenticated state
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('onboarded', 'true');
    // Simulate session store (zustand persisted)
    const sessionKey = Object.keys(localStorage).find(k => k.includes('session') || k.includes('epfo'));
    console.log('localStorage keys after clear:', Object.keys(localStorage).join(', '));
  });
  
  // =========================================================
  // TEST 5: Navigate to dashboard
  // =========================================================
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  const dashUrl = page.url();
  log('Dashboard Access', dashUrl.includes('onboarding') ? 'INFO' : 'PASS', `Dashboard URL: ${dashUrl} (note: auth state is in-memory, re-login required)`);

  // =========================================================
  // TEST 6: Test /grievance — should be public (no login required)
  // =========================================================
  try {
    await page.goto(`${URL}/grievance`, { waitUntil: 'networkidle', timeout: 20000 });
    const grievanceUrl = page.url();
    const title = await page.$eval('h1', el => el.textContent).catch(() => null);
    if (!grievanceUrl.includes('/onboarding') && title) {
      log('Grievance - Public Access', 'PASS', `Grievance page accessible without login. Title: "${title}"`);
    } else {
      log('Grievance - Public Access', 'FAIL', `Grievance page redirected to: ${grievanceUrl}. This page should be public.`);
    }
  } catch(e) {
    log('Grievance - Public Access', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 7: Grievance form elements
  // =========================================================
  try {
    await page.goto(`${URL}/grievance`, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    
    const inputs = await page.$$('input, textarea, select');
    log('Grievance - Form Elements', inputs.length >= 3 ? 'PASS' : 'WARN', `Found ${inputs.length} form inputs (Name, Mobile, UAN, Description expected)`);
    
    const registerTab = page.locator('button').filter({ hasText: /register/i }).first();
    const trackTab = page.locator('button').filter({ hasText: /track/i }).first();
    log('Grievance - Tabs Present', (await registerTab.count() > 0 && await trackTab.count() > 0) ? 'PASS' : 'FAIL', `Register/Track tabs present`);
    
    const phoneLink = page.locator('a[href^="tel:"]');
    const emailLink = page.locator('a[href^="mailto:"]');
    const hasPhone = await phoneLink.count() > 0;
    const hasEmail = await emailLink.count() > 0;
    log('Grievance - Contact Links', (hasPhone && hasEmail) ? 'PASS' : 'WARN', `Phone CTA: ${hasPhone}, Email CTA: ${hasEmail}`);
    
  } catch(e) {
    log('Grievance - Form', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 8: /life-certificate without auth — should redirect
  // =========================================================
  try {
    await page.goto(`${URL}/life-certificate`, { waitUntil: 'networkidle', timeout: 20000 });
    const redirectUrl = page.url();
    if (redirectUrl.includes('/onboarding')) {
      log('LifeCertificate - Auth Guard', 'PASS', `Correctly redirected to onboarding without auth`);
    } else {
      log('LifeCertificate - Auth Guard', 'FAIL', `Did NOT redirect — life-certificate accessible without login at: ${redirectUrl}`);
    }
  } catch(e) {
    log('LifeCertificate - Auth Guard', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 9: /passbook without auth — should redirect
  // =========================================================
  try {
    await page.goto(`${URL}/passbook`, { waitUntil: 'networkidle', timeout: 20000 });
    const redirectUrl = page.url();
    if (redirectUrl.includes('/onboarding')) {
      log('Passbook - Auth Guard', 'PASS', `Correctly redirected to onboarding without auth`);
    } else {
      log('Passbook - Auth Guard', 'FAIL', `Passbook accessible without login at: ${redirectUrl}`);
    }
  } catch(e) {
    log('Passbook - Auth Guard', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 10: /smart-flow without auth — should redirect
  // =========================================================
  try {
    await page.goto(`${URL}/smart-flow`, { waitUntil: 'networkidle', timeout: 20000 });
    const redirectUrl = page.url();
    if (redirectUrl.includes('/onboarding')) {
      log('SmartFlow - Auth Guard', 'PASS', `Correctly redirected to onboarding without auth`);
    } else {
      log('SmartFlow - Auth Guard', 'FAIL', `SmartFlow accessible without login at: ${redirectUrl}`);
    }
  } catch(e) {
    log('SmartFlow - Auth Guard', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 11: /claim without auth — should redirect
  // =========================================================
  try {
    await page.goto(`${URL}/claim`, { waitUntil: 'networkidle', timeout: 20000 });
    const redirectUrl = page.url();
    if (redirectUrl.includes('/onboarding')) {
      log('Claim - Auth Guard', 'PASS', `Correctly redirected to onboarding without auth`);
    } else {
      log('Claim - Auth Guard', 'FAIL', `Claim accessible without login at: ${redirectUrl}`);
    }
  } catch(e) {
    log('Claim - Auth Guard', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 12: /mark-exit without auth — should redirect
  // =========================================================
  try {
    await page.goto(`${URL}/mark-exit`, { waitUntil: 'networkidle', timeout: 20000 });
    const redirectUrl = page.url();
    if (redirectUrl.includes('/onboarding')) {
      log('MarkExit - Auth Guard', 'PASS', `Correctly redirected to onboarding without auth`);
    } else {
      log('MarkExit - Auth Guard', 'FAIL', `MarkExit accessible without login at: ${redirectUrl}`);
    }
  } catch(e) {
    log('MarkExit - Auth Guard', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 13: Full onboarding flow to authenticated state
  // =========================================================
  try {
    await page.goto(`${URL}/onboarding`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    // Select English
    await page.click('button:has-text("English")');
    await page.waitForTimeout(600);
    
    // Click "Returning User" or first visible user type button
    const allBtns = await page.$$('button');
    let clicked = false;
    for (const btn of allBtns) {
      const text = await btn.textContent();
      if (text.match(/returning|already have|login|welcome back/i)) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      // Try clicking the first option button (not the back button)
      await allBtns[0].click();
    }
    await page.waitForTimeout(800);
    
    // Get OTP
    const getOtpBtns = await page.$$('button');
    for (const btn of getOtpBtns) {
      const text = await btn.textContent();
      if (text.match(/get otp/i)) {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(1000);
    
    // Fill OTP
    const otpInputs = await page.$$('input');
    let otpFilled = false;
    for (const inp of otpInputs) {
      const placeholder = await inp.getAttribute('placeholder') || '';
      if (placeholder.match(/otp/i) || placeholder.match(/1234/i)) {
        await inp.fill('1234');
        otpFilled = true;
        break;
      }
    }
    
    // Verify
    if (otpFilled) {
      const verifyBtns = await page.$$('button');
      for (const btn of verifyBtns) {
        const text = await btn.textContent();
        if (text.match(/verify|login|confirm/i)) {
          await btn.click();
          break;
        }
      }
      await page.waitForTimeout(3000);
      const afterLoginUrl = page.url();
      log('Full Login Flow', afterLoginUrl.includes('onboarding') ? 'PARTIAL' : 'PASS', `After full login: ${afterLoginUrl}`);
    } else {
      log('Full Login Flow - OTP', 'WARN', 'OTP input not found');
    }
    
  } catch(e) {
    log('Full Login Flow', 'ERROR', e.message);
  }

  // =========================================================
  // TEST 14: Check page titles and metadata consistency
  // =========================================================
  const pagesToCheck = [
    { path: '/grievance', expectedTitle: /support|grievance/i },
  ];
  
  for (const p of pagesToCheck) {
    try {
      await page.goto(`${URL}${p.path}`, { waitUntil: 'networkidle', timeout: 20000 });
      const title = await page.title();
      const h1 = await page.$eval('h1', el => el.textContent).catch(() => null);
      log(`Page: ${p.path}`, 'INFO', `Title: "${title}", H1: "${h1}"`);
    } catch(e) {
      log(`Page: ${p.path}`, 'ERROR', e.message);
    }
  }

  // =========================================================
  // TEST 15: Responsive layout — check MobileFrame
  // =========================================================
  try {
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const mainContentWidth = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      return main.offsetWidth;
    });
    log('Responsive Layout', viewportWidth <= 420 ? 'PASS' : 'INFO', `Viewport: ${viewportWidth}px, Content: ${mainContentWidth}px`);
  } catch(e) {
    log('Responsive Layout', 'ERROR', e.message);
  }

  // =========================================================
  // Print Summary
  // =========================================================
  console.log('\n\n========= AUDIT SUMMARY =========');
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const err = results.filter(r => r.status === 'ERROR').length;
  console.log(`PASS: ${pass} | FAIL: ${fail} | WARN: ${warn} | ERROR: ${err}`);
  console.log('\nDetailed Results:');
  results.forEach(r => console.log(`  [${r.status}] ${r.section}: ${r.note}`));
  
  // Write JSON results
  const fs = require('fs');
  fs.writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
  console.log('\nResults saved to audit-results.json');
  
  await browser.close();
})();
