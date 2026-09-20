import { api } from '../client';
import type { EmployerJob } from '../../types';

export type DiscoverCompany = {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  logo?: string;
  size?: string;
  openPositions: number;
  followerCount: number;
  remoteAvailable: boolean;
};

export type DiscoverFilters = {
  search?: string;
  industry?: string;
  location?: string;
  size?: string;
  remote?: boolean;
  hiring?: boolean;
};

export type DiscoverResult = {
  items: DiscoverCompany[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: { industries: string[]; locations: string[] };
};

export type SkillCompanies = { skill: string; companies: number };

export const companiesApi = {
  list: (page = 1, limit = 20) =>
    api<{ items: Array<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string }> }>(
      `/api/v1/companies?page=${page}&limit=${limit}`,
      { requiresAuth: false },
    ).then((r) => r.items ?? []),
  discover: (options: DiscoverFilters & { page?: number; limit?: number } = {}) => {
    const params = new URLSearchParams();
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));
    if (options.search) params.set('search', options.search);
    if (options.industry) params.set('industry', options.industry);
    if (options.location) params.set('location', options.location);
    if (options.size) params.set('size', options.size);
    if (options.remote) params.set('remote', 'true');
    if (options.hiring) params.set('hiring', 'true');
    return api<DiscoverResult>(`/api/v1/companies?${params.toString()}`);
  },
  hiringForSkills: () => api<SkillCompanies[]>('/api/v1/companies/hiring-for-skills'),
  getById: (id: string) => api<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string; jobs: EmployerJob[] }>(`/api/v1/companies/${id}`, { requiresAuth: false }),
  searchEmployers: (q: string) =>
    api<{ items: Array<{ id: string; name: string; industry?: string; location?: string }> }>(`/api/v1/companies/search/employers?q=${encodeURIComponent(q)}`),
  follow: (companyId: string) => api<{ followed: boolean; companyId: string }>(`/api/v1/companies/${companyId}/follow`, { method: 'POST' }),
  unfollow: (companyId: string) => api<{ followed: boolean; companyId: string }>(`/api/v1/companies/${companyId}/follow`, { method: 'DELETE' }),
  myFollowing: (page = 1, limit = 20) =>
    api<{ items: Array<{ id: string; name: string; industry?: string; location?: string; description?: string; logo?: string }> }>(
      `/api/v1/companies/me/following?page=${page}&limit=${limit}`,
    ).then((r) => r.items ?? []),
};