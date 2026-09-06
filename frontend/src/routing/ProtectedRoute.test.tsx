import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import type { AuthUser } from '../core/types';

vi.mock('../core/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../core/auth/AuthContext';

const mockAuth = (overrides: Partial<{
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
}> = {}) => ({
  user: overrides.user ?? null,
  status: overrides.status ?? 'unauthenticated',
  isAuthenticated: overrides.isAuthenticated ?? false,
  login: vi.fn(),
  register: vi.fn(),
  applyAuth: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn(),
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while checking session', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({ status: 'loading', isAuthenticated: false }));

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute role="STUDENT" />
      </MemoryRouter>,
    );

    expect(container.querySelector('.loading-state')).not.toBeNull();
  });

  it('redirects unauthenticated users to /login', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({ status: 'unauthenticated', isAuthenticated: false }));

    const { container } = render(
      <MemoryRouter initialEntries={['/student/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute role="STUDENT" />}>
            <Route index element={<div>Protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // Redirect replaces content — protected content should not be rendered
    expect(container.textContent).not.toContain('Protected content');
  });

  it('renders children when authenticated with correct role', () => {
    const user: AuthUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'STUDENT',
      avatarUrl: null,
    };
    vi.mocked(useAuth).mockReturnValue(mockAuth({ user, status: 'authenticated', isAuthenticated: true }));

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute role="STUDENT" />}>
            <Route index element={<div data-testid="child">Protected content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
    expect(container.textContent).toContain('Protected content');
  });

  it('redirects to role home when authenticated with wrong role', () => {
    const user: AuthUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'STUDENT',
      avatarUrl: null,
    };
    vi.mocked(useAuth).mockReturnValue(mockAuth({ user, status: 'authenticated', isAuthenticated: true }));

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute role="ADMIN" />}>
            <Route index element={<div data-testid="child">Admin content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // Student is not an admin — should redirect
    expect(container.querySelector('[data-testid="child"]')).toBeNull();
  });
});
