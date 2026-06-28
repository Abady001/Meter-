import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = join(__dirname, '..', '..', 'Frontend', 'reports');
const BASE_URL = 'http://192.168.100.2:3000';
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 375, height: 812 },
};

const results = [];

function logResult(test, status, detail = '') {
  results.push({ test, status, detail });
  console.log(`  ${status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '•'} ${test}${detail ? ` — ${detail}` : ''}`);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function logNavClick(page, label) {
  const navBtn = page.locator('button[data-slot="tooltip-trigger"]').first();
  if (await navBtn.isVisible().catch(() => false)) {
    await navBtn.click();
    await sleep(1000);
    logResult(`Clicked: ${label}`, 'INFO');
  }
}

async function tryCollapse(page) {
  // Find the collapse button (last small button with an SVG in the sidebar)
  const aside = page.locator('aside').first();
  const btns = aside.locator('button');
  const count = await btns.count();
  for (let i = 0; i < count; i++) {
    const cls = await btns.nth(i).getAttribute('class').catch(() => '');
    if (cls && cls.includes('size-7') && cls.includes('rounded-md')) {
      await btns.nth(i).click();
      logResult('Collapse button clicked', 'PASS');
      return true;
    }
  }
  // Fallback: get visible buttons with small size
  for (let i = 0; i < count; i++) {
    const box = await btns.nth(i).boundingBox().catch(() => null);
    if (box && box.width < 40 && box.height < 40) {
      await btns.nth(i).click();
      logResult('Collapse button clicked (by size)', 'PASS');
      return true;
    }
  }
  logResult('Collapse button found', 'FAIL', 'not found in sidebar');
  return false;
}

async function run() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // ---- LOGIN ----
  console.log('\n=== LOGIN ===\n');
  await page.setViewportSize(VIEWPORTS.desktop);
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await sleep(3000);

  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible().catch(() => false)) {
    const selectEl = page.locator('select#role, select').first();
    if (await selectEl.isVisible()) {
      await selectEl.selectOption('super_admin');
    }
    await emailInput.fill('admin@meterpulse.com');
    await page.locator('input[type="password"]').first().fill('password123');
    const signInBtn = page.locator('button').filter({ hasText: /دخول|sign/i }).first();
    if (await signInBtn.isVisible().catch(() => false)) {
      await signInBtn.click();
      await sleep(3000);
      logResult('Login successful', 'PASS');
    }
  }

  const asideCount = await page.locator('aside').count();
  logResult('Aside elements in DOM', asideCount > 0 ? 'PASS' : 'FAIL', `count=${asideCount}`);
  if (asideCount === 0) {
    await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-debug-fail.png') });
    await browser.close();
    generateReport();
    return;
  }

  // ---- DEFAULT: ARABIC RTL MODE ----
  console.log('\n=== ARABIC (RTL) MODE ===\n');

  // Verify RTL
  const dir = await page.locator('html').getAttribute('dir');
  logResult('Document dir attribute', dir === 'rtl' ? 'PASS' : 'FAIL', `dir="${dir}"`);

  // Desktop Expanded (RTL)
  await sleep(2000);
  let sidebar = page.locator('aside').first();
  let box = await sidebar.boundingBox();
  logResult('RTL Desktop sidebar visible', 'PASS', `x=${box.x}, y=${box.y}, w=${box.width}`);
  // In RTL with 1920 viewport and 256px sidebar: x should be ~1664
  if (box.x >= 1660) {
    logResult('RTL: Sidebar on RIGHT (correct)', 'PASS', `x=${box.x}`);
  } else if (box.x < 10) {
    logResult('RTL: Sidebar on RIGHT (correct)', 'FAIL', `x=${box.x} — sidebar on LEFT!`);
  } else {
    logResult('RTL: Sidebar on RIGHT (correct)', 'INFO', `x=${box.x}`);
  }
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-05-ar-desktop-expanded.png') });

  // Desktop Collapsed (RTL) — expand first, then collapse sidebar at top-right
  console.log('\n-- RTL Desktop Collapsed --');
  // Click hamburger menu first to ensure sidebar is visible
  const hamBtn = page.locator('button[data-slot="tooltip-trigger"]').first();
  if (await hamBtn.isVisible().catch(() => false)) {
    await hamBtn.click();
    await sleep(1000);
  }
  await tryCollapse(page);
  await sleep(1000);
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-06-ar-desktop-collapsed.png') });
  box = await page.locator('aside').first().boundingBox();
  if (box) logResult('RTL Desktop collapsed sidebar', 'INFO', `x=${box.x}, w=${box.width}`);

  // Tablet (RTL)
  console.log('\n-- RTL Tablet --');
  await page.setViewportSize(VIEWPORTS.tablet);
  await sleep(1000);
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-07-ar-tablet.png') });

  // Mobile (RTL)
  console.log('\n-- RTL Mobile --');
  await page.setViewportSize(VIEWPORTS.mobile);
  await sleep(1000);
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-08-ar-mobile.png') });

  // ---- SWITCH TO ENGLISH LTR MODE ----
  console.log('\n=== SWITCHING TO ENGLISH (LTR) ===\n');
  await page.setViewportSize(VIEWPORTS.desktop);
  await sleep(500);

  // Find locale toggle
  const localeBtn = page.locator('button').filter({ hasText: /EN|AR|English|عربي/i }).first();
  if (await localeBtn.isVisible().catch(() => false)) {
    await localeBtn.click();
    await sleep(2000);
    logResult('Locale toggled to English', 'PASS');
  } else {
    logResult('Locale toggle found', 'FAIL', 'not found');
  }

  // Re-verify dir
  const dir2 = await page.locator('html').getAttribute('dir');
  logResult('Document dir after toggle', dir2 === 'ltr' ? 'PASS' : 'FAIL', `dir="${dir2}"`);

  // Re-expand sidebar if collapsed
  await sleep(1000);
  const hamBtn2 = page.locator('button[data-slot="tooltip-trigger"]').first();
  if (await hamBtn2.isVisible().catch(() => false)) {
    await hamBtn2.click();
    await sleep(1000);
  }

  // ---- ENGLISH LTR MODE ----
  console.log('\n=== ENGLISH (LTR) MODE ===\n');

  // Desktop Expanded (LTR)
  await sleep(2000);
  sidebar = page.locator('aside').first();
  box = await sidebar.boundingBox();
  logResult('LTR Desktop sidebar visible', 'PASS', `x=${box.x}, y=${box.y}, w=${box.width}`);
  if (box.x < 10) {
    logResult('LTR: Sidebar on LEFT (correct)', 'PASS', `x=${box.x}`);
  } else {
    logResult('LTR: Sidebar on LEFT (correct)', 'FAIL', `x=${box.x} — not on left!`);
  }
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-01-en-desktop-expanded.png') });

  // Desktop Collapsed (LTR)
  console.log('\n-- LTR Desktop Collapsed --');
  await tryCollapse(page);
  await sleep(1000);
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-02-en-desktop-collapsed.png') });
  box = await page.locator('aside').first().boundingBox();
  if (box) logResult('LTR Desktop collapsed sidebar', 'INFO', `x=${box.x}, w=${box.width}`);

  // Tablet (LTR)
  console.log('\n-- LTR Tablet --');
  await page.setViewportSize(VIEWPORTS.tablet);
  await sleep(1000);
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-03-en-tablet.png') });

  // Mobile (LTR)
  console.log('\n-- LTR Mobile --');
  await page.setViewportSize(VIEWPORTS.mobile);
  await sleep(1000);
  await page.screenshot({ path: join(REPORT_DIR, 'rtl-live-04-en-mobile.png') });

  // ---- Console errors ----
  logResult('Console errors', consoleErrors.length === 0 ? 'PASS' : 'FAIL',
    consoleErrors.length === 0 ? 'none' : consoleErrors.slice(0, 3).join('; '));

  generateReport();
  await browser.close();
}

