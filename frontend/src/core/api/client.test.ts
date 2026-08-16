import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, getStoredToken, setStoredToken, clearStoredToken, ApiError } from './client';

describe('api client', () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = 'XSRF-TOKEN=test-csrf-token; path=/';
    vi.resetAllMocks();
  });

  it('returns parsed JSON on success', async () => {
    const mockData = { id: '1', title: 'Test' };
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await api<{ id: string; title: string }>('/test');
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith('/test', expect.objectContaining({ 
      method: 'GET',
      credentials: 'include',
    }));
  });

  it('defaults to POST when body is present', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    await api('/test', { json: { name: 'Test' } });
    expect(fetch).toHaveBeenCalledWith('/test', expect.objectContaining({ 
      method: 'POST',
      credentials: 'include',
    }));
  });

  it('includes CSRF token on state-changing requests', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as Response);

    await api('/test', { method: 'POST', json: {} });
    expect(fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'test-csrf-token' }),
    }));
  });

  it('does not send Authorization header (cookie-based auth)', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    } as Response);

    await api('/test');
    expect(fetch).toHaveBeenCalledWith('/test', expect.objectContaining({
      headers: expect.not.objectContaining({ Authorization: expect.anything() }),
    }));
  });

  it('throws ApiError on non-ok response', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Bad request' }),
    } as Response);

    await expect(api('/test')).rejects.toThrow(ApiError);
    await expect(api('/test')).rejects.toMatchObject({ status: 400, message: 'Bad request' });
  });

  it('falls back to generic message when response has no message', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve(null),
    } as Response);

    await expect(api('/test')).rejects.toMatchObject({ status: 500, message: 'Request failed. Please try again.' });
  });

  it('handles 204 No Content', async () => {
    global.fetch = vi.fn<unknown[], Promise<Response>>().mockResolvedValue({
      ok: true,
      status: 204,
    } as Response);

    const result = await api('/test', { method: 'DELETE' });
    expect(result).toBeNull();
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