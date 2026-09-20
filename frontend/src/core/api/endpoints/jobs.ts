import { api } from '../client';
import type { AiRecommendation, EmployerJob, ExperienceLevel, Job, JobType, PaginatedResponse, WorkplaceType } from '../../types';

const parsePaginatedJobs = async <T>(url: string): Promise<PaginatedResponse<T>> => {
  const data = await api<PaginatedResponse<T>>(url, { requiresAuth: false });
  return data ?? { items: [], total: 0, page: 1, limit: 20 };
};

export const jobsApi = {
  list: async (type: JobType | '' = '', page = 1, limit = 20): Promise<Job[]> => {
    const query = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) query.set('type', type);
    const data = await parsePaginatedJobs<Job>(`/api/v1/jobs?${query.toString()}`);
    return data.items ?? [];
  },

  listPaginated: async (filters?: {
    type?: JobType | '';
    experienceLevel?: ExperienceLevel | '';
    workplaceType?: WorkplaceType | '';
    country?: string;
    city?: string;
    salaryMin?: number;
    salaryMax?: number;
    freshGraduateFriendly?: boolean;
    internship?: boolean;
    search?: string;
    sort?: string;
    skills?: string[];
    datePosted?: '24h' | '7d' | '30d';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Job>> => {
    const query = new URLSearchParams();
    if (filters?.type) query.set('type', filters.type);
    if (filters?.experienceLevel) query.set('experienceLevel', filters.experienceLevel);
    if (filters?.workplaceType) query.set('workplaceType', filters.workplaceType);
    if (filters?.country) query.set('country', filters.country);
    if (filters?.city) query.set('city', filters.city);
    if (filters?.salaryMin !== undefined) query.set('salaryMin', String(filters.salaryMin));
    if (filters?.salaryMax !== undefined) query.set('salaryMax', String(filters.salaryMax));
    if (filters?.freshGraduateFriendly !== undefined) query.set('freshGraduateFriendly', String(filters.freshGraduateFriendly));
    if (filters?.internship !== undefined) query.set('internship', String(filters.internship));
    if (filters?.search) query.set('search', filters.search);
    if (filters?.sort) query.set('sort', filters.sort);
    filters?.skills?.forEach((skill) => {
      if (skill) query.append('skills', skill);
    });
    if (filters?.datePosted) query.set('datePosted', filters.datePosted);
    query.set('page', String(filters?.page ?? 1));
    query.set('limit', String(filters?.limit ?? 20));
    return parsePaginatedJobs<Job>(`/api/v1/jobs?${query.toString()}`);
  },

  listSkillOptions: async (): Promise<string[]> => {
    const data = await api<{ skills?: string[] }>('/api/v1/jobs/skills', { requiresAuth: false });
    return data?.skills ?? [];
  },

  getMarketSnapshot: async (): Promise<{ byType: { type: string; count: number }[] }> => {
    const data = await api<{ byType?: { type: string; count: number }[] }>('/api/v1/jobs/market-snapshot', { requiresAuth: false });
    return { byType: data?.byType ?? [] };
  },

  listForEmployer: (page = 1, limit = 20): Promise<EmployerJob[]> =>
    api<{ items: EmployerJob[] }>(`/api/v1/employer/jobs?page=${page}&limit=${limit}`).then((r) => r.items ?? []),

  listForEmployerPaginated: (page = 1, limit = 20): Promise<PaginatedResponse<EmployerJob>> =>
    parsePaginatedJobs<EmployerJob>(`/api/v1/employer/jobs?page=${page}&limit=${limit}`),

  getById: (id: string): Promise<Job> =>
    api<Job>(`/api/v1/jobs/${id}`, { requiresAuth: false }),

  create: (payload: Partial<Job>) =>
    api<EmployerJob>('/api/v1/employer/jobs', { method: 'POST', json: payload }),

  update: (id: string, payload: Partial<Job>) =>
    api<EmployerJob>(`/api/v1/employer/jobs/${id}`, { method: 'PUT', json: payload }),

  archive: (id: string) =>
    api<EmployerJob>(`/api/v1/employer/jobs/${id}`, { method: 'DELETE' }),

  save: (jobId: string) =>
    api<{ id: string }>('/api/v1/saved-jobs', { method: 'POST', json: { jobId } }),

  unsave: (jobId: string) =>
    api<void>(`/api/v1/saved-jobs/${jobId}`, { method: 'DELETE' }),
};

export const recommendationsApi = {
  ai: async (topK = 5): Promise<{ ready: boolean; missing: string[]; recommendations: AiRecommendation[]; fallback: boolean }> =>
    api<{ ready: boolean; missing: string[]; recommendations: AiRecommendation[]; fallback: boolean }>(`/api/v1/recommendations/ai?top_k=${topK}`).then(
      (r) => ({
        ready: r.ready ?? false,
        missing: r.missing ?? [],
        recommendations: r.recommendations ?? [],
        fallback: r.fallback ?? false,
      }),
    ),
};
