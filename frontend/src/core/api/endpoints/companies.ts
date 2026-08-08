import { api } from '../client';
import type { Job } from '../../types';

export const companiesApi = {
  list: (page = 1, limit = 20) =>
    api<{ items: Array<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string }> }>(
      `/api/v1/companies?page=${page}&limit=${limit}`,
      { requiresAuth: false },
    ).then((r) => r.items ?? []),
  getById: (id: string) => api<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string; jobs: Job[] }>(`/api/v1/companies/${id}`, { requiresAuth: false }),
};
