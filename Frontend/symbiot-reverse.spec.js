const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordHar: { path: 'symbiot-sync.har' }
  });
  const page = await context.newPage();

  // Capture all network requests
  const requests = [];
  page.on('request', request => {
    if (request.method() !== 'OPTIONS') {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      });
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('api') || url.includes('sync') || url.includes('meter')) {
      try {
        const body = await response.text();
        console.log(`\n[${response.status()}] ${response.request().method()} ${url}`);
        console.log(`  Body: ${body.substring(0, 300)}`);
      } catch (e) {}
    }
  });

  try {
    console.log('=== NAVIGATING TO SYMBIOT sBill ===');
    await page.goto('http://10.50.30.2:9999/', { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Take screenshot of login page
    await page.screenshot({ path: 'symbiot-login.png', fullPage: true });
    console.log('Screenshot saved: symbiot-login.png');
    
    // Login
    console.log('\n=== LOGGING IN ===');
    await page.fill('input[type="text"], input[name="username"], input[id*="user"]', 'admin');
    await page.fill('input[type="password"], input[name="password"]', 'iskra');
    await page.screenshot({ path: 'symbiot-login-filled.png' });
    
    // Click login button
    await page.click('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'symbiot-after-login.png', fullPage: true });
    
    // Navigate to meter page
    console.log('\n=== NAVIGATING TO METER PAGE ===');
    await page.goto('http://10.50.30.2:9999/#/meter', { timeout: 30000, waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'symbiot-meter-page.png', fullPage: true });
    
    // Look for sync buttons
    console.log('\n=== LOOKING FOR SYNC CONTROLS ===');
    const pageContent = await page.content();
    const syncMatches = pageContent.match(/[Ss]ync|[Ss]ynchronize|[Ss]ynchro|[ا]تزامن/g);
    console.log('Sync-related text found:', syncMatches?.length || 0, 'occurrences');
    
    // Find all buttons
    const buttons = await page.locator('button, a[href], [onclick], [ng-click], [click]').all();
    console.log(`\nTotal clickable elements: ${buttons.length}`);
    for (const btn of buttons) {
      const text = await btn.textContent();
      const href = await btn.getAttribute('href');
      const onclick = await btn.getAttribute('onclick');
      if (text && (text.toLowerCase().includes('sync') || text.includes('زامن') || text.includes('متر'))) {
        console.log(`  SYNC BUTTON: "${text.substring(0,50)}" href="${href}" onclick="${onclick}"`);
      }
    }
    
    // Try clicking sync buttons
    const syncBtns = page.locator('button, a, [click]');
    const count = await syncBtns.count();
    for (let i = 0; i < count; i++) {
      const text = await syncBtns.nth(i).textContent();
      if (text && text.toLowerCase().includes('sync')) {
        console.log(`\n=== CLICKING SYNC BUTTON: "${text}" ===`);
        await syncBtns.nth(i).click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'symbiot-after-sync-click.png' });
        break;
      }
    }
    
  } catch (e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: 'symbiot-error.png' });
  }
  
  // Save network requests
  console.log('\n=== ALL NETWORK REQUESTS ===');
  for (const req of requests) {
    if (req.url.includes('10.50.30.2')) {
      console.log(`${req.method} ${req.url}`);
      if (req.postData) console.log(`  POST: ${req.postData.substring(0,200)}`);
    }
  }
  
  await browser.close();
  console.log('\n=== DONE ===');
})();
