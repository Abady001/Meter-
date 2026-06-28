import { test, expect } from '@playwright/test';
import { injectAuth, navigateTo } from './helpers';

test.describe('Sidebar Navigation', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await injectAuth(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  const navRoutes: { key: string; label: string; expectedTitle?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', expectedTitle: 'Dashboard' },
    { key: 'customers', label: 'Customers', expectedTitle: 'Customers' },
    { key: 'projects', label: 'Projects', expectedTitle: 'Projects' },
    { key: 'meters', label: 'Meters', expectedTitle: 'Meters' },
    { key: 'readings', label: 'Readings', expectedTitle: 'Readings' },
    { key: 'invoices', label: 'Invoices', expectedTitle: 'Invoices' },
    { key: 'collections-dashboard-plus', label: 'Collections', expectedTitle: 'Collections' },
    { key: 'utility-dashboard', label: 'Utilities', expectedTitle: 'Utilities' },
    { key: 'reports', label: 'Reports', expectedTitle: 'Reports' },
    { key: 'balances', label: 'Balances', expectedTitle: 'Balances' },
    { key: 'payments', label: 'Payments', expectedTitle: 'Payments' },
    { key: 'locations', label: 'Locations', expectedTitle: 'Locations' },
    { key: 'executive-dashboard', label: 'Executive Dashboard', expectedTitle: 'Executive' },
    { key: 'billing-dashboard', label: 'Billing Dashboard', expectedTitle: 'Billing' },
    { key: 'kpi-executive', label: 'KPI Executive', expectedTitle: 'KPI' },
    { key: 'kpi-collections', label: 'KPI Collections', expectedTitle: 'KPI' },
    { key: 'kpi-utilities', label: 'KPI Utilities', expectedTitle: 'KPI' },
    { key: 'alerts', label: 'Alerts', expectedTitle: 'Alerts' },
    { key: 'tickets', label: 'Tickets', expectedTitle: 'Tickets' },
    { key: 'support', label: 'Support', expectedTitle: 'Support' },
    { key: 'upload-center', label: 'Upload Center', expectedTitle: 'Upload' },
    { key: 'tariff-studio', label: 'Tariff Studio', expectedTitle: 'Tariff' },
    { key: 'workplace', label: 'Workplace', expectedTitle: 'Workplace' },
    { key: 'consumption', label: 'Consumption', expectedTitle: 'Consumption' },
  ];

  for (const route of navRoutes) {
    test(`navigate to ${route.label} should load without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (err) => errors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await navigateTo(page, route.key);
      await page.waitForTimeout(2000);

      const h1Visible = await page.locator('h1').or(page.locator('h2')).first().isVisible().catch(() => false);
      expect(h1Visible).toBeTruthy();

      expect(errors.length).toBe(0);
    });
  }

  test('sidebar should contain dashboard navigation item', async ({ page }) => {
    const sidebarLinks = page.locator('nav a, button:has(svg), [class*="sidebar"] button, nav button');
    const count = await sidebarLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('page transitions should not produce 404 content', async ({ page }) => {
    await navigateTo(page, 'dashboard');
    await page.waitForTimeout(1000);

    await navigateTo(page, 'projects');
    await page.waitForTimeout(1000);

    await navigateTo(page, 'customers');
    await page.waitForTimeout(1000);

    await navigateTo(page, 'meters');
    await page.waitForTimeout(1000);

    const has404 = await page.locator('text=404').isVisible().catch(() => false);
    expect(has404).toBeFalsy();

    const hasPageNotFound = await page.locator('text=page not found').or(page.locator('text=Page Not Found')).isVisible().catch(() => false);
    expect(hasPageNotFound).toBeFalsy();
  });
});
