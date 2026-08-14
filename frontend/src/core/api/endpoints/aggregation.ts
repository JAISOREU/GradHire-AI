import { api } from '../client';
import type { PaginatedResponse } from '../../types';

export interface AggregatedJobItem {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  sourceName: string;
  sourceUrl: string;
  status: string;
  confidence: number | null;
  aggregatedAt: string;
  lastVerifiedAt: string | null;
  expiresAt: string | null;
  duplicateOfId: string | null;
}

export interface AggregationDashboard {
  sources: { total: number; active: number; disabled: number };
  jobs: {
    discoveredToday: number;
    importedToday: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    expired: number;
    duplicates: number;
  };
  recentCrawls: { sourceName: string; discovered: number; imported: number; status: string; createdAt: string }[];
}

export const aggregationApi = {
  dashboard: () => api<AggregationDashboard>('/api/v1/admin/job-aggregation/dashboard'),

  sources: (page = 1, limit = 20) =>
    api<PaginatedResponse<Record<string, unknown>>>(`/api/v1/admin/job-aggregation/sources?page=${page}&limit=${limit}`),

  createSource: (data: Record<string, unknown>) =>
    api<Record<string, unknown>>('/api/v1/admin/job-aggregation/sources', { method: 'POST', json: data }),

  updateSource: (id: string, data: Record<string, unknown>) =>
    api<Record<string, unknown>>(`/api/v1/admin/job-aggregation/sources/${id}`, { method: 'PUT', json: data }),

  triggerCrawl: (id: string) =>
    api<{ message: string }>(`/api/v1/admin/job-aggregation/sources/${id}/crawl`, { method: 'POST' }),

  jobs: (page = 1, limit = 20) =>
    api<PaginatedResponse<AggregatedJobItem>>(`/api/v1/admin/job-aggregation/jobs?page=${page}&limit=${limit}`),

  jobDetail: (id: string) => api<AggregatedJobItem & { duplicateOf?: { id: string; title: string; sourceUrl: string } }>(`/api/v1/admin/job-aggregation/jobs/${id}`),

  approveJob: (id: string) =>
    api<{ message: string }>(`/api/v1/admin/job-aggregation/jobs/${id}/approve`, { method: 'POST' }),

  rejectJob: (id: string) =>
    api<{ message: string }>(`/api/v1/admin/job-aggregation/jobs/${id}/reject`, { method: 'POST' }),

  retryJob: (id: string) =>
    api<{ message: string }>(`/api/v1/admin/job-aggregation/jobs/${id}/retry`, { method: 'POST' }),
};
