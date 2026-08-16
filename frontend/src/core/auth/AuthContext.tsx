import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AuthResponse, AuthUser } from '../types';
import { authApi } from '../api/endpoints/auth';
import { clearStoredToken, getStoredToken, setStoredToken } from '../api/client';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, role: AuthUser['role'], name?: string) => Promise<AuthUser>;
  applyAuth: (data: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const applyAuth = useCallback((data: AuthResponse) => {
    setStoredToken(data.accessToken);
    setUser(data.user);
    setStatus('authenticated');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    applyAuth(data);
    return data.user;
  }, [applyAuth]);

  const register = useCallback(
    async (email: string, password: string, role: AuthUser['role'], name?: string) => {
      const data = await authApi.register(email, password, role, name);
      applyAuth(data);
      return data.user;
    },
    [applyAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore network errors */
    }
    clearStoredToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user } = await authApi.me();
      setUser(user);
      setStatus('authenticated');
    } catch (err) {
      const token = getStoredToken();
      if (token) {
        try {
          const data = await authApi.refresh();
          setStoredToken(data.accessToken);
          setUser(data.user);
          setStatus('authenticated');
          return;
        } catch {
          clearStoredToken();
        }
      }
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  // Restore session on mount.
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setStatus('unauthenticated');
      return;
    }
    authApi
      .me()
      .then(({ user }) => {
        setUser(user);
        setStatus('authenticated');
      })
      .catch(() => {
        clearStoredToken();
        setStatus('unauthenticated');
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      applyAuth,
      logout,
      refreshUser,
    }),
    [user, status, login, register, applyAuth, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
