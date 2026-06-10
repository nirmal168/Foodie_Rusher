// verify_frontend.js
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({type: msg.type(), text: msg.text()});
  });
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({url: request.url(), error: request.failure().errorText});
  });
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // ensure images load
    await page.screenshot({ path: 'frontend_verification.png', fullPage: true });
    console.log('--- VERIFICATION REPORT START ---');
    console.log('Console messages:');
    consoleMessages.forEach(m => console.log(`[${m.type}] ${m.text}`));
    console.log('Failed network requests:');
    failedRequests.forEach(r => console.log(`${r.url} -> ${r.error}`));
    console.log('--- VERIFICATION REPORT END ---');
  } catch (e) {
    console.error('Error during verification:', e);
  } finally {
    await browser.close();
  }
})();
