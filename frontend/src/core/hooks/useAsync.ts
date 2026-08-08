import { useCallback, useEffect, useState } from 'react';

type AsyncResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
};

/** Generic data-fetching hook with loading/error state and a manual reload. */
export const useAsync = <T>(fetcher: () => Promise<T>, deps: unknown[] = []): AsyncResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, reload };
};
