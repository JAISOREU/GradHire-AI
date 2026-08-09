import { api } from '../client';
import type { Interview, InterviewStatus, InterviewType, PaginatedResponse } from '../../types';

export const interviewsApi = {
  schedule: (payload: {
    applicationId: string;
    type: InterviewType;
    scheduledAt: string;
    durationMinutes?: number;
    timezone?: string;
    location?: string;
    meetingLink?: string;
    interviewers?: string[];
    notes?: string;
  }) =>
    api<Interview>('/api/v1/interviews', { method: 'POST', json: payload }),

  getMyInterviews: (page = 1, limit = 20): Promise<PaginatedResponse<Interview>> =>
    api<PaginatedResponse<Interview>>(`/api/v1/interviews/me?page=${page}&limit=${limit}`).then((r) => r ?? { items: [], total: 0, page, limit }),

  getJobInterviews: (jobId: string, page = 1, limit = 20): Promise<PaginatedResponse<Interview>> =>
    api<PaginatedResponse<Interview>>(`/api/v1/interviews/job/${jobId}?page=${page}&limit=${limit}`).then((r) => r ?? { items: [], total: 0, page, limit }),

  updateStatus: (id: string, status: InterviewStatus, feedback?: string) =>
    api<Interview>(`/api/v1/interviews/${id}`, { method: 'PUT', json: { status, feedback } }),

  cancel: (id: string) =>
    api<void>(`/api/v1/interviews/${id}/cancel`, { method: 'POST' }),
};
