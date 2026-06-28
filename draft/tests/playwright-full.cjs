const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const p = await b.newPage();
  const errors = [];
  p.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('404')) errors.push(msg.text().substring(0,120)); });

  console.log('\n=== PLAYWRIGHT COMPREHENSIVE TEST ===\n');

  // Page 1: Login via auth injection
  console.log('[1/8] Loading app...');
  await p.goto('http://localhost:3000/', {waitUntil:'load'});
  await p.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed', role: 'super_admin', isAuthenticated: true } },
      version: 0
    }));
  });
  await p.reload({waitUntil:'networkidle0'});
  await p.waitForTimeout(3000);
  const loginVisible = await p.getByText('\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644').isVisible().catch(() => false);
  if (loginVisible) { console.log('AUTH FAILED - still on login page\n'); await b.close(); return; }
  console.log('  AUTH OK - logged in');

  // Page 2: Navigate each main page via URL
  const pages = [
    {url:'/', label:'Dashboard'},
    {url:'/customers', label:'Customers'},
    {url:'/projects', label:'Projects'},
    {url:'/meters', label:'Meters'},
    {url:'/invoices', label:'Invoices'},
    {url:'/payments', label:'Payments'},
    {url:'/readings', label:'Readings'},
    {url:'/reports', label:'Reports'},
  ];

  let passed = 0, failed = 0;
  for (const pageInfo of pages) {
    try {
      errors.length = 0;
      await p.goto('http://localhost:3000' + pageInfo.url, {waitUntil:'domcontentloaded'});
      await p.waitForTimeout(500);
      const ok = errors.length === 0;
      console.log('  ' + (ok ? 'PASS' : 'FAIL') + ' ' + pageInfo.label);
      if (ok) passed++; else failed++;
    } catch(e) { console.log('  ERROR ' + pageInfo.label + ': ' + e.message.substring(0,60)); failed++; }
  }

  console.log('\n=== RESULTS: ' + passed + ' PASS, ' + failed + ' FAIL ===');
  const exitCode = failed > 0 ? 1 : 0;
  await b.close();
  process.exit(exitCode);
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
