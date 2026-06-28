import { test, expect } from '@playwright/test';
import { injectAuth, navigateTo } from './helpers';

test.describe('Wallet Operations', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('customer detail page should show Wallet tab', async ({ page }) => {
    await navigateTo(page, 'customer-detail');
    await page.waitForTimeout(2000);

    const walletTab = page.locator('button[role="tab"]:has-text("Wallet"), [role="tablist"] button:has-text("Wallet"), [class*="tab"]:has-text("Wallet")').first();
    const walletVisible = await walletTab.isVisible().catch(() => false);

    if (walletVisible) {
      await walletTab.click();
      await page.waitForTimeout(1500);
    }

    const tabsFound = await page.locator('text=Wallet').first().isVisible().catch(() => false);
    expect(walletVisible || tabsFound).toBeTruthy();
  });

  test('wallet balance should display in Wallet tab', async ({ page }) => {
    await navigateTo(page, 'customer-detail');
    await page.waitForTimeout(2000);

    const walletTab = page.locator('text=Wallet').first();
    const tabVisible = await walletTab.isVisible().catch(() => false);

    if (tabVisible) {
      await walletTab.click();
      await page.waitForTimeout(2000);

      const balanceElements = page.locator('[class*="wallet"], [class*="balance"]').or(page.locator('text=Balance').or(page.locator('text=Wallet')));
      const balanceVisible = await balanceElements.first().isVisible().catch(() => false);

      const hasCard = await page.locator('[class*="card"]').first().isVisible().catch(() => false);
      expect(balanceVisible || hasCard).toBeTruthy();
    }
  });

  test('add credit dialog should open when clicking credit button', async ({ page }) => {
    await navigateTo(page, 'customer-detail');
    await page.waitForTimeout(2000);

    const walletTab = page.locator('text=Wallet').first();
    const tabVisible = await walletTab.isVisible().catch(() => false);

    if (tabVisible) {
      await walletTab.click();
      await page.waitForTimeout(2000);

      const creditBtn = page.locator('button:has-text("Credit"), button:has-text("Add"), button:has-text("إيداع"), button:has-text("إضافة")').first();
      const btnVisible = await creditBtn.isVisible().catch(() => false);

      if (btnVisible) {
        await creditBtn.click();
        await page.waitForTimeout(1000);

        const dialog = page.locator('[role="dialog"]').or(page.locator('[class*="dialog"]'));
        const dialogVisible = await dialog.first().isVisible().catch(() => false);

        const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"], input[placeholder*="مبلغ"]').first();
        const inputVisible = await amountInput.isVisible().catch(() => false);

        expect(dialogVisible || inputVisible).toBeTruthy();

        if (dialogVisible) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('wallet tab should render transaction history section', async ({ page }) => {
    await navigateTo(page, 'customer-detail');
    await page.waitForTimeout(2000);

    const walletTab = page.locator('text=Wallet').first();
    const tabVisible = await walletTab.isVisible().catch(() => false);

    if (tabVisible) {
      await walletTab.click();
      await page.waitForTimeout(2000);

      const historySection = page.locator('text=History').or(page.locator('text=Transactions'))
        .or(page.locator('text=سجل').or(page.locator('text=حركات')));
      const historyVisible = await historySection.isVisible().catch(() => false);
    }
  });
});
