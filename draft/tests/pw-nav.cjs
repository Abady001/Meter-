const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:false, args:['--start-maximized']});
  const ctx = await b.newContext({viewport:null});
  const p = await ctx.newPage();
  const errors = [];
  const apiErrors = [];
  p.on('console', msg => {
    const txt = msg.text().substring(0,150);
    if (msg.type() === 'error' || txt.includes('[API]')) {
      if (txt.includes('[API]')) apiErrors.push(txt);
      else errors.push(txt);
    }
  });
  p.on('pageerror', err => errors.push('PAGE_ERROR: '+err.message.substring(0,150)));

  console.log('\n=== METER VERSE - CLIENT-SIDE NAV TEST ===\n');

  // Load app + inject auth
  await p.goto('http://localhost:3000/', {waitUntil:'load'});
  await p.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed El-Sayed', role: 'super_admin', isAuthenticated: true } },
      version: 0
    }));
  });
  await p.reload({waitUntil:'networkidle0'});
  await p.waitForTimeout(3000);

  const loginVisible = await p.getByText('\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644').isVisible().catch(() => false);
  if (loginVisible) { console.log('AUTH FAILED\n'); await b.close(); return; }
  console.log('AUTH OK - Super Admin logged in\n');

  if (apiErrors.length > 0) {
    console.log('API errors on dashboard:');
    for (const e of apiErrors) console.log('  ' + e);
    console.log('');
  }

  // Client-side navigation via window.__navigate
  const pages = [
    {key:'dashboard', label:'Dashboard'},
    {key:'customers', label:'Customers'},
    {key:'projects', label:'Projects'},
    {key:'meters', label:'Meters'},
    {key:'invoices', label:'Invoices'},
    {key:'payments', label:'Payments'},
    {key:'readings', label:'Readings'},
    {key:'reports', label:'Reports'},
  ];

  let passed = 0, failed = 0;
  for (const {key, label} of pages) {
    apiErrors.length = 0;
    errors.length = 0;
    try {
      await p.evaluate((k) => { if (window.__navigate) window.__navigate(k); }, key);
      await p.waitForTimeout(1000);

      const hasApiErrors = apiErrors.length > 0;
      const hasJsErrors = errors.length > 0;
      if (hasApiErrors || hasJsErrors) {
        console.log('  FAIL ' + label);
        if (hasApiErrors) for (const e of apiErrors) console.log('    API: ' + e);
        if (hasJsErrors) for (const e of errors) console.log('    JS: ' + e.substring(0,100));
        failed++;
      } else {
        console.log('  PASS ' + label);
        passed++;
      }
    } catch(e) {
      console.log('  ERROR ' + label + ': ' + e.message.substring(0,80));
      failed++;
    }
  }

  console.log('\n=== RESULTS: ' + passed + ' PASS, ' + failed + ' FAIL ===');
  await p.waitForTimeout(2000);
  await b.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
