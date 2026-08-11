import { api } from '../client';
import type { PaginatedResponse, ScreeningQuestion } from '../../types';

export const screeningApi = {
  create: (jobId: string, payload: Omit<ScreeningQuestion, 'id' | 'createdAt' | 'updatedAt'>) =>
    api<ScreeningQuestion>(`/api/v1/screening/questions`, { method: 'POST', json: { ...payload, jobId } }),

  getForJob: (jobId: string, page = 1, limit = 20): Promise<PaginatedResponse<ScreeningQuestion>> =>
    api<PaginatedResponse<ScreeningQuestion>>(`/api/v1/screening/questions/job/${jobId}?page=${page}&limit=${limit}`).then((r) => r ?? { items: [], total: 0, page, limit }),

  update: (jobId: string, questionId: string, payload: Partial<ScreeningQuestion>) =>
    api<ScreeningQuestion>(`/api/v1/screening/questions/${questionId}`, { method: 'PUT', json: { ...payload, jobId } }),

  delete: (_jobId: string, questionId: string) =>
    api<void>(`/api/v1/screening/questions/${questionId}`, { method: 'DELETE' }),
};
