import { api } from '../client';
import type { Message, PaginatedResponse } from '../../types';

export const messagesApi = {
  listMine: (page = 1, limit = 20) =>
    api<PaginatedResponse<Message>>(`/api/v1/messages/me?page=${page}&limit=${limit}`),

  send: (to: string, body: string) =>
    api<{ id: string }>('/api/v1/messages', { method: 'POST', json: { to, body } }),

  markRead: (id: string) =>
    api<void>(`/api/v1/messages/${id}/read`, { method: 'PUT' }),
};
