import { api } from '../client';
import type { Application, ApplicationStatus, PaginatedResponse } from '../../types';

export const applicationsApi = {
  submit: (payload: { jobId: string; coverLetter?: string; resumeVersionId?: string; answers?: Array<{ questionId?: string; value: string }> }) =>
    api<Application>('/api/v1/applications', { method: 'POST', json: payload }),

  getMyApplications: (page = 1, limit = 20): Promise<PaginatedResponse<Application>> =>
    api<PaginatedResponse<Application>>(`/api/v1/applications/me?page=${page}&limit=${limit}`).then((r) => r ?? { items: [], total: 0, page, limit }),

  getById: (id: string): Promise<Application> =>
    api<Application>(`/api/v1/applications/${id}`),

  withdraw: (id: string) =>
    api<void>(`/api/v1/applications/${id}/withdraw`, { method: 'POST' }),

  getForJob: (jobId: string, page = 1, limit = 20): Promise<PaginatedResponse<Application>> =>
    api<PaginatedResponse<Application>>(`/api/v1/applications/job/${jobId}?page=${page}&limit=${limit}`).then((r) => r ?? { items: [], total: 0, page, limit }),

  updateStatus: (id: string, status: ApplicationStatus, message?: string) =>
    api<Application>(`/api/v1/applications/${id}/status`, { method: 'PUT', json: { status, message } }),
};
