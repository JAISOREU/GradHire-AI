import { api } from '../client';
import type { Application, StudentProfile, StudentSettings } from '../../types';

export const studentsApi = {
  getProfile: () => api<StudentProfile>('/api/v1/students/me'),
  updateProfile: (payload: { name: string; focus: string }) =>
    api<StudentProfile>('/api/v1/students/me', { method: 'PUT', json: payload }),
  listApplications: (page = 1, limit = 20): Promise<Application[]> =>
    api<{ items: Application[] }>(`/api/v1/applications/me?page=${page}&limit=${limit}`).then((r) => r.items ?? []),
  apply: (jobId: string) => api<Application>('/api/v1/applications', { method: 'POST', json: { jobId } }),
  withdraw: (applicationId: string) =>
    api<void>(`/api/v1/applications/${applicationId}/withdraw`, { method: 'POST' }),
  getSettings: () => api<StudentSettings>('/api/v1/settings/me'),
  updateSettings: (payload: Partial<StudentSettings>) =>
    api<StudentSettings>('/api/v1/settings/me', { method: 'PUT', json: payload }),
};
