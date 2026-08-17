/** Base API client — single abstraction over fetch with cookie-based auth and CSRF protection. */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  json?: unknown;
  formData?: FormData;
  requiresAuth?: boolean;
};

let isRefreshing = false;
let authRefreshCallback: (() => Promise<boolean>) | null = null;
let csrfToken: string | null = null;

export const setAuthRefresh = (fn: (() => Promise<boolean>) | null) => {
  authRefreshCallback = fn;
};

export const api = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { json, formData, requiresAuth = true, headers, method, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const body = json !== undefined ? JSON.stringify(json) : formData;
  const requestMethod = method ?? (body !== undefined ? 'POST' : 'GET');

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(requestMethod.toUpperCase())) {
    const token = csrfToken || getCookie('XSRF-TOKEN');
    if (token) {
      finalHeaders['X-XSRF-TOKEN'] = token;
    }
  }
  const url = API_BASE ? `${API_BASE}${path}` : path;

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      method: requestMethod,
      headers: finalHeaders,
      body: body as BodyInit | undefined,
      credentials: 'include',
    });
  } catch (networkError) {
    const reason = networkError instanceof Error ? networkError.message : String(networkError);
    throw new ApiError(`Network error: ${reason}. Please check your connection and try again.`, 0);
  }

  const csrfHeader = res.headers.get('X-CSRF-TOKEN');
  if (csrfHeader) {
    csrfToken = csrfHeader;
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && requiresAuth && authRefreshCallback && !isRefreshing) {
      isRefreshing = true;
      try {
        const refreshed = await authRefreshCallback();
        if (refreshed) {
          return api<T>(path, { ...options, requiresAuth: false });
        }
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      (data as { message?: string } | null)?.message ??
      'Request failed. Please try again.';
    throw new ApiError(message, res.status);
  }

  return data as T;
};

export const getStoredToken = (): string | null => null;
export const setStoredToken = (_token: string): void => {};
export const clearStoredToken = (): void => {};
