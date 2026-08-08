import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { AuthHeader } from '../components/AuthHeader';
import { SkipLink } from '../components/SkipLink';
import { useState } from 'react';
import { STUDENT_SIDEBAR_NAV, STUDENT_HEADER_ACTIONS, initialsOf } from '../core/utils/navigation';

export const StudentLayout = () => {
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

  if (!isAuthenticated || user?.role !== 'STUDENT') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="auth-layout">
      <SkipLink />
      <Sidebar
        title="Student"
        sections={STUDENT_SIDEBAR_NAV}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        className={sidebarOpen ? 'is-open' : ''}
        footer={
          <div className="sidebar-user">
            <div className="header-avatar">{initialsOf(user.email)}</div>
            <div className="sidebar-user__meta">
              <span className="sidebar-user__name">{user.email}</span>
              <span className="sidebar-user__role">Student</span>
            </div>
          </div>
        }
      />
      <div className={`sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <div className="auth-main">
        <AuthHeader
          title="Student"
          user={{ email: user.email, name: user.name, role: 'Student' }}
          links={STUDENT_HEADER_ACTIONS}
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
