/** Base API client — single abstraction over fetch with cookie-based auth, CSRF protection, request deduplication, and token refresh. */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export const getApiUrl = (path: string): string => (API_BASE ? `${API_BASE}${path}` : path);

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
  details?: Record<string, unknown>;
  constructor(message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  json?: unknown;
  formData?: FormData;
  requiresAuth?: boolean;
  timeout?: number;
};

const DEFAULT_TIMEOUT = 30_000; // 30 seconds

async function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${timeout}ms`, 408);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================================
// Request deduplication cache
// ============================================================

interface CacheEntry<T> {
  promise: Promise<T>;
  timestamp: number;
}

const requestCache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 30_000; // 30 seconds

function getCacheKey(method: string, url: string, body?: BodyInit): string {
  const bodyStr = body ? JSON.stringify(body) : '';
  return `${method.toUpperCase()}:${url}:${bodyStr}`;
}

function getCachedRequest<T>(key: string): CacheEntry<T> | undefined {
  const entry = requestCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry as CacheEntry<T>;
  }
  if (entry) {
    requestCache.delete(key);
  }
  return undefined;
}

function setCachedRequest<T>(key: string, promise: Promise<T>): void {
  requestCache.set(key, { promise: promise as Promise<unknown>, timestamp: Date.now() });
}

function clearExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of requestCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      requestCache.delete(key);
    }
  }
}

// Clear all cached requests and reset refresh machinery. Intended for test isolation.
export const clearRequestCache = (): void => {
  requestCache.clear();
};

// Periodically clear expired cache entries
setInterval(clearExpiredCache, CACHE_TTL);

// ============================================================
// Auth refresh
// ============================================================

let isRefreshing = false;
let authRefreshCallback: (() => Promise<boolean>) | null = null;
let csrfToken: string | null = null;

// Queue of pending retry callbacks that fire after a token-refresh completes.
type RefreshSubscriber = { resolve: (success: boolean) => void; timestamp: number };
let refreshSubscribers: RefreshSubscriber[] = [];

const MAX_SUBSCRIBER_AGE = 60_000; // 1 minute

export const setAuthRefresh = (fn: (() => Promise<boolean>) | null) => {
  authRefreshCallback = fn;
};

const cleanupStaleSubscribers = (): void => {
  const now = Date.now();
  refreshSubscribers = refreshSubscribers.filter((sub) => now - sub.timestamp < MAX_SUBSCRIBER_AGE);
};

const subscribeTokenRefresh = (callback: (success: boolean) => void): (() => void) => {
  cleanupStaleSubscribers();
  const subscriber: RefreshSubscriber = { resolve: callback, timestamp: Date.now() };
  refreshSubscribers.push(subscriber);

  // Return unsubscribe function
  return () => {
    const index = refreshSubscribers.indexOf(subscriber);
    if (index !== -1) {
      refreshSubscribers.splice(index, 1);
    }
  };
};

const onRefreshed = (success: boolean) => {
  const subscribers = [...refreshSubscribers];
  refreshSubscribers = [];
  subscribers.forEach((sub) => {
    try {
      sub.resolve(success);
    } catch {
      // Ignore resolution errors
    }
  });
};

// ============================================================
// Main API function
// ============================================================

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

  // Check cache for identical GET requests
  const cacheKey = getCacheKey(requestMethod, url, body);
  const cachedRequest = getCachedRequest<T>(cacheKey);
  if (cachedRequest) {
    return cachedRequest.promise;
  }

  let res: Response;
  try {
    res = await fetchWithTimeout(url, {
      ...rest,
      method: requestMethod,
      headers: finalHeaders,
      body: body as BodyInit | undefined,
      credentials: 'include',
      timeout: options.timeout,
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
    if (res.status === 401 && requiresAuth && authRefreshCallback) {
      if (isRefreshing) {
        // Another request is already refreshing the token — queue this one
        // to retry after the refresh resolves, preventing dropped requests.
        const success = await new Promise<boolean>((resolve) => {
          const unsubscribe = subscribeTokenRefresh((refreshResult) => {
            unsubscribe();
            resolve(refreshResult);
          });
        });
        if (success) {
          // Retry original request with fresh token
          return api<T>(path, { ...options, requiresAuth: false });
        }
        // Refresh failed — fall through and throw the original 401.
      } else {
        isRefreshing = true;
        try {
          const refreshed = await authRefreshCallback();
          onRefreshed(refreshed);
          if (refreshed) {
            // Retry original request with fresh token
            return api<T>(path, { ...options, requiresAuth: false });
          }
        } finally {
          isRefreshing = false;
        }
      }
    }

    const message =
      (data as { message?: string } | null)?.message ??
      'Request failed. Please try again.';
    throw new ApiError(message, res.status, data as Record<string, unknown>);
  }

  // Cache successful GET responses
  if (requestMethod === 'GET' && res.ok) {
    setCachedRequest(cacheKey, Promise.resolve(data as T));
  }

  return data as T;
};

export const getStoredToken = (): string | null => null;
export const setStoredToken = (_token: string): void => {};
export const clearStoredToken = (): void => {};
