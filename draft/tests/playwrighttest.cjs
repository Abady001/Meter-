const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const p = await b.newPage();
  await p.goto('http://localhost:3000/');
  await p.evaluate(() => {
    localStorage.setItem('auth-storage', JSON.stringify({
      state: { user: { id: 'USR-001', name: 'Ahmed', role: 'super_admin', isAuthenticated: true } },
      version: 0
    }));
  });
  await p.reload({waitUntil:'networkidle0'});
  await p.waitForTimeout(2000);
  const n = await p.evaluate(() => document.querySelectorAll('button').length);
  console.log('Buttons after login:', n);
  const loginBtn = await p.getByText('\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644').isVisible().catch(() => false);
  console.log('Login visible:', loginBtn);
  await b.close();
})().catch(e => { console.log('FATAL:', e.message); process.exit(1); });
