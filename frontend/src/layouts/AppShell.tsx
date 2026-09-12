import { Sidebar } from '../components/Sidebar';
import { AuthHeader } from '../components/AuthHeader';
import { CommandPalette } from '../components/CommandPalette';
import { Avatar } from '../components/Avatar';
import { PhosphorIcon } from '../components/PhosphorIcon';
import { useAuth } from '../core/auth/AuthContext';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { NavSection } from '../core/utils/navigation';

type AppShellProps = {
  role: 'STUDENT' | 'EMPLOYER' | 'ADMIN';
  navConfig: NavSection[];
  storageKey: string;
  children: ReactNode;
};

export const AppShell = ({ role, navConfig, storageKey, children }: AppShellProps) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === 'true';
  });

  const displayName = user?.name || user?.email || 'User';

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(storageKey, String(next));
  };

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="auth-layout">
      <Sidebar
        title="GradTure"
        sections={navConfig}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        className={sidebarOpen ? 'is-open' : ''}
        footer={
          <div className="sidebar-user">
            <Avatar src={user?.avatarUrl} name={displayName} size="sm" userId={user?.id} />
            <div className="sidebar-user__meta">
              <span className="sidebar-user__name">{displayName}</span>
              <span className="sidebar-user__role">{role}</span>
            </div>
            <button
              type="button"
              className="sidebar-user__logout"
              onClick={logout}
              aria-label="Log out"
              title="Log out"
            >
              <PhosphorIcon name="SignOut" size={16} weight="regular" />
            </button>
          </div>
        }
      />
      <div className={`sidebar-overlay ${sidebarOpen ? 'is-open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <div className="auth-main">
        <AuthHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          sidebarOpen={sidebarOpen}
        />
        <main id="main-content" className="auth-content">
          {children}
        </main>
      </div>
      <CommandPalette sections={navConfig} />
    </div>
  );
};
