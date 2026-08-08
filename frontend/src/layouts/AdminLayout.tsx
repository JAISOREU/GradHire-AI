import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { AuthHeader } from '../components/AuthHeader';
import { SkipLink } from '../components/SkipLink';
import { useState } from 'react';

const ADMIN_SIDEBAR_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/jobs', label: 'Jobs', icon: '🗂️' },
  { to: '/admin/applications', label: 'Applications', icon: '📨' },
  { to: '/admin/companies', label: 'Companies', icon: '🏢' },
  { to: '/admin/settings', label: 'System Settings', icon: '⚙️' },
];

const ADMIN_HEADER_ACTIONS = [
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  { to: '/admin/developer-tools', label: 'Dev Tools', icon: '🛠️' },
  { to: '/admin/profile', label: 'Profile', icon: '👤' },
];

export const AdminLayout = () => {
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

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="auth-layout">
      <SkipLink />
      <AuthHeader
        title="Admin"
        user={{ email: user.email, name: user.name, role: 'Admin' }}
        links={ADMIN_HEADER_ACTIONS}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onLogout={async () => {
          await logout();
          navigate('/');
        }}
      />
      <div className="auth-body">
        <div className={`sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        <Sidebar
          title="Admin"
          items={ADMIN_SIDEBAR_NAV}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          className={sidebarOpen ? 'is-open' : ''}
          footer={
            <div className="sidebar-user">
              <div className="header-avatar">{user.email?.slice(0, 2).toUpperCase()}</div>
              <div className="sidebar-user__meta">
                <span className="sidebar-user__name">{user.email}</span>
                <span className="sidebar-user__role">Admin</span>
              </div>
            </div>
          }
        />
        <main id="main-content" className="auth-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
