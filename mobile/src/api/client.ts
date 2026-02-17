/**
 * API client: adds JWT, merchant context, 401 handling.
 */
import { getStoredToken } from '../auth/storage';

import { BASE_URL } from '../config';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface ApiOptions {
  method?: string;
  body?: unknown;
  merchantId?: string;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (options.merchantId) {
    headers['X-Merchant-Id'] = options.merchantId;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || res.statusText);
  }

  return res.json() as Promise<T>;
}
