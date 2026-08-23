import { api } from '../client';
import type { Job } from '../../types';

export const companiesApi = {
  list: (page = 1, limit = 20) =>
    api<{ items: Array<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string }> }>(
      `/api/v1/companies?page=${page}&limit=${limit}`,
      { requiresAuth: false },
    ).then((r) => r.items ?? []),
  getById: (id: string) => api<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string; jobs: Job[] }>(`/api/v1/companies/${id}`, { requiresAuth: false }),
  searchEmployers: (q: string) =>
    api<{ items: Array<{ id: string; name: string; industry?: string; location?: string }> }>(`/api/v1/companies/search/employers?q=${encodeURIComponent(q)}`),
  follow: (companyId: string) => api<{ followed: boolean; companyId: string }>(`/api/v1/companies/${companyId}/follow`, { method: 'POST' }),
  unfollow: (companyId: string) => api<{ followed: boolean; companyId: string }>(`/api/v1/companies/${companyId}/follow`, { method: 'DELETE' }),
  myFollowing: (page = 1, limit = 20) =>
    api<{ items: Array<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string }> }>(
      `/api/v1/companies/me/following?page=${page}&limit=${limit}`,
    ).then((r) => r.items ?? []),
};
