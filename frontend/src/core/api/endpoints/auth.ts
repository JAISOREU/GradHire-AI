import { api } from '../client';
import type { AuthResponse, AuthUser, UserRole } from '../../types';

export const authApi = {
  login: (email: string, password: string) =>
    api<AuthResponse>('/api/v1/auth/login', { json: { email, password }, requiresAuth: false }),

  register: (email: string, password: string, role: UserRole, name?: string) =>
    api<AuthResponse>('/api/v1/auth/register', {
      json: { email, password, role, name },
      requiresAuth: false,
    }),

  me: () => api<{ user: AuthUser }>('/api/v1/auth/me', { requiresAuth: true }),

  logout: () =>
    api<void>('/api/v1/auth/logout', { method: 'POST', requiresAuth: true }),

  refresh: () =>
    api<AuthResponse>('/api/v1/auth/refresh', { method: 'POST', requiresAuth: false }),
};
