code = r'''const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({headless:true});
  const p = await b.newPage();
  await p.goto('http://localhost:3000/');
  await b.close();
})().catch(e => { console.log(e.message); process.exit(1); });
'''
with open('D:/meter/Meter/Frontend/test3.cjs', 'w', encoding='ascii') as f:
    f.write(code)
print('Written')
