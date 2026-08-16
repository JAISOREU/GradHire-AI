import { api } from '../client';
import type { PaginatedResponse } from '../../types';

export const adminApi = {
  dashboard: () => api<{ users: number; students: number; employers: number; activeJobs: number; applicationsToday: number; notificationsUnread: number }>('/api/v1/admin/dashboard'),

  users: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; email: string; role: string; createdAt: string }>>(`/api/v1/admin/users?page=${page}&limit=${limit}`),

  jobs: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; title: string; company: string; status: string; createdAt: string }>>(`/api/v1/admin/jobs?page=${page}&limit=${limit}`),

  applications: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; student: { email: string }; job: { title: string; company: string }; status: string; createdAt: string }>>(`/api/v1/admin/applications?page=${page}&limit=${limit}`),

  companies: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; name: string; industry?: string; location?: string }>>(`/api/v1/admin/companies?page=${page}&limit=${limit}`),

  auditLogs: () => api<{ id: string; action: string; user: { email: string }; createdAt: string }[]>('/api/v1/admin/audit-logs'),

  notifications: () => api<{ id: string; message: string; recipient: { email: string }; read: boolean; createdAt: string }[]>('/api/v1/admin/notifications'),
};
