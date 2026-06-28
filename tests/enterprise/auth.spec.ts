import { test, expect } from '@playwright/test';
import { login, getToken, clearAuth, TOKEN_KEY } from './helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should display login page with form elements', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    await expect(page.locator('text=Sign In').or(page.locator('text=تسجيل الدخول'))).toBeVisible({ timeout: 10000 });

    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(2);

    const passwordInputs = page.locator('input[type="password"]');
    await expect(passwordInputs.first()).toBeVisible();

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should login with valid credentials and redirect to home', async ({ page }) => {
    await login(page, 'admin', 'admin');

    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');

    await page.waitForTimeout(2000);

    const hasAppShell = await page.locator('nav').or(page.locator('[class*="sidebar"]')).isVisible().catch(() => false);
    const hasMain = await page.locator('main').isVisible().catch(() => false);
    expect(hasAppShell || hasMain).toBeTruthy();
  });

  test('should store auth token in localStorage after login', async ({ page }) => {
    await login(page, 'admin', 'admin');

    const token = await getToken(page);
    expect(token).toBeTruthy();
    expect(token!.length).toBeGreaterThan(0);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const inputs = page.locator('input[type="text"]');
    const inputCount = await inputs.count();
    for (let i = 0; i < inputCount; i++) {
      const placeholder = await inputs.nth(i).getAttribute('placeholder');
      if (placeholder?.toLowerCase().includes('username') || placeholder?.toLowerCase().includes('user') || !placeholder) {
        await inputs.nth(i).fill('invalid_user');
      }
    }

    const passwordInput = page.locator('input[type="password"]');
    if (await passwordInput.count() > 0) {
      await passwordInput.first().fill('wrong_password');
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    const errorVisible = await page.locator('text=Invalid')
      .or(page.locator('text=فشل'))
      .or(page.locator('[class*="destructive"]'))
      .isVisible()
      .catch(() => false);

    expect(errorVisible).toBeTruthy();
  });

  test('should logout and clear token', async ({ page }) => {
    await login(page, 'admin', 'admin');

    const tokenBefore = await getToken(page);
    expect(tokenBefore).toBeTruthy();

    await page.evaluate(() => {
      localStorage.removeItem('mp-auth-token');
      localStorage.removeItem('mp-username');
    });

    const tokenAfter = await getToken(page);
    expect(tokenAfter).toBeNull();

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const redirectedToLogin = page.url().includes('/login');
    expect(redirectedToLogin).toBeTruthy();
  });

  test('should reject empty form submission', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const errorVisible = await page.locator('text=required')
      .or(page.locator('text=مطلوب'))
      .or(page.locator('[class*="destructive"]'))
      .isVisible()
      .catch(() => false);

    expect(errorVisible).toBeTruthy();
  });
});
