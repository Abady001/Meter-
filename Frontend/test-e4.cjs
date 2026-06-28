const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:false, args:['--start-maximized']});
  const ctx = await b.newContext({viewport:null});
  const p = await ctx.newPage();
  const errors = [];
  const apiErrors = [];
  p.on('console', msg => {
    const txt = msg.text().substring(0,200);
    if (msg.type() === 'error') errors.push(txt);
    if (txt.includes('[API]')) apiErrors.push(txt);
  });
  p.on('pageerror', err => errors.push('PAGE_ERROR: '+err.message.substring(0,200)));

  console.log('\n=== METER VERSE - PHASE E4 CERTIFICATION ===\n');

  // Step 1: Get real JWT from dev-login
  console.log('[1] Getting JWT token...');
  const loginResp = await ctx.request.post('http://localhost:3001/api/v1/auth/dev-login', {
    data: { userId: 'USR-001', name: 'Ahmed El-Sayed', role: 'super_admin' }
  });
  const loginData = await loginResp.json();
  const token = loginData.accessToken;
  if (!token) { console.log('FAIL: No token\n'); await b.close(); return; }
  console.log('  Token OK');

  // Step 2: Load app + inject auth + JWT
  console.log('[2] Loading app with auth...');
  await p.goto('http://localhost:3000/', {waitUntil:'load'});
  await p.evaluate((t) => {
    localStorage.setItem('mp-auth-token', t);
    localStorage.setItem('mp-username', 'Test Admin');
    localStorage.removeItem('auth-storage');
  }, token);
  await p.reload({waitUntil:'load', timeout: 30000}).catch(() => {});
  await p.waitForTimeout(5000);
  const loginVisible = await p.getByText('\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644').isVisible().catch(() => false);
  if (loginVisible) { console.log('AUTH FAILED (still on login page)\n'); await b.close(); return; }
  console.log('  AUTH OK');

  // Step 3: Test ALL pages
  const pages = ['reading-new','dashboard','executive-dashboard','operations-dashboard','billing-dashboard','collections-dashboard-plus','utility-dashboard','solar-dashboard','settlements','workplace','customers','projects','meters','invoices','payments','readings','reports','settings','consumption','balances','sim-cards','alerts','tickets','support','upload-center','tariff-studio'];
  let passed = 0, failed = 0;
  for (const key of pages) {
    apiErrors.length = 0; errors.length = 0;
    try {
      await p.evaluate((k) => { if (window.__navigate) window.__navigate(k); }, key);
      await p.waitForTimeout(800);
      if (apiErrors.length > 0) { console.log('  FAIL ' + key); failed++; }
      else { console.log('  PASS ' + key); passed++; }
    } catch(e) { console.log('  ERROR ' + key); failed++; }
  }

  console.log('\n=== E4: ' + passed + ' PASS, ' + failed + ' FAIL ===');
  await p.waitForTimeout(2000);
  await b.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
