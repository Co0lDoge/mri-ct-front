import type { AuthState } from '../slices/authSlice';

const getViteApiBaseUrl = (): string | undefined => {
  try {
    const env = (import.meta as { env?: Record<string, string | undefined> }).env;
    const url = env?.VITE_API_BASE_URL;
    return typeof url === 'string' && url.length > 0 ? url : undefined;
  } catch {
    return undefined;
  }
};

export const getApiBaseUrl = (): string => {
  const viteUrl = getViteApiBaseUrl();
  if (viteUrl) return viteUrl;

  if (typeof process !== 'undefined' && process.env) {
    if (typeof window === 'undefined') {
      return process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  }

  return '';
};

const joinBase = (base: string, path: string): string => {
  const b = base.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
};

export class ApiFormRequestError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`HTTP ${status}`);
    this.name = 'ApiFormRequestError';
    this.status = status;
    this.data = data;
  }
}

/**
 * POST multipart/form-data одним fetch (без двойного Request в RTK Query).
 */
export async function apiFormRequest<T>(
  path: string,
  formData: FormData,
  getState: () => unknown
): Promise<T> {
  const state = getState() as { auth: AuthState };
  const token = state?.auth?.accessToken;
  const headers = new Headers();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(joinBase(getApiBaseUrl(), path), {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await response.text();
  let data: unknown = null;
  if (text.length > 0) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new ApiFormRequestError(response.status, data);
  }

  return data as T;
}
