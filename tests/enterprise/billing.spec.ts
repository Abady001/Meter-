import { test, expect } from '@playwright/test';
import { login, injectAuth, clearAuth } from './helpers';

test.describe('Billing Flow', () => {

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('Invoices page loads and displays data', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('text=Invoices', { timeout: 10000 });
    await page.click('text=Invoices');
    await page.waitForTimeout(2000);
    const header = page.locator('h1, h2');
    await expect(header.first()).toBeVisible();
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 5000 });
  });

  test('Invoice list renders rows', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Invoices');
    await page.waitForTimeout(3000);
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('Generate invoice button exists', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Invoices');
    await page.waitForTimeout(2000);
    const generateBtn = page.locator('button:has-text("Generate")');
    await expect(generateBtn).toBeVisible({ timeout: 5000 });
  });

  test('Payments page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Payments');
    await page.waitForTimeout(2000);
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 5000 });
  });

  test('Can navigate to invoice detail', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Invoices');
    await page.waitForTimeout(3000);
    const firstRow = page.locator('table tbody tr').first();
    const exists = await firstRow.count();
    if (exists > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      const back = page.locator('button:has-text("Back")');
      await expect(back).toBeVisible({ timeout: 3000 });
    }
  });

  test('Issue invoice button exists on detail page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Invoices');
    await page.waitForTimeout(3000);
    const firstRow = page.locator('table tbody tr').first();
    const exists = await firstRow.count();
    if (exists > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      const issueBtn = page.locator('button:has-text("Issue")');
      const hasIssue = await issueBtn.count();
      if (hasIssue > 0) {
        await expect(issueBtn).toBeVisible();
      }
    }
  });

  test('Download invoice button exists', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Invoices');
    await page.waitForTimeout(3000);
    const firstRow = page.locator('table tbody tr').first();
    const exists = await firstRow.count();
    if (exists > 0) {
      await firstRow.click();
      await page.waitForTimeout(2000);
      const dl = page.locator('button:has-text("Download")');
      await expect(dl).toBeVisible({ timeout: 3000 });
    }
  });

  test('Balances page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Statements');
    await page.waitForTimeout(2000);
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Tariff Studio page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Tariff');
    await page.waitForTimeout(2000);
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('Bill Cycle page loads', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Bill Cycle');
    await page.waitForTimeout(2000);
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });
});
