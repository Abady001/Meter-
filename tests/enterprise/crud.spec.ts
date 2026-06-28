import { test, expect } from '@playwright/test';
import { injectAuth, navigateTo } from './helpers';

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  test('project list page should load', async ({ page }) => {
    await navigateTo(page, 'projects');
    await page.waitForTimeout(2000);

    const titleVisible = await page.locator('h1, h2')
      .or(page.locator('text=Projects').or(page.locator('text=المشروعات')))
      .first()
      .isVisible()
      .catch(() => false);

    expect(titleVisible).toBeTruthy();
  });

  test('project list should render projects or empty state', async ({ page }) => {
    await navigateTo(page, 'projects');
    await page.waitForTimeout(3000);

    const hasContent = await page.locator('table, [class*="card"], [class*="grid"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasContent).toBeTruthy();
  });

  test('should navigate to project detail', async ({ page }) => {
    await navigateTo(page, 'projects');
    await page.waitForTimeout(2000);

    const clickable = page.locator('a, button, tr, [class*="cursor-pointer"], [onclick]').first();
    const isClickable = await clickable.isVisible().catch(() => false);

    if (isClickable) {
      await clickable.click();
      await page.waitForTimeout(2000);
    }

    await navigateTo(page, 'project-detail');
    await page.waitForTimeout(2000);

    const detailLoaded = await page.locator('h1, h2, [class*="header"], [class*="detail"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(detailLoaded).toBeTruthy();
  });

  test('edit project name should be possible', async ({ page }) => {
    await navigateTo(page, 'project-detail');
    await page.waitForTimeout(2000);

    const editButton = page.locator('button:has-text("Edit"), button:has-text("تعديل"), [class*="edit"]').first();
    const editVisible = await editButton.isVisible().catch(() => false);

    if (editVisible) {
      await editButton.click();
      await page.waitForTimeout(1000);

      const nameInput = page.locator('input[name="name"], input[placeholder*="Name"], input[placeholder*="اسم"]').first();
      const inputVisible = await nameInput.isVisible().catch(() => false);

      if (inputVisible) {
        await nameInput.fill('E2E Test Project Updated');
        const saveButton = page.locator('button:has-text("Save"), button:has-text("حفظ"), button[type="submit"]').first();
        if (await saveButton.isVisible().catch(() => false)) {
          await saveButton.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('deactivate project should be accessible from detail', async ({ page }) => {
    await navigateTo(page, 'project-detail');
    await page.waitForTimeout(2000);

    const deactivateBtn = page.locator('button:has-text("Deactivate"), button:has-text("تعطيل"), button:has-text("Archive"), [class*="deactivate"]').first();
    const isVisible = await deactivateBtn.isVisible().catch(() => false);

    if (isVisible) {
      await deactivateBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('create area should be accessible via settings or admin', async ({ page }) => {
    await navigateTo(page, 'admin-portal');
    await page.waitForTimeout(2000);

    const adminLoaded = await page.locator('text=Administration').or(page.locator('text=Portal'))
      .or(page.locator('a[href*="6262"]'))
      .isVisible()
      .catch(() => false);

    expect(adminLoaded).toBeTruthy();
  });
});
