import sys
code = r'''const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:false, args:['--start-maximized']});
  const ctx = await b.newContext({viewport:null});
  const p = await ctx.newPage();
  const logs = [];
  p.on('console', msg => {
    const txt = msg.text().substring(0,200);
    if (txt.includes('[API]') || txt.includes('404') || txt.includes('400') || txt.includes('Error') || txt.includes('error')) {
      logs.push('['+msg.type()+'] '+txt);
    }
  });
  p.on('pageerror', err => logs.push('[PAGE_ERROR] '+err.message.substring(0,200)));

  console.log('\n=== METER VERSE - API ERROR DETECTION TEST ===\n');

  await p.goto('http://localhost:3000/', {waitUntil:'load'});
  await p.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed El-Sayed', role: 'super_admin', isAuthenticated: true } },
      version: 0
    }));
  });
  await p.reload({waitUntil:'networkidle0'});
  await p.waitForTimeout(4000);

  const loginVisible = await p.getByText('\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644').isVisible().catch(() => false);
  if (loginVisible) { console.log('AUTH FAILED\n'); await b.close(); return; }
  console.log('AUTH OK - logged in\n');

  console.log('Console errors/warnings during page load:');
  for (const l of logs) console.log('  ' + l);
  logs.length = 0;

  // Navigate to each page and capture API errors
  const pages = ['/', '/customers', '/projects', '/meters', '/invoices', '/payments', '/readings', '/reports'];
  for (const url of pages) {
    await p.goto('http://localhost:3000' + url, {waitUntil:'domcontentloaded'});
    await p.waitForTimeout(1000);
    if (logs.length > 0) {
      console.log('\nErrors on ' + url + ':');
      for (const l of logs) console.log('  ' + l);
      logs.length = 0;
    }
  }

  console.log('\n=== DONE - check output above for API errors ===');
  await p.waitForTimeout(2000);
  await b.close();
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
'''
with open('D:/meter/Meter/Frontend/pw-debug.cjs', 'w', encoding='ascii') as f:
    f.write(code)
print('Generated pw-debug.cjs')
