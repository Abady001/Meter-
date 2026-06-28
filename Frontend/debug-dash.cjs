const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const ctx = await b.newContext();
  const p = await ctx.newPage();
  const consoleErrors = [];
  p.on('console', msg => { if(msg.type()==='error') consoleErrors.push(msg.text().substring(0,150)); });
  p.on('pageerror', err => consoleErrors.push('PAGE: '+err.message.substring(0,150)));

  const loginResp = await ctx.request.post('http://localhost:3001/api/v1/auth/dev-login', { data: { userId:'USR-001', name:'Test', role:'super_admin' } });
  const token = (await loginResp.json()).accessToken;
  await p.goto('http://localhost:3000/', {waitUntil:'load'});
  await p.evaluate((t) => {
    localStorage.setItem('auth-storage', JSON.stringify({state:{user:{id:'USR-001',name:'T',role:'super_admin',isAuthenticated:true}},version:0}));
    localStorage.setItem('mp-auth-token', t);
  }, token);
  await p.reload({waitUntil:'networkidle0'});
  await p.waitForTimeout(2000);

  for (const pageKey of ['executive-dashboard', 'collections-dashboard-plus']) {
    consoleErrors.length = 0;
    await p.evaluate((k) => { if(window.__navigate) window.__navigate(k); }, pageKey);
    await p.waitForTimeout(2000);
    console.log(pageKey + ':', JSON.stringify(consoleErrors));
  }
  await b.close();
})().catch(e => console.log('FATAL:', e.message));
