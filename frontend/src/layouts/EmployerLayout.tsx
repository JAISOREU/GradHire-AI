import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { AuthHeader } from '../components/AuthHeader';
import { SkipLink } from '../components/SkipLink';
import { useState } from 'react';
import { EMPLOYER_SIDEBAR_NAV } from '../core/utils/navigation';
import { getRoleLabel } from '../core/utils/roleLabels';
import { roleHomePath } from '../core/utils/navigation';

export const EmployerLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    return stored === 'true';
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  if (!isAuthenticated || user?.role !== 'EMPLOYER') {
    return <Navigate to={roleHomePath(user?.role)} replace />;
  }

  return (
    <div className="auth-layout">
      <SkipLink />
      <Sidebar
        title={getRoleLabel('EMPLOYER')}
        sections={EMPLOYER_SIDEBAR_NAV}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        className={sidebarOpen ? 'is-open' : ''}
        footer={
          <div className="sidebar-user">
            <div className="sidebar-user__meta">
              <span className="sidebar-user__name">{user.name || user.email}</span>
              <span className="sidebar-user__role">{getRoleLabel('EMPLOYER')}</span>
            </div>
          </div>
        }
      />
      <div className={`sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <div className="auth-main">
        <AuthHeader
          title={getRoleLabel('EMPLOYER')}
          user={{ email: user.email, name: user.name, role: 'EMPLOYER', avatarUrl: user.avatarUrl }}
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
