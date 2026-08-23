import { useCallback, useRef, useState } from 'react';
import { useToast } from '../toast/ToastContext';

export function useOptimisticList<T extends { id: string }>(initialItems: T[] = []) {
  const [items, setItems] = useState<T[]>(initialItems);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { addToast } = useToast();

  const optimisticUpdate = useCallback(
    async (updater: (current: T[]) => T[], mutate: () => Promise<unknown>, successMessage?: string) => {
      const previous = itemsRef.current;
      const next = updater(previous);
      setItems(next);
      setError(null);
      setIsPending(true);

      try {
        await mutate();
        if (successMessage) {
          addToast('success', successMessage);
        }
      } catch (err) {
        setItems(previous);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        addToast('error', error.message || 'Something went wrong. Please try again.');
        throw error;
      } finally {
        setIsPending(false);
      }
    },
    [addToast],
  );

  const optimisticRemove = useCallback(
    (id: string, mutate: () => Promise<unknown>, successMessage?: string) =>
      optimisticUpdate(
        (current) => current.filter((item) => item.id !== id),
        mutate,
        successMessage,
      ),
    [optimisticUpdate],
  );

  const optimisticUpsert = useCallback(
    (item: T, mutate: () => Promise<unknown>, successMessage?: string) =>
      optimisticUpdate(
        (current) => {
          const exists = current.some((i) => i.id === item.id);
          if (exists) return current.map((i) => (i.id === item.id ? item : i));
          return [item, ...current];
        },
        mutate,
        successMessage,
      ),
    [optimisticUpdate],
  );

  const resetError = useCallback(() => setError(null), []);

  return {
    items,
    setItems,
    isPending,
    error,
    resetError,
    optimisticUpdate,
    optimisticRemove,
    optimisticUpsert,
  };
}
