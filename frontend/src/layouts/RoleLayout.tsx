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
    }
  }, [location.pathname]);

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
