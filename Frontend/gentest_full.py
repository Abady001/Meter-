code = r'''const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().substring(0,100)); });

  console.log('=== PLAYWRIGHT FULL TEST ===\n');
  await page.goto('http://localhost:3000/', {waitUntil:'load'});

  // Inject auth
  await page.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed', role: 'super_admin', isAuthenticated: true },
      version: 0
    }));
  });
  await page.reload({waitUntil:'networkidle0'});
  await page.waitForTimeout(2000);

  // Check if still on login
  const loginVisible = await page.getByText('\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644').isVisible().catch(() => false);
  if (loginVisible) { console.log('AUTH FAILED'); await browser.close(); return; }

  console.log('AUTH OK');

  // Test pages via direct URL navigation
  const pages = [
    {name:'dashboard', url:'/'},
    {name:'customers', url:'/customers'},
    {name:'projects', url:'/projects'},
    {name:'meters', url:'/meters'},
    {name:'invoices', url:'/invoices'},
    {name:'payments', url:'/payments'},
    {name:'readings', url:'/readings'},
    {name:'reports', url:'/reports'}
  ];

  let passed = 0, failed = 0;
  for (const p of pages) {
    try {
      errors.length = 0;
      await page.goto('http://localhost:3000' + p.url, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(500);
      const ok = errors.length === 0;
      console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' ' + p.name);
      if (ok) passed++; else failed++;
    } catch(e) {
      console.log('  ERROR ' + p.name + ': ' + e.message.substring(0,60));
      failed++;
    }
  }

  console.log('\n=== RESULTS: ' + passed + ' PASS, ' + failed + ' FAIL ===');
  await browser.close();
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
'''
with open('D:/meter/Meter/Frontend/test-full.cjs', 'w', encoding='ascii') as f:
    f.write(code)
print('Generated test-full.cjs')
