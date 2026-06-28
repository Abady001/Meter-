import sys
code = r'''const { chromium } = require('playwright');
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

  console.log('\n=== METER VERSE - FINAL VERIFICATION ===\n');

  await p.goto('http://localhost:3000/', {waitUntil:'load'});
  await p.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed El-Sayed', role: 'super_admin', isAuthenticated: true } },
      version: 0
    }));
  });
  await p.reload({waitUntil:'networkidle0'});
  await p.waitForTimeout(3000);
  console.log('AUTH OK\n');

  // Test ReadingNewPage specifically (was crashing with 'meters is not defined')
  console.log('Testing ReadingNewPage...');
  await p.evaluate((k) => { if (window.__navigate) window.__navigate(k); }, 'reading-new');
  await p.waitForTimeout(2000);
  if (errors.length > 0) {
    console.log('  ERRORS on reading-new:');
    for (const e of errors) console.log('    ' + e.substring(0,100));
  } else if (apiErrors.length > 0) {
    console.log('  API errors on reading-new:');
    for (const e of apiErrors) console.log('    ' + e.substring(0,100));
  } else {
    console.log('  PASS reading-new - no errors');
  }

  // Now loop all main pages
  const pages = ['dashboard','customers','projects','meters','invoices','payments','readings','reports','settings','consumption','water-balance','balances','sim-cards','alerts','tickets','support','upload-center','tariff-studio'];
  let passed = 0, failed = 0;
  for (const key of pages) {
    apiErrors.length = 0;
    errors.length = 0;
    try {
      await p.evaluate((k) => { if (window.__navigate) window.__navigate(k); }, key);
      await p.waitForTimeout(800);
      if (errors.length > 0 || apiErrors.length > 0) {
        console.log('  FAIL ' + key);
        if (apiErrors.length > 0) console.log('    API: ' + apiErrors[0].substring(0,120));
        if (errors.length > 0) console.log('    JS: ' + errors[0].substring(0,120));
        failed++;
      } else { console.log('  PASS ' + key); passed++; }
    } catch(e) { console.log('  ERROR ' + key + ': ' + e.message.substring(0,60)); failed++; }
  }

  console.log('\n=== FINAL: ' + passed + ' PASS, ' + failed + ' FAIL ===');
  await p.waitForTimeout(3000);
  await b.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
'''
with open('D:/meter/Meter/Frontend/pw-final-verify.cjs', 'w', encoding='ascii') as f:
    f.write(code)
print('Generated pw-final-verify.cjs')
