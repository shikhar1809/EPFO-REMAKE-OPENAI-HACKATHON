import { chromium, devices } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 13'];
  const context = await browser.newContext({
    ...iPhone
  });
  const page = await context.newPage();
  
  const artifactDir = "C:\\Users\\royal\\.gemini\\antigravity\\brain\\64867d92-3d64-423f-9c36-1f76e47d935a\\scratch";

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173/');
  
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}\\1-language.png` });

  await page.click('text=English');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}\\2-user-type.png` });

  await page.click('text=I am a new user');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}\\3-identity.png` });

  await page.click('text=Yes, login with UAN');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}\\4-uan-login.png` });

  await page.fill('input[placeholder="Enter 12-digit UAN"]', '123456789012');
  await page.click('button:has-text("Verify")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${artifactDir}\\5-profile.png` });

  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}\\6-prerequisites.png` });

  await page.click('button:has-text("Verify & Continue")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}\\7-vault-intro.png` });

  await page.click('button:has-text("Connect with DigiLocker")');
  await page.waitForSelector('text=Vault Ready!', { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}\\8-vault-ready.png` });

  await page.click('button:has-text("Go to Dashboard")');
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${artifactDir}\\9-dashboard-crossroads.png` });

  await page.click('text=Use Smart Agent');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${artifactDir}\\10-dashboard-agent.png` });

  await page.fill('textarea', 'Withdraw PF');
  await page.click('button:has-text("Send")');
  await page.waitForTimeout(4000); // Wait for analyzing animation
  
  await page.waitForSelector('text=I made 5 steps for your issue.', { timeout: 10000 });
  await page.screenshot({ path: `${artifactDir}\\11-agent-plan.png`, fullPage: true });

  console.log('Screenshots generated!');
  await browser.close();
})();
