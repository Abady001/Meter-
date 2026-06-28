const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:false, args:['--start-maximized']});
  const ctx = await b.newContext({viewport:null});
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('404')) errors.push(msg.text().substring(0,120)); });
  p.on('pageerror', err => errors.push('PAGE_ERROR: '+err.message.substring(0,120)));

  console.log('\n=== METER VERSE - VISIBLE PLAYWRIGHT TEST IN CHROME ===\n');

  // Step 1: Load app
  console.log('[1/8] Loading http://localhost:3000/ ...');
  await p.goto('http://localhost:3000/', {waitUntil:'load'});

  // Step 2: Inject auth
  console.log('[2/8] Injecting auth as Super Admin...');
  await p.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed El-Sayed', role: 'super_admin', isAuthenticated: true } },
      version: 0
    }));
  });
  await p.reload({waitUntil:'networkidle0'});
  await p.waitForTimeout(3000);

  const loginVisible = await p.getByText('\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644').isVisible().catch(() => false);
  if (loginVisible) { console.log('AUTH FAILED'); await b.close(); return; }
  console.log('  AUTH OK - Super Admin logged in');

  // Step 3: Dashboard buttons
  const buttons = await p.evaluate(() => Array.from(document.querySelectorAll('button, a[href]')).map(e => (e.textContent||'').trim()).filter(Boolean).slice(0,15));
  console.log('  Top buttons/links:', JSON.stringify(buttons));

  // Step 4: Navigate pages
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
      console.log('[' + (pages.indexOf(pageInfo)+3) + '/10] Navigating to ' + pageInfo.label + '...');
      await p.goto('http://localhost:3000' + pageInfo.url, {waitUntil:'domcontentloaded'});
      await p.waitForTimeout(800);
      const ok = errors.length === 0;
      if (ok) { console.log('  PASS ' + pageInfo.label); passed++; }
      else { console.log('  FAIL ' + pageInfo.label + ' - errors:', JSON.stringify(errors)); failed++; }
    } catch(e) { console.log('  ERROR ' + pageInfo.label + ': ' + e.message.substring(0,80)); failed++; }
  }

  console.log('\n=== FINAL RESULTS: ' + passed + ' PASS, ' + failed + ' FAIL ===');
  await p.waitForTimeout(3000);
  await b.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
