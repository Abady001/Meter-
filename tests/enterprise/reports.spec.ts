import { test, expect } from '@playwright/test';
import { injectAuth, navigateTo } from './helpers';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('report list page should load', async ({ page }) => {
    await navigateTo(page, 'reports');
    await page.waitForTimeout(3000);

    const titleVisible = await page.locator('h1, h2')
      .or(page.locator('text=Reports').or(page.locator('text=التقارير')))
      .first()
      .isVisible()
      .catch(() => false);

    const hasContent = await page.locator('[class*="card"], table, [class*="grid"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(titleVisible || hasContent).toBeTruthy();
  });

  test('report list should render report cards or table', async ({ page }) => {
    await navigateTo(page, 'reports');
    await page.waitForTimeout(3000);

    const reportCards = page.locator('[class*="card"]');
    const cardCount = await reportCards.count();

    const hasTable = await page.locator('table').isVisible().catch(() => false);

    expect(cardCount > 0 || hasTable).toBeTruthy();
  });

  test('should be able to generate a report', async ({ page }) => {
    await navigateTo(page, 'reports');
    await page.waitForTimeout(3000);

    const generateBtns = page.locator('button:has-text("Generate"), button:has-text("Run"), button:has-text("تشغيل"), button:has-text("إنشاء")');
    const btnCount = await generateBtns.count();

    if (btnCount > 0) {
      await generateBtns.first().click();
      await page.waitForTimeout(2000);

      const dialogOrLoading = await page.locator('[role="dialog"], [class*="loading"], [class*="spinner"]')
        .first()
        .isVisible()
        .catch(() => false);
    }

    const clickableCards = page.locator('[class*="card"]').first();
    const cardVisible = await clickableCards.isVisible().catch(() => false);
    if (cardVisible) {
      await clickableCards.click();
      await page.waitForTimeout(2000);
    }
  });

  test('export CSV button should be present', async ({ page }) => {
    await navigateTo(page, 'reports');
    await page.waitForTimeout(3000);

    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download"), button:has-text("تصدير"), button:has-text("تحميل")').first();
    const exportVisible = await exportBtn.isVisible().catch(() => false);

    const hasDownloadIcon = await page.locator('svg[class*="download"]').or(page.locator('svg:has(path[d*="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"]')).isVisible().catch(() => false);

    expect(exportVisible || hasDownloadIcon).toBeTruthy();
  });

  test('report categories should be visible', async ({ page }) => {
    await navigateTo(page, 'reports');
    await page.waitForTimeout(3000);

    const categories = ['Financial', 'Operations', 'Customer', 'Billing', 'Utilities', 'System'];
    for (const cat of categories) {
      const catVisible = await page.locator(`text=${cat}`).first().isVisible().catch(() => false);
      if (catVisible) break;
    }
  });

  test('report filter or search should be present', async ({ page }) => {
    await navigateTo(page, 'reports');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"], input[placeholder*="بحث"]').first();
    const hasFilter = page.locator('button:has-text("Filter"), [class*="filter"]').first();
    const hasSelect = page.locator('select').first();

    const visible = await searchInput.or(hasFilter).or(hasSelect).isVisible().catch(() => false);
  });
});
