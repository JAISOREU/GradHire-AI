import { api } from '../client';
import type { AiRecommendation, EmployerJob, Job, JobType } from '../../types';

export const jobsApi = {
  list: async (type?: JobType | '', page = 1, limit = 20): Promise<Job[]> => {
    const query = new URLSearchParams();
    if (type) query.set('type', type);
    query.set('page', String(page));
    query.set('limit', String(limit));
    const data = await api<{ items: Job[] }>(`/api/v1/jobs?${query.toString()}`, { requiresAuth: false });
    return data.items ?? [];
  },

  listForEmployer: (page = 1, limit = 20): Promise<EmployerJob[]> =>
    api<{ items: EmployerJob[] }>(`/api/v1/jobs?page=${page}&limit=${limit}`).then((r) => r.items ?? []),

  getById: (id: string): Promise<Job> =>
    api<Job>(`/api/v1/jobs/${id}`, { requiresAuth: false }),

  create: (payload: { title: string; company: string; location: string; type: string; description?: string }) =>
    api<EmployerJob>('/api/v1/employer/jobs', { method: 'POST', json: payload }),

  update: (id: string, payload: Partial<{ title: string; company: string; location: string; type: string; description?: string }>) =>
    api<EmployerJob>(`/api/v1/employer/jobs/${id}`, { method: 'PUT', json: payload }),

  archive: (id: string) =>
    api<EmployerJob>(`/api/v1/employer/jobs/${id}`, { method: 'DELETE' }),
};

export const recommendationsApi = {
  ai: async (topK = 5): Promise<AiRecommendation[]> =>
    api<{ recommendations: AiRecommendation[] }>(`/api/v1/recommendations/ai?top_k=${topK}`).then(
      (r) => r.recommendations ?? [],
    ),
};
