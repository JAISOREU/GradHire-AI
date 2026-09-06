import { api } from '../client';
import type { Notification } from '../../types';

export const notificationsApi = {
  listMine: (page = 1, limit = 20) =>
    api<{ items: Notification[] }>(`/api/v1/notifications/me?page=${page}&limit=${limit}`).then((r) => r.items ?? []),
  markRead: (id: string) =>
    api<{ id: string; read: boolean }>(`/api/v1/notifications/${id}/read`, { method: 'PUT' }),
};
