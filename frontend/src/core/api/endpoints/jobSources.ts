import { api } from '../client';
import type { PaginatedResponse, JobSourceType, JobSourceStatus, IngestionJobStatus } from '../../types';
export type { JobSourceType };

export type JobSourceParserType = 'GENERIC' | 'GREENHOUSE' | 'LEVER' | 'ASHBY' | 'SMARTRECRUITERS' | 'ADZUNA' | 'USAJOBS';
export type JobSourceAuthType = 'NONE' | 'API_KEY' | 'OAUTH' | 'BASIC';
export type JobSourceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'FAILING' | 'DISABLED' | 'NEVER_TESTED';

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
  parserType?: JobSourceParserType;
  authenticationType?: JobSourceAuthType;
  lastError?: string;
  healthStatus?: JobSourceHealthStatus;
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

export type JobSourceHealth = {
  sourceId: string;
  status: JobSourceStatus;
  enabled: boolean;
  healthStatus: JobSourceHealthStatus;
  parserType?: JobSourceParserType;
  authenticationType?: JobSourceAuthType;
  lastRunAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  lastError?: string;
  recentRuns: number;
  successRate: number;
  timeSinceLastRun?: number | null;
  nextRunAt?: string | null;
};

export type TestSourceResult = {
  success: boolean;
  message: string;
  discovered: number;
  error?: string;
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
    api<TestSourceResult>(`/api/v1/admin/job-sources/${id}/test`, { method: 'POST' }),

  sync: (id: string) =>
    api<{ message: string; sourceId: string }>(`/api/v1/admin/job-sources/${id}/sync`, { method: 'POST' }),

  syncAll: () =>
    api<{ message: string }>('/api/v1/admin/job-sources/sync-all', { method: 'POST' }),

  getRuns: (id: string) =>
    api<JobSourceRun[]>(`/api/v1/admin/job-sources/${id}/runs`),

  getHealth: (id: string) =>
    api<JobSourceHealth>(`/api/v1/admin/job-sources/${id}/health`),
};