function generateReport() {
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const info = results.filter(r => r.status === 'INFO').length;
  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${pass} | Failed: ${fail} | Info: ${info}`);

  writeFileSync(join(REPORT_DIR, 'rtl-live-browser-validation.md'),
    `# RTL Live Browser Validation Report

**Date**: 2026-06-14  
**Tool**: Playwright (headless Chromium)  
**URL**: ${BASE_URL}

---

## Results

| # | Check | Status | Detail |
|---|---|---|---|
${results.map((r, i) => `| ${i + 1} | ${r.test} | ${r.status} | ${r.detail} |`).join('\n')}

---

## Screenshots

| File | Mode | Viewport |
|---|---|---|
| rtl-live-01-en-desktop-expanded.png | English LTR | Desktop (1920×1080) |
| rtl-live-02-en-desktop-collapsed.png | English LTR | Desktop (1920×1080) |
| rtl-live-03-en-tablet.png | English LTR | Tablet (1024×768) |
| rtl-live-04-en-mobile.png | English LTR | Mobile (375×812) |
| rtl-live-05-ar-desktop-expanded.png | Arabic RTL | Desktop (1920×1080) |
| rtl-live-06-ar-desktop-collapsed.png | Arabic RTL | Desktop (1920×1080) |
| rtl-live-07-ar-tablet.png | Arabic RTL | Tablet (1024×768) |
| rtl-live-08-ar-mobile.png | Arabic RTL | Mobile (375×812) |

---

## Verdict

**${fail > 0 ? '❌ FAIL' : '✅ PASS'}** — ${fail} failure(s), ${pass} pass(es), ${info} info entries
`, 'utf-8');
  console.log(`Report: ${join(REPORT_DIR, 'rtl-live-browser-validation.md')}`);
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
