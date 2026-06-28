const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push({ text: msg.text(), page: page.url() }); });
  page.on('pageerror', err => errors.push({ text: err.message, page: page.url() }));

  const BASE = 'http://localhost:3000';
  const BASE_API = 'http://localhost:3001/api/v1';

  console.log('=== PLAYWRIGHT COMPREHENSIVE TEST ===\n');

  // 1. Get auth token
  const loginRes = await require('child_process').execSync(
    `powershell -Command "$b=@{userId='USR-001';role='super_admin'} | ConvertTo-Json; $r=Invoke-WebRequest -Uri '${BASE_API}/auth/dev-login' -Method POST -Body $b -ContentType 'application/json' -UseBasicParsing; ($r.Content | ConvertFrom-Json).accessToken"`,
    { encoding: 'utf8' }
  ).trim();
  const token = loginRes;

  // 2. Set auth in localStorage
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((t) => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed El-Sayed', email: 'ahmed@meterpulse.com', role: 'super_admin' }, isAuthenticated: true },
      version: 0
    }));
  }, token);
  await page.reload({ waitUntil: 'networkidle0' });
  await page.waitForTimeout(2000);

  // Check errors on login page
  if (errors.length > 0) { console.log('❌ Login page errors:'); errors.forEach(e => console.log(`  ${e.text}`)); errors.length = 0; }
  else { console.log('✅ Login page: 0 errors'); }

  // 3. Test all pages
  const pages = [
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Executive Dashboard', url: '/executive-dashboard' },
    { name: 'Projects', url: '/projects' },
    { name: 'Customers', url: '/customers' },
    { name: 'Meters', url: '/meters' },
    { name: 'Invoices', url: '/invoices' },
    { name: 'Payments', url: '/payments' },
    { name: 'Collections', url: '/payments' },
    { name: 'Readings', url: '/readings' },
    { name: 'Reports', url: '/reports' },
    { name: 'Tickets', url: '/tickets' },
    { name: 'Settings', url: '/settings' },
    { name: 'Upload Center', url: '/upload-center' },
    { name: 'Tariff Studio', url: '/tariff-studio' },
    { name: 'Database Admin', url: '/database-admin' },
  ];

  let pass = 0;
  let fail = 0;
  for (const p of pages) {
    try {
      await page.goto(`${BASE}${p.url}`, { waitUntil: 'networkidle0', timeout: 15000 });
      await page.waitForTimeout(1000);
      const url = page.url();
      if (errors.length > 0) {
        console.log(`❌ ${p.name}: ${errors.length} error(s)`);
        errors.forEach(e => console.log(`  ${e.text.substring(0, 100)}`));
        errors.length = 0;
        fail++;
      } else {
        console.log(`✅ ${p.name}`);
        pass++;
      }
    } catch (e) {
      console.log(`❌ ${p.name}: NAVIGATION FAILED — ${e.message.substring(0, 80)}`);
      fail++;
    }
  }

  // 4. Test search (Ctrl+K)
  try {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle0' });
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);
    const searchVisible = await page.locator('input[placeholder*="Search"]').isVisible().catch(() => false);
    console.log(searchVisible ? '✅ Global Search (Ctrl+K): visible' : '❌ Global Search: NOT visible');
    if (searchVisible) pass++; else fail++;
  } catch (e) { console.log('❌ Global Search FAILED'); fail++; }

  console.log(`\n=== RESULTS: ${pass} PASS, ${fail} FAIL ===`);
  await browser.close();
})();
