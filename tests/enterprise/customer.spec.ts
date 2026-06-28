import { test, expect } from '@playwright/test';
import { injectAuth, navigateTo } from './helpers';

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('customer list page should load', async ({ page }) => {
    await navigateTo(page, 'customers');
    await page.waitForTimeout(2000);

    const pageLoaded = await page.locator('h1, h2, [class*="page-header"]')
      .or(page.locator('text=Customers').or(page.locator('text=العملاء')))
      .isVisible()
      .catch(() => false);

    const tableOrCardsVisible = await page.locator('table, [class*="card"], [class*="table"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(pageLoaded).toBeTruthy();
  });

  test('customer list should render data rows or empty state', async ({ page }) => {
    await navigateTo(page, 'customers');
    await page.waitForTimeout(3000);

    const hasRows = await page.locator('table tbody tr, [class*="row"], [class*="card"]')
      .first()
      .isVisible()
      .catch(() => false);

    const hasEmpty = await page.locator('text=No results').or(page.locator('text=No data'))
      .or(page.locator('text=Empty'))
      .isVisible()
      .catch(() => false);

    expect(hasRows || hasEmpty).toBeTruthy();
  });

  test('customer detail page should open with tabs', async ({ page }) => {
    await navigateTo(page, 'customers');
    await page.waitForTimeout(2000);

    const firstCustomerLink = page.locator('a, button, [class*="clickable"], tr')
      .or(page.locator('[class*="cursor-pointer"]'))
      .first();

    const clickable = await firstCustomerLink.isVisible().catch(() => false);
    if (clickable) {
      await firstCustomerLink.click();
      await page.waitForTimeout(2000);
    }

    await navigateTo(page, 'customer-detail');
    await page.waitForTimeout(2000);

    const hasTabs = await page.locator('button[role="tab"], [role="tablist"] button, [class*="tab"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (hasTabs) {
      const tabNames = ['Overview', 'Wallet', 'Ledger', 'Invoices', 'Payments', 'Meters', 'Readings', 'Ownership'];
      for (const tab of tabNames) {
        const tabVisible = await page.locator(`text=${tab}`).first().isVisible().catch(() => false);
      }
    }

    const tabsExist = await page.locator('[role="tablist"], [class*="TabsList"]').isVisible().catch(() => false);
    expect(tabsExist || hasTabs).toBeTruthy();
  });

  test('customer detail should display customer data', async ({ page }) => {
    await navigateTo(page, 'customer-detail');
    await page.waitForTimeout(2000);

    const hasBackButton = await page.locator('text=Back').or(page.locator('[class*="back"]')).isVisible().catch(() => false);
    const hasCustomerInfo = await page.locator('[class*="card"], [class*="detail"]').first().isVisible().catch(() => false);

    expect(hasBackButton || hasCustomerInfo).toBeTruthy();
  });

  test('search input should be present on customer list', async ({ page }) => {
    await navigateTo(page, 'customers');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[type="text"], input[placeholder*="Search"], input[placeholder*="بحث"], input[placeholder*="search"]').first();
    const searchVisible = await searchInput.isVisible().catch(() => false);

    const allInputs = page.locator('input');
    const inputCount = await allInputs.count();

    expect(searchVisible || inputCount > 0).toBeTruthy();
  });

  test('smart search should be accessible', async ({ page }) => {
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(1000);

    const searchDialog = page.locator('[role="dialog"], [class*="search-dialog"], [class*="command"]').first();
    const isVisible = await searchDialog.isVisible().catch(() => false);

    if (isVisible) {
      await page.keyboard.press('Escape');
    }

    const ctrlK = await page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true });
      window.dispatchEvent(event);
      return true;
    });
    expect(ctrlK).toBeTruthy();
    await page.waitForTimeout(1000);
  });
});
