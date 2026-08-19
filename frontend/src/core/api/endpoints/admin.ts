import { api } from '../client';
import type { PaginatedResponse } from '../../types';

export const adminApi = {
  dashboard: () => api<{ users: number; students: number; employers: number; activeJobs: number; applicationsToday: number; notificationsUnread: number }>('/api/v1/admin/dashboard'),

  users: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; email: string; role: string; createdAt: string }>>(`/api/v1/admin/users?page=${page}&limit=${limit}`),

  createUser: (payload: { email: string; password: string; role: string }) =>
    api<{ id: string; email: string; role: string; createdAt: string }>('/api/v1/admin/users', { method: 'POST', json: payload }),

  updateUser: (id: string, payload: { role?: string }) =>
    api<{ id: string; email: string; role: string }>(`/api/v1/admin/users/${id}`, { method: 'PATCH', json: payload }),

  deleteUser: (id: string) =>
    api<{ deleted: boolean }>(`/api/v1/admin/users/${id}`, { method: 'DELETE' }),

  jobs: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; title: string; company: string; status: string; createdAt: string }>>(`/api/v1/admin/jobs?page=${page}&limit=${limit}`),

  updateJob: (id: string, payload: { status: string }) =>
    api<{ id: string; status: string }>(`/api/v1/admin/jobs/${id}`, { method: 'PATCH', json: payload }),

  deleteJob: (id: string) =>
    api<{ deleted: boolean }>(`/api/v1/admin/jobs/${id}`, { method: 'DELETE' }),

  applications: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; student: { email: string }; job: { title: string; company: string }; status: string; createdAt: string }>>(`/api/v1/admin/applications?page=${page}&limit=${limit}`),

  updateApplication: (id: string, payload: { status: string }) =>
    api<{ id: string; status: string }>(`/api/v1/admin/applications/${id}`, { method: 'PATCH', json: payload }),

  companies: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; name: string; industry?: string; location?: string; verified?: boolean }>>(`/api/v1/admin/companies?page=${page}&limit=${limit}`),

  updateCompany: (id: string, payload: { verified?: boolean }) =>
    api<{ id: string; verified: boolean }>(`/api/v1/admin/companies/${id}`, { method: 'PATCH', json: payload }),

  auditLogs: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; action: string; user: { email: string }; createdAt: string }>>(`/api/v1/admin/audit-logs?page=${page}&limit=${limit}`),

  notifications: (page = 1, limit = 20) =>
    api<PaginatedResponse<{ id: string; message: string; recipient: { email: string }; read: boolean; createdAt: string }>>(`/api/v1/admin/notifications?page=${page}&limit=${limit}`),

  markNotificationRead: (id: string) => api<{ id: string; read: boolean }>(`/api/v1/notifications/admin/${id}/read`, { method: 'PUT' }),

  settings: () => api<{ platformName: string; maintenanceMode: boolean; registrationOpen: boolean }>('/api/v1/admin/settings'),

  updateSettings: (payload: { platformName: string; maintenanceMode: boolean; registrationOpen: boolean }) =>
    api<{ platformName: string; maintenanceMode: boolean; registrationOpen: boolean }>('/api/v1/admin/settings', { method: 'PATCH', json: payload }),
};
