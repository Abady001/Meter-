import type { ApiError } from './errors';
import { parseApiError } from './errors';
import { getAuthHeaders } from './auth';

export interface ErrorEnvelope {
  code: string;
  message: string;
  details?: unknown;
  correlationId: string;
}

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

let cachedCsrfToken: string | null = null;

export async function getCsrfToken(): Promise<string | null> {
  if (cachedCsrfToken) return cachedCsrfToken;

  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)csrf-token=([^;]*)/);
    if (match) {
      cachedCsrfToken = match[1];
      return cachedCsrfToken;
    }
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/csrf-token`);
    if (response.ok) {
      const data = await response.json();
      cachedCsrfToken = data.token ?? data.csrfToken ?? null;
    }
  } catch {
    // API not available — CSRF is best-effort
  }

  return cachedCsrfToken;
}

function generateCorrelationId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

type ApiClient = <T = unknown>(endpoint: string, options?: ApiRequestOptions) => Promise<T>;

function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await parseApiError(response);
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  return response.text() as unknown as T;
}

export function createApiClient(customHeaders?: () => Record<string, string>): ApiClient {
  return async <T = unknown>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    const correlationId = generateCorrelationId();

    // Send area/project context from localStorage
    const areaHeader: Record<string, string> = {};
    if (typeof window !== 'undefined') {
      const area = localStorage.getItem('selected-area');
      const project = localStorage.getItem('selected-project');
      if (area && area !== '__all_areas__') areaHeader['x-area-id'] = area;
      if (project && project !== '__all_projects__') areaHeader['x-project-id'] = project;
    }

    const method = options.method ?? 'GET';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-correlation-id': correlationId,
      ...areaHeader,
      ...customHeaders?.(),
      ...(await getAuthHeaders()),
      ...options.headers,
    };

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = await getCsrfToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }

    const url = buildUrl(endpoint, options.params);

    const fetchOptions: RequestInit = {
      method: options.method ?? 'GET',
      headers,
      signal: options.signal,
    };

    if (options.body !== undefined && !(options.body instanceof FormData)) {
      fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
    } else if (options.body instanceof FormData) {
      delete headers['Content-Type'];
      fetchOptions.body = options.body;
    }

    const response = await fetch(url, fetchOptions);
    return handleResponse<T>(response);
  };
}

export const api: ApiClient = createApiClient();

export const apiGet = <T>(endpoint: string, options?: ApiRequestOptions) =>
  api<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
  api<T>(endpoint, { ...options, method: 'POST', body: body as BodyInit });

export const apiPut = <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
  api<T>(endpoint, { ...options, method: 'PUT', body: body as BodyInit });

export const apiPatch = <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
  api<T>(endpoint, { ...options, method: 'PATCH', body: body as BodyInit });

export const apiDelete = <T>(endpoint: string, options?: ApiRequestOptions) =>
  api<T>(endpoint, { ...options, method: 'DELETE' });
