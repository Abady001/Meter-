import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const results = { visited: [], errors: [], warnings: [], httpFailures: [] };

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  page.on('console', (msg) => {
    if (msg.type() === 'error') results.errors.push(msg.text());
    if (msg.type() === 'warning') results.warnings.push(msg.text());
  });
  page.on('pageerror', (err) => results.errors.push(err.message));
  page.on('requestfinished', async (req) => {
    const resp = await req.response();
    if (resp && resp.status() >= 400)
      results.httpFailures.push(`${req.method()} ${req.url()} -> ${resp.status()}`);
  });

  const wait = (ms = 300) => page.waitForTimeout(ms);
  const clickNav = async (name) => {
    const btn = page.getByRole('button', { name, exact: true }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.scrollIntoViewIfNeeded();
      await btn.click(); await wait(500);
      results.visited.push(name);
    }
  };

  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await wait(1000);
  results.visited.push('homepage (login)');

  // Login with Arabic text
  await page.getByPlaceholder('admin@meterpulse.com').fill('admin@meterpulse.com');
  await page.getByPlaceholder('أدخل كلمة المرور').fill('password123');
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await wait(3000);
  results.visited.push('login');

  // Navigate sidebar nav items (Arabic or English)
  const navItems = ['لوحة القيادة', 'Dashboard', 'المشاريع', 'Projects', 'العملاء', 'Customers',
    'العدادات', 'Meters', 'القراءات', 'Readings', 'شرائح SIM', 'SIM Cards',
    'الاستهلاك', 'Consumption', 'الميزان المائي', 'Water Balance', 'الفواتير', 'Invoices',
    'المدفوعات', 'Payments', 'الأرصدة', 'Balances', 'التقارير', 'Reports',
    'التنبيهات', 'Alerts', 'التذاكر', 'Tickets', 'الدعم', 'Support', 'الإعدادات', 'Settings'];

  for (const name of navItems) {
    const btn = page.getByRole('button', { name, exact: true }).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.scrollIntoViewIfNeeded();
      await btn.click(); await wait(400);
      results.visited.push(name);
    }
  }

  // Submenu items
  const subMenus = [
    ['العدادات', 'Meters', 'جميع العدادت', 'All Meters'],
    ['العدادات', 'Meters', 'تعيين عداد', 'Assign Meter'],
    ['العدادات', 'Meters', 'استبدال عداد', 'Replace Meter'],
    ['العدادات', 'Meters', 'إنهاء عداد', 'Terminate Meter'],
    ['القراءات', 'Readings', 'جميع القراءات', 'All Readings'],
    ['القراءات', 'Readings', 'قراءة جديدة', 'New Reading']
  ];
  for (const [p1, p2, c1, c2] of subMenus) {
    const childBtn = page.getByRole('button', { name: c1, exact: true }).first();
    if (await childBtn.isVisible().catch(() => false)) {
      await childBtn.scrollIntoViewIfNeeded();
      await childBtn.click(); await wait(400);
      results.visited.push(`${p1} > ${c1}`);
    } else {
      const childBtn2 = page.getByRole('button', { name: c2, exact: true }).first();
      if (await childBtn2.isVisible().catch(() => false)) {
        await childBtn2.scrollIntoViewIfNeeded();
        await childBtn2.click(); await wait(400);
        results.visited.push(`${p2} > ${c2}`);
      } else {
        // Try parent first
        const parentBtn = page.getByRole('button', { name: p1, exact: true }).first();
        if (await parentBtn.isVisible().catch(() => false)) {
          await parentBtn.scrollIntoViewIfNeeded();
          await parentBtn.click(); await wait(300);
        } else {
          const parentBtn2 = page.getByRole('button', { name: p2, exact: true }).first();
          if (await parentBtn2.isVisible().catch(() => false)) {
            await parentBtn2.scrollIntoViewIfNeeded();
            await parentBtn2.click(); await wait(300);
          }
        }
        if (await childBtn.isVisible().catch(() => false)) {
          await childBtn.scrollIntoViewIfNeeded();
          await childBtn.click(); await wait(400);
          results.visited.push(`${p1} > ${c1}`);
        } else if (await childBtn2.isVisible().catch(() => false)) {
          await childBtn2.scrollIntoViewIfNeeded();
          await childBtn2.click(); await wait(400);
          results.visited.push(`${p2} > ${c2}`);
        }
      }
    }
  }

  // Try opening first table row for detail pages
  const tables = page.locator('table tbody tr');
  const tableCount = await tables.count();
  if (tableCount > 0) {
    await tables.first().click(); await wait(500);
    results.visited.push('first table row detail');
  }

  await browser.close();
  return results;
}

const res = await run();
const uniqueErrors = [...new Set(res.errors)];
const uniqueHttp = [...new Set(res.httpFailures)];
console.log(JSON.stringify({
  visited: res.visited.length,
  pages: res.visited,
  errors: uniqueErrors.length,
  errorDetails: uniqueErrors.slice(0, 20),
  httpFailures: uniqueHttp.length,
  httpDetails: uniqueHttp.slice(0, 20),
  warnings: res.warnings.length
}, null, 2));
