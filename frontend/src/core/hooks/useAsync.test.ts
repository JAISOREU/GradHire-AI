import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAsync } from './useAsync';

describe('useAsync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns loading state initially', async () => {
    const slow = new Promise<string>((resolve) => setTimeout(() => resolve('ok'), 50));
    const { result } = renderHook(() => useAsync(() => slow, []));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await act(async () => {
      await slow;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('ok');
    expect(result.current.error).toBe(null);
  });

  it('returns error state on rejection', async () => {
    const fail = Promise.reject(new Error('network error'));
    const { result } = renderHook(() => useAsync(() => fail, []));

    await act(async () => {
      await fail.catch(() => {});
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('network error');
  });

  it('re-fetches when deps change', async () => {
    let callCount = 0;
    const fetchFn = vi.fn<[string], Promise<string>>().mockImplementation((id: string) => {
      callCount += 1;
      return Promise.resolve(`item-${id}`);
    });

    const { result, rerender } = renderHook(({ id }) => useAsync(() => fetchFn(id), [id]), {
      initialProps: { id: '1' },
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBe('item-1');
    expect(callCount).toBe(1);

    rerender({ id: '2' });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBe('item-2');
    expect(callCount).toBe(2);
  });

  it('reloads data on manual reload', async () => {
    let callCount = 0;
    const fetchFn = vi.fn<[], Promise<string>>().mockImplementation(() => {
      callCount += 1;
      return Promise.resolve(`item-${callCount}`);
    });

    const { result } = renderHook(() => useAsync(fetchFn, []));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBe('item-1');
    expect(callCount).toBe(1);

    await act(async () => {
      result.current.reload();
      await Promise.resolve();
    });

    expect(result.current.data).toBe('item-2');
    expect(callCount).toBe(2);
  });
});
