import { api } from '../client';
import type { Application, EmployerJob, EmployerProfile, EmployerSettings, Interview } from '../../types';

export const employersApi = {
  getProfile: () => api<EmployerProfile>('/api/v1/employer/profile'),
  updateProfile: (payload: { companyName?: string; name?: string; industry?: string; location?: string; description?: string; website?: string; phone?: string }) =>
    api<EmployerProfile>('/api/v1/employer/profile', { method: 'PUT', json: payload }),
  listJobs: (page = 1, limit = 20): Promise<EmployerJob[]> =>
    api<{ items: EmployerJob[] }>(`/api/v1/employer/jobs?page=${page}&limit=${limit}`).then((r) => r.items ?? []),
  listApplicants: (jobId?: string, page = 1, limit = 20): Promise<Application[]> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (jobId) params.set('jobId', jobId);
    return api<{ items: Application[] }>(`/api/v1/applications/employer/all?${params.toString()}`).then((r) => r.items ?? []);
  },

  listInterviews: async (page = 1, limit = 20): Promise<Interview[]> => {
    try {
      const data = await api<{ items: Interview[] }>(`/api/v1/employer/interviews?page=${page}&limit=${limit}`);
      return data.items ?? [];
    } catch {
      return [];
    }
  },

  getSettings: () => api<EmployerSettings>('/api/v1/settings/me'),
  updateSettings: (payload: Partial<EmployerSettings>) =>
    api<EmployerSettings>('/api/v1/settings/me', { method: 'PUT', json: payload }),
};

export const analyticsApi = {
  getSnapshot: async (): Promise<{ activeJobs: number; applicationsToday: number; views: number; pendingInterviews: number; hiringFunnel: number[] }> => {
    try {
      return await api('/api/v1/employer/analytics');
    } catch {
      return { activeJobs: 0, applicationsToday: 0, views: 0, pendingInterviews: 0, hiringFunnel: [0, 0, 0, 0, 0] };
    }
  },
};

export const messagesApi = {
  listMine: async <T>(page = 1, limit = 20): Promise<T[]> => {
    try {
      const data = await api<{ items: T[] }>(`/api/v1/messages/me?page=${page}&limit=${limit}`);
      return data.items ?? [];
    } catch {
      return [];
    }
  },
  send: (to: string, body: string) =>
    api<{ id: string }>('/api/v1/messages', { method: 'POST', json: { to, body } }),
  markRead: (id: string) =>
    api<void>(`/api/v1/messages/${id}/read`, { method: 'PUT' }),
};

export const savedJobsApi = {
  listMine: async <T>(page = 1, limit = 20): Promise<T[]> => {
    try {
      const data = await api<{ items: T[] }>(`/api/v1/saved-jobs/me?page=${page}&limit=${limit}`);
      return data.items ?? [];
    } catch {
      return [];
    }
  },
  save: (jobId: string) => api<{ id: string }>('/api/v1/saved-jobs', { method: 'POST', json: { jobId } }),
  unsave: (jobId: string) => api<void>(`/api/v1/saved-jobs/${jobId}`, { method: 'DELETE' }),
  check: (jobId: string) => api<{ saved: boolean }>(`/api/v1/saved-jobs/check/${jobId}`),
};
