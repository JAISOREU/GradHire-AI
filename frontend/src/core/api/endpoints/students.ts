import { api } from '../client';
import type { Application, StudentProfile, StudentSettings } from '../../types';

export const usersApi = {
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api<{ avatarUrl: string }>('/api/v1/users/me/avatar', { method: 'POST', formData: form });
  },
  deleteAvatar: () => api<void>('/api/v1/users/me/avatar', { method: 'DELETE' }),
  getAvatar: () => api<{ avatarUrl: string }>('/api/v1/users/me/avatar'),
  deleteAccount: (password?: string) => api<{ deleted: boolean }>('/api/v1/users/me', { method: 'DELETE', json: password ? { password } : {} }),
};

export const studentsApi = {
  getProfile: () => api<StudentProfile>('/api/v1/students/me'),
  updateProfile: (payload: Partial<StudentProfile>) =>
    api<StudentProfile>('/api/v1/students/me', { method: 'PUT', json: payload }),
  listApplications: (page = 1, limit = 20): Promise<Application[]> =>
    api<{ items: Application[] }>(`/api/v1/applications/me?page=${page}&limit=${limit}`).then((r) => r.items ?? []),
  apply: (jobId: string) => api<Application>('/api/v1/applications', { method: 'POST', json: { jobId } }),
  withdraw: (applicationId: string) =>
    api<void>(`/api/v1/applications/${applicationId}/withdraw`, { method: 'POST' }),
  getSettings: () => api<StudentSettings>('/api/v1/settings/me'),
  updateSettings: (payload: Partial<StudentSettings>) =>
    api<StudentSettings>('/api/v1/settings/me', { method: 'PUT', json: payload }),

  getEducations: () => api<any[]>('/api/v1/profile/education'),
  createEducation: (payload: Record<string, unknown>) => api<any>('/api/v1/profile/education', { method: 'POST', json: payload }),
  updateEducation: (id: string, payload: Record<string, unknown>) => api<any>(`/api/v1/profile/education/${id}`, { method: 'PUT', json: payload }),
  deleteEducation: (id: string) => api<void>(`/api/v1/profile/education/${id}`, { method: 'DELETE' }),

  getExperiences: () => api<any[]>('/api/v1/profile/experience'),
  createExperience: (payload: Record<string, unknown>) => api<any>('/api/v1/profile/experience', { method: 'POST', json: payload }),
  updateExperience: (id: string, payload: Record<string, unknown>) => api<any>(`/api/v1/profile/experience/${id}`, { method: 'PUT', json: payload }),
  deleteExperience: (id: string) => api<void>(`/api/v1/profile/experience/${id}`, { method: 'DELETE' }),

  getSkills: () => api<any[]>('/api/v1/profile/skills'),
  createSkill: (payload: Record<string, unknown>) => api<any>('/api/v1/profile/skills', { method: 'POST', json: payload }),
  deleteSkill: (id: string) => api<void>(`/api/v1/profile/skills/${id}`, { method: 'DELETE' }),

  getCertifications: () => api<any[]>('/api/v1/profile/certifications'),
  createCertification: (payload: Record<string, unknown>) => api<any>('/api/v1/profile/certifications', { method: 'POST', json: payload }),
  updateCertification: (id: string, payload: Record<string, unknown>) => api<any>(`/api/v1/profile/certifications/${id}`, { method: 'PUT', json: payload }),
  deleteCertification: (id: string) => api<void>(`/api/v1/profile/certifications/${id}`, { method: 'DELETE' }),

  getProjects: () => api<any[]>('/api/v1/profile/projects'),
  createProject: (payload: Record<string, unknown>) => api<any>('/api/v1/profile/projects', { method: 'POST', json: payload }),
  updateProject: (id: string, payload: Record<string, unknown>) => api<any>(`/api/v1/profile/projects/${id}`, { method: 'PUT', json: payload }),
  deleteProject: (id: string) => api<void>(`/api/v1/profile/projects/${id}`, { method: 'DELETE' }),

  getCareerPreferences: () => api<any>('/api/v1/profile/preferences'),
  updateCareerPreferences: (payload: Record<string, unknown>) => api<any>('/api/v1/profile/preferences', { method: 'PUT', json: payload }),

  getProfileCompleteness: () => api<any>('/api/v1/profile/completeness'),
  getAiReadiness: () => api<any>('/api/v1/profile/ai-readiness'),
};
