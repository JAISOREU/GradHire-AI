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

  forgotPassword: (email: string) =>
    api<{ message: string }>('/api/v1/auth/forgot-password', { method: 'POST', json: { email }, requiresAuth: false }),

  resetPassword: (token: string, password: string) =>
    api<{ message: string }>('/api/v1/auth/reset-password', { method: 'POST', json: { token, password }, requiresAuth: false }),

  verifyEmail: (token: string) =>
    api<{ message: string }>(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`, { requiresAuth: false }),

  oauthInitiate: (provider: 'google' | 'github' | 'linkedin') =>
    api<{ url: string }>(`/api/v1/auth/oauth/${provider}`, { method: 'GET', requiresAuth: false, bypassCache: true }),
};
