import { api, getApiUrl } from '../client';
import type { Resume, ResumeParseResult } from '../../types';

export const resumesApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api<ResumeParseResult>('/api/v1/resumes', {
      method: 'POST',
      formData,
    });
  },
  replace: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api<ResumeParseResult>(`/api/v1/resumes/${id}`, {
      method: 'PUT',
      formData,
    });
  },
  listMine: (page = 1, limit = 20) =>
    api<{ items: Resume[] }>(`/api/v1/resumes/me?page=${page}&limit=${limit}`).then((r) => r.items ?? []),
  getById: (id: string) => api<Resume>(`/api/v1/resumes/${id}`),
  download: (id: string) => getApiUrl(`/api/v1/resumes/${id}/download`),
  view: (id: string) => getApiUrl(`/api/v1/resumes/${id}/view`),
  delete: (id: string) => api<void>(`/api/v1/resumes/${id}`, { method: 'DELETE' }),
};
