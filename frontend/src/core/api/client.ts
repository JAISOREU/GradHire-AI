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
  bypassCache?: boolean;
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
  const { json, formData, requiresAuth = true, headers, method, bypassCache = false, ...rest } = options;

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

  // Fail fast while the API is known to be offline — no network round trip, no
  // repeated console noise on every page load.
  if (Date.now() < offlineUntil) {
    throw new ApiError('Network error: Gradture servers are unreachable. Please check your connection and try again.', 0);
  }

  // Check cache for identical GET requests
  const cacheKey = getCacheKey(requestMethod, url, body);
  const cachedRequest = bypassCache ? undefined : getCachedRequest<T>(cacheKey);
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
    offlineUntil = 0;
  } catch (networkError) {
    offlineUntil = Date.now() + API_OFFLINE_COOLDOWN_MS;
    notifyStatus();
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

// ============================================================
// API availability gate — fail fast while the backend is offline
// ============================================================

const API_OFFLINE_COOLDOWN_MS = 15_000;
let offlineUntil = 0;
let probeInFlight: Promise<boolean> | null = null;
type ApiStatusListener = (offline: boolean) => void;
const statusListeners = new Set<ApiStatusListener>();

const notifyStatus = (): void => {
  const offline = Date.now() < offlineUntil;
  statusListeners.forEach((listener) => {
    try {
      listener(offline);
    } catch {
      // Ignore listener errors
    }
  });
};

const probeApi = (): Promise<boolean> => {
  if (probeInFlight) return probeInFlight;
  probeInFlight = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    try {
      await fetch(`${API_BASE}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });
      offlineUntil = 0;
      return true;
    } catch {
      offlineUntil = Date.now() + API_OFFLINE_COOLDOWN_MS;
      return false;
    } finally {
      clearTimeout(timer);
    }
  })().finally(() => {
    probeInFlight = null;
    notifyStatus();
  });
  return probeInFlight;
};

/** Whether the API is currently known to be unreachable (short-circuits fast). */
export const isApiOffline = (): boolean => Date.now() < offlineUntil;

/** Subscribe to availability changes. Returns an unsubscribe function. */
export const onApiStatusChange = (listener: ApiStatusListener): (() => void) => {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
};

/** Kick off a deduplicated availability probe. Used on app boot. */
export const probeApiStatus = (): Promise<boolean> => probeApi();
