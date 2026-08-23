import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { AuthHeader } from '../components/AuthHeader';
import { SkipLink } from '../components/SkipLink';
import { useState } from 'react';
import { ADMIN_SIDEBAR_NAV } from '../core/utils/navigation';
import { getRoleLabel } from '../core/utils/roleLabels';
import { roleHomePath } from '../core/utils/navigation';

export const AdminLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed-admin');
    return stored === 'true';
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed-admin', String(next));
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to={roleHomePath(user?.role)} replace />;
  }

  return (
    <div className="auth-layout">
      <SkipLink />
      <Sidebar
        title={getRoleLabel('ADMIN')}
        sections={ADMIN_SIDEBAR_NAV}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        className={sidebarOpen ? 'is-open' : ''}
        footer={
          <div className="sidebar-user">
            <div className="sidebar-user__meta">
              <span className="sidebar-user__name">{user.name || user.email}</span>
              <span className="sidebar-user__role">{getRoleLabel('ADMIN')}</span>
            </div>
          </div>
        }
      />
      <div className={`sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <div className="auth-main">
        <AuthHeader
          title={getRoleLabel('ADMIN')}
          user={{ id: user.id, email: user.email, name: user.name, role: 'ADMIN', avatarUrl: user.avatarUrl }}
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
  );
};
