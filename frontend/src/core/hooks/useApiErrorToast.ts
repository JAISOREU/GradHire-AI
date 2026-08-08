import { useCallback } from 'react';
import { useToast } from '../toast/ToastContext';
import { ApiError } from '../api/client';

export const useApiErrorToast = () => {
  const { addToast } = useToast();

  return useCallback((error: unknown) => {
    const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Something went wrong';
    addToast('error', message);
  }, [addToast]);
};
