import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, getStoredToken, setStoredToken, clearStoredToken, ApiError, setAuthRefresh, clearRequestCache } from './client';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
const FULL_TEST_URL = API_BASE ? `${API_BASE}/test` : '/test';

function mockResponse(overrides: Partial<Response> = {}): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    headers: new Headers(),
    ...overrides,
  } as unknown as Response;
}

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'XSRF-TOKEN=test-csrf-token; path=/';
    vi.resetAllMocks();
    clearRequestCache();
    setAuthRefresh(null);
  });

  it('returns parsed JSON on success', async () => {
    const mockData = { id: '1', title: 'Test' };
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      }),
    );

    const result = await api<{ id: string; title: string }>('/test');
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(FULL_TEST_URL, expect.objectContaining({
      method: 'GET',
      credentials: 'include',
    }));
  });

  it('defaults to POST when body is present', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true }),
      }),
    );

    await api('/test', { json: { name: 'Test' } });
    expect(fetch).toHaveBeenCalledWith(FULL_TEST_URL, expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }));
  });

  it('includes CSRF token on state-changing requests', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      }),
    );

    await api('/test', { method: 'POST', json: {} });
    expect(fetch).toHaveBeenCalledWith(FULL_TEST_URL, expect.objectContaining({
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'test-csrf-token' }),
    }));
  });

  it('does not send Authorization header (cookie-based auth)', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      }),
    );

    await api('/test');
    expect(fetch).toHaveBeenCalledWith(FULL_TEST_URL, expect.objectContaining({
      headers: expect.not.objectContaining({ Authorization: expect.anything() }),
    }));
  });

  it('throws ApiError on non-ok response', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Bad request' }),
      }),
    );

    await expect(api('/test')).rejects.toThrow(ApiError);
    await expect(api('/test')).rejects.toMatchObject({ status: 400, message: 'Bad request' });
  });

  it('falls back to generic message when response has no message', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 500,
        json: () => Promise.resolve(null),
      }),
    );

    await expect(api('/test')).rejects.toMatchObject({ status: 500, message: 'Request failed. Please try again.' });
  });

  it('handles 204 No Content', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: true,
        status: 204,
        json: () => Promise.resolve(null),
      }),
    );

    const result = await api('/test', { method: 'DELETE' });
    expect(result).toBeNull();
  });

  it('retries concurrent requests after a successful token refresh', async () => {
    // First fetch call for each request returns 401, the second (retry) returns 200.
    let callCount = 0;
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockImplementation(() => {
      callCount++;
      if (callCount <= 2) {
        // Both initial requests get 401
        return Promise.resolve(
          mockResponse({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ message: 'Unauthorized' }),
          }),
        );
      }
      // Retry requests succeed
      return Promise.resolve(
        mockResponse({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ success: true }),
        }),
      );
    });

    // Register a refresh callback that succeeds
    setAuthRefresh(async () => true);

    // Fire two requests concurrently — both should get 401, both should retry after refresh
    const [r1, r2] = await Promise.all([api('/test1'), api('/test2')]);
    expect(r1).toEqual({ success: true });
    expect(r2).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledTimes(4);

    setAuthRefresh(null);
  });

  it('throws original error when token refresh fails for concurrent requests', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue(
      mockResponse({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' }),
      }),
    );

    // Register a refresh callback that fails
    setAuthRefresh(async () => false);

    // Both requests should fail with 401
    const [r1, r2] = await Promise.allSettled([api('/test1'), api('/test2')]);
    expect(r1.status).toBe('rejected');
    expect(r2.status).toBe('rejected');
    expect((r1 as PromiseRejectedResult).reason).toMatchObject({ status: 401, message: 'Unauthorized' });

    setAuthRefresh(null);
  });
});

describe('token storage', () => {
  it('returns null for getStoredToken (cookie-based auth)', () => {
    expect(getStoredToken()).toBeNull();
  });

  it('setStoredToken and clearStoredToken are no-ops', () => {
    setStoredToken('abc');
    clearStoredToken();
    expect(getStoredToken()).toBeNull();
  });
});
