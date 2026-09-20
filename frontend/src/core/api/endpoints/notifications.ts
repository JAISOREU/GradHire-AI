import { api } from '../client';
import type { Notification, PaginatedResponse } from '../../types';

export const notificationsApi = {
  listMine: (page = 1, limit = 20, opts: { type?: string; includeRead?: boolean } = {}) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (opts.type) params.set('type', opts.type);
    if (opts.includeRead) params.set('includeRead', 'true');
    return api<PaginatedResponse<Notification>>(`/api/v1/notifications/me?${params.toString()}`, { bypassCache: true });
  },
  markRead: (id: string) =>
    api<{ id: string; read: boolean }>(`/api/v1/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () =>
    api<{ updated: number }>('/api/v1/notifications/me/read', { method: 'PUT' }),
};