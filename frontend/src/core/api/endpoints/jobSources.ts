import { api } from '../client';
import type { PaginatedResponse } from '../../types';

export type JobSourceType = 'API' | 'RSS' | 'JSON' | 'HTML';
export type JobSourceStatus = 'ACTIVE' | 'PAUSED' | 'ERROR' | 'RATE_LIMITED';
export type IngestionJobStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'PARTIAL' | 'FAILED';
export type ImportedJobStatus = 'IMPORTED' | 'PENDING_REVIEW' | 'PUBLISHED' | 'REJECTED' | 'EXPIRED' | 'ARCHIVED';

export type JobSource = {
  id: string;
  name: string;
  company: string;
  sourceType: JobSourceType;
  baseUrl: string;
  feedUrl: string;
  enabled: boolean;
  crawlInterval: number;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  status: JobSourceStatus;
  fieldMapping?: Record<string, string>;
  rateLimit?: number;
  attribution?: string;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type JobSourceRun = {
  id: string;
  sourceId: string;
  status: IngestionJobStatus;
  startedAt?: string;
  finishedAt?: string;
  discovered: number;
  imported: number;
  updated: number;
  duplicates: number;
  rejected: number;
  errors?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export const jobSourcesApi = {
  list: (page = 1, limit = 20) =>
    api<PaginatedResponse<JobSource>>(`/api/v1/admin/job-sources?page=${page}&limit=${limit}`),

  getById: (id: string) => api<JobSource>(`/api/v1/admin/job-sources/${id}`),

  create: (payload: Partial<JobSource>) =>
    api<JobSource>('/api/v1/admin/job-sources', { method: 'POST', json: payload }),

  update: (id: string, payload: Partial<JobSource>) =>
    api<JobSource>(`/api/v1/admin/job-sources/${id}`, { method: 'PUT', json: payload }),

  remove: (id: string) =>
    api<void>(`/api/v1/admin/job-sources/${id}`, { method: 'DELETE' }),

  test: (id: string) =>
    api<{ message: string; sourceId: string; name: string; status: string }>(`/api/v1/admin/job-sources/${id}/test`, { method: 'POST' }),

  sync: (id: string) =>
    api<{ message: string; sourceId: string }>(`/api/v1/admin/job-sources/${id}/sync`, { method: 'POST' }),

  syncAll: () =>
    api<{ message: string }>('/api/v1/admin/job-sources/sync-all', { method: 'POST' }),

  getRuns: (id: string) =>
    api<JobSourceRun[]>(`/api/v1/admin/job-sources/${id}/runs`),

  getHealth: (id: string) =>
    api<{ sourceId: string; status: string; enabled: boolean; lastRunAt?: string; lastSuccessAt?: string; lastFailureAt?: string; failureCount: number; recentRuns: number; successRate: number }>(`/api/v1/admin/job-sources/${id}/health`),
};
