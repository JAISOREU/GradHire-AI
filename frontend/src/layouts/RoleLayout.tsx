import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { SocketProvider } from '../core/websocket/SocketContext';
import { Sidebar } from '../components/Sidebar';
import { AuthHeader } from '../components/AuthHeader';
import { SkipLink } from '../components/SkipLink';
import { useState } from 'react';
import type { NavSection } from '../core/utils/navigation';
import { roleHomePath } from '../core/utils/navigation';
import { getRoleLabel } from '../core/utils/roleLabels';

interface RoleLayoutProps {
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  navConfig: NavSection[];
  storageKey: string;
}

export const RoleLayout = ({ role, navConfig, storageKey }: RoleLayoutProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === 'true';
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(storageKey, String(next));
  };

  if (!isAuthenticated || user?.role !== role) {
    return <Navigate to={roleHomePath(user?.role)} replace />;
  }

  const title = getRoleLabel(role);

  return (
    <SocketProvider>
      <div className="auth-layout">
        <SkipLink />
        <Sidebar
          title={title}
          sections={navConfig}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          className={sidebarOpen ? 'is-open' : ''}
          footer={
            <div className="sidebar-user">
              <div className="sidebar-user__meta">
                <span className="sidebar-user__name">{user.name || user.email}</span>
                <span className="sidebar-user__role">{getRoleLabel(role)}</span>
              </div>
            </div>
          }
        />
        <div className={`sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        <div className="auth-main">
          <AuthHeader
            title={title}
            user={{ id: user.id, email: user.email, name: user.name, role, avatarUrl: user.avatarUrl }}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onLogout={async () => {
              await logout();
              navigate('/');
            }}
            sidebarOpen={sidebarOpen}
          />
          <main id="main-content" className="auth-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SocketProvider>
  );
};
