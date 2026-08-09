import { api } from '../client';
import type { PaginatedResponse, ScreeningQuestion } from '../../types';

export const screeningApi = {
  create: (jobId: string, payload: Omit<ScreeningQuestion, 'id' | 'createdAt' | 'updatedAt'>) =>
    api<ScreeningQuestion>(`/api/v1/jobs/${jobId}/screening-questions`, { method: 'POST', json: payload }),

  getForJob: (jobId: string, page = 1, limit = 20): Promise<PaginatedResponse<ScreeningQuestion>> =>
    api<PaginatedResponse<ScreeningQuestion>>(`/api/v1/jobs/${jobId}/screening-questions?page=${page}&limit=${limit}`).then((r) => r ?? { items: [], total: 0, page, limit }),

  update: (jobId: string, questionId: string, payload: Partial<ScreeningQuestion>) =>
    api<ScreeningQuestion>(`/api/v1/jobs/${jobId}/screening-questions/${questionId}`, { method: 'PUT', json: payload }),

  delete: (jobId: string, questionId: string) =>
    api<void>(`/api/v1/jobs/${jobId}/screening-questions/${questionId}`, { method: 'DELETE' }),
};
