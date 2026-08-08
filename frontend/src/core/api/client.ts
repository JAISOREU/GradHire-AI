/** Base API client — single abstraction over fetch with token injection and error normalization. */

const TOKEN_KEY = 'gradture_token';

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

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

export const api = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { json, formData, requiresAuth = true, headers, method, ...rest } = options;

  const finalHeaders: Record<string, string> = { ...(headers as Record<string, string>) };
  if (json !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const token = getStoredToken();
  if (requiresAuth && token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const body = json !== undefined ? JSON.stringify(json) : formData;
  const requestMethod = method ?? (body !== undefined ? 'POST' : 'GET');

  const res = await fetch(path, {
    ...rest,
    method: requestMethod,
    headers: finalHeaders,
    body: body as BodyInit | undefined,
  });

  // Attempt to parse JSON, but tolerate empty responses.
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message ??
      'Request failed. Please try again.';
    throw new ApiError(message, res.status);
  }

  return data as T;
};
