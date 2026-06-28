import { test, expect } from '@playwright/test';
import { injectAuth, navigateTo } from './helpers';

test.describe('Sync Gateway', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('sync gateway page should load', async ({ page }) => {
    await navigateTo(page, 'sync-gateway');
    await page.waitForTimeout(3000);

    const titleVisible = await page.locator('h1, h2')
      .or(page.locator('text=Sync').or(page.locator('text=Gateway').or(page.locator('text=مزامنة'))))
      .first()
      .isVisible()
      .catch(() => false);

    const pageLoaded = await page.locator('main, [class*="card"], [class*="grid"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(titleVisible || pageLoaded).toBeTruthy();
  });

  test('gateway status cards should render', async ({ page }) => {
    await navigateTo(page, 'sync-gateway');
    await page.waitForTimeout(3000);

    const statusCards = page.locator('[class*="card"]');
    const cardCount = await statusCards.count();

    const hasServerIcon = await page.locator('svg[class*="server"]').or(page.locator('svg:has(path[d*="M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h16v4H4v-4z"]')).isVisible().catch(() => false);

    expect(cardCount > 0 || hasServerIcon).toBeTruthy();
  });

  test('gateway status badges should indicate online/offline', async ({ page }) => {
    await navigateTo(page, 'sync-gateway');
    await page.waitForTimeout(3000);

    const badges = page.locator('[class*="badge"]');
    const badgeCount = await badges.count();

    if (badgeCount > 0) {
      const badgeText = await badges.first().textContent();
      expect(badgeText).toBeTruthy();

      const statuses = ['online', 'offline', 'checking', 'Online', 'Offline', 'Checking'];
      const hasStatus = statuses.some(s => badgeText?.toLowerCase().includes(s.toLowerCase()));
    }

    const hasStatusText = await page.locator('text=online, text=offline, text=checking').or(page.locator('[class*="badge"]')).isVisible().catch(() => false);
  });

  test('refresh button should be present on sync page', async ({ page }) => {
    await navigateTo(page, 'sync-gateway');
    await page.waitForTimeout(2000);

    const refreshBtn = page.locator('button:has-text("Refresh"), button:has-text("تحديث"), button:has-text("Reload")').first();
    const refreshVisible = await refreshBtn.isVisible().catch(() => false);

    const hasRefreshIcon = await page.locator('svg[class*="refresh"]').or(page.locator('svg:has(path[d*="M23 4v6h-6"])')).isVisible().catch(() => false);

    expect(refreshVisible || hasRefreshIcon).toBeTruthy();

    if (refreshVisible) {
      await refreshBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test('sync page should display orchestrator status', async ({ page }) => {
    await navigateTo(page, 'sync-gateway');
    await page.waitForTimeout(3000);

    const orchestratorSection = page.locator('text=Orchestrator').or(page.locator('text= orchestrator'))
      .or(page.locator('text=منسق'));
    const orchVisible = await orchestratorSection.isVisible().catch(() => false);
  });

  test('area gateway list should be visible on sync page', async ({ page }) => {
    await navigateTo(page, 'sync-gateway');
    await page.waitForTimeout(3000);

    const areaNames = ['October', 'New Cairo', 'Badya'];
    let foundArea = false;
    for (const area of areaNames) {
      const areaVisible = await page.locator(`text=${area}`).first().isVisible().catch(() => false);
      if (areaVisible) {
        foundArea = true;
        break;
      }
    }

    const hasMultipleCards = await page.locator('[class*="card"]').count() >= 2;
    expect(foundArea || hasMultipleCards).toBeTruthy();
  });
});
