import { Page, expect } from '@playwright/test';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

export const TOKEN_KEY = 'mp-auth-token';

export async function login(page: Page, username = 'admin', password = 'admin') {
  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });

  await page.waitForSelector('input[type="text"]', { timeout: 10000 });
  const inputs = page.locator('input');
  const inputCount = await inputs.count();
  for (let i = 0; i < inputCount; i++) {
    const placeholder = await inputs.nth(i).getAttribute('placeholder');
    const type = await inputs.nth(i).getAttribute('type');
    if (placeholder?.toLowerCase().includes('username') || placeholder?.toLowerCase().includes('user')) {
      await inputs.nth(i).fill(username);
    } else if (type === 'text' && !placeholder?.toLowerCase().includes('username') && !placeholder?.toLowerCase().includes('user')) {
      await inputs.nth(i).fill(username);
    }
  }

  const passwordInputs = page.locator('input[type="password"]');
  const passwordCount = await passwordInputs.count();
  for (let i = 0; i < passwordCount; i++) {
    await passwordInputs.nth(i).fill(password);
  }

  await page.click('button[type="submit"]');

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

export async function loginWithApi(page: Page, username = 'admin', role = 'super_admin') {
  const res = await page.request.post(`${API_URL}/auth/dev-login`, {
    data: { userId: username, role, name: username },
  });
  const data = await res.json();
  if (data.accessToken) {
    await page.evaluate((token) => {
      localStorage.setItem('mp-auth-token', token);
      localStorage.setItem('mp-username', 'admin');
    }, data.accessToken);
  }
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
}

export async function waitForPage(page: Page, urlContains: string, timeout = 10000) {
  await page.waitForURL((url) => url.pathname.includes(urlContains) || url.href.includes(urlContains), { timeout });
}

export async function getToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem('mp-auth-token'));
}

export async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('mp-auth-token');
    localStorage.removeItem('mp-username');
    localStorage.removeItem('mp-refresh-token');
  });
}

export async function injectAuth(page: Page) {
  await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('mp-auth-token', 'e2e-test-token');
    localStorage.setItem('mp-username', 'admin');
  });
  await page.goto(FRONTEND_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
}

export async function navigateTo(page: Page, pageKey: string) {
  await page.evaluate((key) => {
    if ((window as any).__navigate) {
      (window as any).__navigate(key);
    }
  }, pageKey);
  await page.waitForTimeout(1500);
}

export async function collectConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  return errors;
}
