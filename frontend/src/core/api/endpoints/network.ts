import { api } from '../client';
import type { NetworkPerson, NetworkSidebar } from '../../types';

export const networkApi = {
  suggested: (limit = 30) =>
    api<NetworkPerson[]>(`/api/v1/network/suggested?limit=${limit}`, { bypassCache: true }),

  search: (q: string) =>
    api<NetworkPerson[]>(`/api/v1/network/search?q=${encodeURIComponent(q)}`, { bypassCache: true }),

  connections: () =>
    api<NetworkPerson[]>('/api/v1/network/connections', { bypassCache: true }),

  requests: () =>
    api<NetworkPerson[]>('/api/v1/network/requests', { bypassCache: true }),

  following: () =>
    api<NetworkPerson[]>('/api/v1/network/following', { bypassCache: true }),

  sidebar: () =>
    api<NetworkSidebar>('/api/v1/network/sidebar', { bypassCache: true }),

  connect: (userId: string) =>
    api<{ connectionId: string }>(`/api/v1/network/connect/${userId}`, { method: 'POST' }),

  removeConnection: (userId: string) =>
    api<unknown>(`/api/v1/network/connect/${userId}`, { method: 'DELETE' }),

  acceptRequest: (connectionId: string) =>
    api<{ status: string }>(`/api/v1/network/requests/${connectionId}/accept`, { method: 'POST' }),

  declineRequest: (connectionId: string) =>
    api<unknown>(`/api/v1/network/requests/${connectionId}`, { method: 'DELETE' }),

  follow: (userId: string) =>
    api<unknown>(`/api/v1/network/follow/${userId}`, { method: 'POST' }),

  unfollow: (userId: string) =>
    api<unknown>(`/api/v1/network/follow/${userId}`, { method: 'DELETE' }),
};
