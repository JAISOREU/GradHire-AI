import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { SocketProvider } from '../core/websocket/SocketContext';
import { AppShell } from './AppShell';
import { PageContainer } from '../components/PageContainer';
import type { NavSection } from '../core/utils/navigation';
import { roleHomePath } from '../core/utils/navigation';

interface RoleLayoutProps {
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  navConfig: NavSection[];
  storageKey: string;
}

export const RoleLayout = ({ role, navConfig, storageKey }: RoleLayoutProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  }, [location.pathname, location.hash]);

  if (!isAuthenticated || user?.role !== role) {
    return <Navigate to={roleHomePath(user?.role)} replace />;
  }

  return (
    <SocketProvider>
      <AppShell role={role} navConfig={navConfig} storageKey={storageKey}>
        <PageContainer>
          <Outlet />
        </PageContainer>
      </AppShell>
    </SocketProvider>
  );
};
