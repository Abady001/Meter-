import { getCsrfToken } from './client';

const TOKEN_KEY = 'mp-auth-token';
const REFRESH_TOKEN_KEY = 'mp-refresh-token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    console.warn('[API] Failed to store auth token');
  }
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    console.warn('[API] Failed to clear auth token');
  }
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    console.warn('[API] Failed to store refresh token');
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function refreshToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      },
    );

    if (!response.ok) {
      clearToken();
      return null;
    }

    const data = await response.json();
    if (data.accessToken) {
      setToken(data.accessToken);
      if (data.refreshToken) setRefreshToken(data.refreshToken);
      getCsrfToken().catch(() => {});
      return data.accessToken;
    }

    clearToken();
    return null;
  } catch {
    clearToken();
    return null;
  }
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = getToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function hasToken(): boolean {
  return getToken() !== null;
}
