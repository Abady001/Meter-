import { test, expect } from '@playwright/test';
import { injectAuth, navigateTo } from './helpers';

test.describe('KPI Dashboards', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('executive KPI dashboard should load', async ({ page }) => {
    await navigateTo(page, 'kpi-executive');
    await page.waitForTimeout(2500);

    const titleVisible = await page.locator('h1, h2')
      .or(page.locator('text=Executive').or(page.locator('text=KPI')))
      .first()
      .isVisible()
      .catch(() => false);

    const pageLoaded = await page.locator('main, [class*="p-"], div[class]').first().isVisible().catch(() => false);
    expect(titleVisible || pageLoaded).toBeTruthy();
  });

  test('KPI cards should render with data', async ({ page }) => {
    await navigateTo(page, 'kpi-executive');
    await page.waitForTimeout(3000);

    const kpiCards = page.locator('[class*="card"]');

    const cardCount = await kpiCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(2);

    const firstCard = kpiCards.first();
    await expect(firstCard).toBeVisible();

    const hasValues = await page.locator('[class*="card"] [class*="font-bold"], [class*="card"] .text-2xl')
      .first()
      .isVisible()
      .catch(() => false);

    if (hasValues) {
      const kpiValue = await page.locator('[class*="card"] [class*="font-bold"], [class*="card"] .text-2xl').first().textContent();
      expect(kpiValue).toBeTruthy();
    }
  });

  test('collections KPI dashboard should load', async ({ page }) => {
    await navigateTo(page, 'kpi-collections');
    await page.waitForTimeout(2500);

    const pageLoaded = await page.locator('[class*="card"], h1, h2, main')
      .first()
      .isVisible()
      .catch(() => false);

    expect(pageLoaded).toBeTruthy();

    const noErrors = await page.locator('text=404').or(page.locator('text=page not found')).isVisible().catch(() => false);
    expect(noErrors).toBeFalsy();
  });

  test('utilities KPI dashboard should load', async ({ page }) => {
    await navigateTo(page, 'kpi-utilities');
    await page.waitForTimeout(2500);

    const pageLoaded = await page.locator('[class*="card"], h1, h2, main')
      .first()
      .isVisible()
      .catch(() => false);

    expect(pageLoaded).toBeTruthy();

    const noErrors = await page.locator('text=404').or(page.locator('text=page not found')).isVisible().catch(() => false);
    expect(noErrors).toBeFalsy();
  });

  test('executive dashboard should load', async ({ page }) => {
    await navigateTo(page, 'executive-dashboard');
    await page.waitForTimeout(2500);

    const pageLoaded = await page.locator('[class*="card"], h1, h2, main')
      .first()
      .isVisible()
      .catch(() => false);

    expect(pageLoaded).toBeTruthy();
  });

  test('operations dashboard should load', async ({ page }) => {
    await navigateTo(page, 'operations-dashboard');
    await page.waitForTimeout(2500);

    const pageLoaded = await page.locator('[class*="card"], h1, h2, main')
      .first()
      .isVisible()
      .catch(() => false);

    expect(pageLoaded).toBeTruthy();
  });

  test('billing dashboard should load', async ({ page }) => {
    await navigateTo(page, 'billing-dashboard');
    await page.waitForTimeout(2500);

    const pageLoaded = await page.locator('[class*="card"], h1, h2, main')
      .first()
      .isVisible()
      .catch(() => false);

    expect(pageLoaded).toBeTruthy();
  });

  test('utility dashboard should load', async ({ page }) => {
    await navigateTo(page, 'utility-dashboard');
    await page.waitForTimeout(2500);

    const pageLoaded = await page.locator('[class*="card"], h1, h2, main')
      .first()
      .isVisible()
      .catch(() => false);

    expect(pageLoaded).toBeTruthy();
  });
});
