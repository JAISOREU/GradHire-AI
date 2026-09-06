import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { useHeaderMorph } from '../core/hooks/useHeaderMorph';
import { Avatar } from './Avatar';
import { roleHomePath } from '../core/utils/navigation';
import type { UserRole } from '../core/types';

type AuthHeaderProps = {
  title: string;
  user: { id: string; email: string; name?: string; role: UserRole; avatarUrl?: string };
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarOpen?: boolean;
};

export const AuthHeader = ({ title: _title, user, onToggleSidebar, onLogout, sidebarOpen }: AuthHeaderProps) => {
  const displayName = user.name || user.email;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const logoutModalRef = useRef<HTMLDivElement>(null);
  const morph = useHeaderMorph(true);
  const homeRoute = roleHomePath(user.role);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const items = dropdownRef.current?.querySelectorAll<HTMLElement>('.header-dropdown__item');
        if (!items || items.length === 0) return;
        const currentIndex = Array.from(items).findIndex((item) => item === document.activeElement);
        let nextIndex: number;
        if (event.key === 'ArrowDown') {
          nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        }
        items[nextIndex].focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!confirmLogout) return;
    const modal = logoutModalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setConfirmLogout(false);
      }
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    first.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmLogout]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('app-header--glass');
      } else {
        header.classList.remove('app-header--glass');
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClassName = [
    'app-header',
    morph.progress > 0.1 ? 'app-header--morphing' : '',
    morph.isMorphed ? 'app-header--bubble' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const headerStyle: React.CSSProperties = {
    height: `${morph.height}px`,
    borderRadius: `${morph.borderRadius}px`,
    paddingLeft: `${morph.paddingX}px`,
    paddingRight: `${morph.paddingX}px`,
    background: `rgba(${morph.surfaceColor}, ${morph.backgroundOpacity})`,
    border: `1px solid rgba(${morph.borderColor}, ${morph.borderOpacity})`,
    boxShadow: morph.shadowOpacity > 0 ? `0 4px 6px -1px rgba(${morph.shadowColor}, ${morph.shadowOpacity})` : 'none',
    backdropFilter: morph.progress > 0.5 ? 'blur(16px) saturate(180%)' : 'none',
    WebkitBackdropFilter: morph.progress > 0.5 ? 'blur(16px) saturate(180%)' : 'none',
    transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const innerStyle: React.CSSProperties = {
    gap: `${morph.groupGap}px`,
    padding: '0',
    transition: 'gap 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const themeStyle: React.CSSProperties = {
    opacity: morph.themeOpacity,
    transition: 'opacity 0.35s ease',
  };

  const roleMenuItems = useMemo(() => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { to: '/student/account', label: 'Profile' },
          { to: '/student/resume', label: 'Resume' },
          { to: '/student/resume-builder', label: 'Resume Builder' },
          { to: '/student/recommended', label: 'Recommended jobs' },
        ];
      case 'EMPLOYER':
        return [
          { to: '/employer/company-profile', label: 'Company profile' },
          { to: '/employer/post-job', label: 'Post Job' },
          { to: '/employer/analytics', label: 'Analytics' },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/account', label: 'Admin profile' },
          { to: '/admin/dashboard', label: 'Dashboard' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/jobs', label: 'Jobs' },
          { to: '/admin/applications', label: 'Applications' },
          { to: '/admin/companies', label: 'Companies' },
          { to: '/admin/reports', label: 'Reports' },
          { to: '/admin/analytics', label: 'Analytics' },
          { to: '/admin/monitoring', label: 'Monitoring' },
          { to: '/admin/audit-logs', label: 'Audit logs' },
          { to: '/admin/job-sources', label: 'Job Sources' },
          { to: '/admin/job-source-runs', label: 'Ingestion Runs' },
          { to: '/admin/notifications', label: 'Notifications' },
          { to: '/admin/settings', label: 'Settings' },
          { to: '/admin/security', label: 'Security' },
        ];
      default:
        return [];
    }
  }, [user.role]);

  return (
    <header ref={headerRef} className={headerClassName} style={headerStyle}>
      <div className="app-header__inner" style={innerStyle}>
        <div className="app-header__brand">
          <span className="app-header__title">Gradture</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          aria-expanded={sidebarOpen ?? false}
          className="mobile-menu-toggle"
        >
          Menu
        </Button>

        <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: morph.userOpacity, transition: 'opacity 0.35s ease' }}>
          <span style={themeStyle}>
            <ThemeToggle />
          </span>
          <div className="header-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="header-dropdown__trigger"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label={displayName}
            >
              <Avatar src={user.avatarUrl} name={displayName} size="sm" userId={user.id} />
            </button>
            <div className={`header-dropdown__menu ${dropdownOpen ? 'is-open' : ''}`} role="menu">
              <Link to={homeRoute} className="header-dropdown__item" role="menuitem" onClick={() => setDropdownOpen(false)} tabIndex={dropdownOpen ? 0 : -1}>
                <span>Dashboard</span>
              </Link>
              <Link to="/" className="header-dropdown__item" role="menuitem" onClick={() => setDropdownOpen(false)} tabIndex={dropdownOpen ? 0 : -1}>
                <span>Home</span>
              </Link>
              {roleMenuItems.map((item) => (
                <Link key={item.to} to={item.to} className="header-dropdown__item" role="menuitem" onClick={() => setDropdownOpen(false)} tabIndex={dropdownOpen ? 0 : -1}>
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="header-dropdown__separator" role="separator" />
              <button type="button" className="header-dropdown__item header-dropdown__item--danger" onClick={() => setConfirmLogout(true)} role="menuitem" tabIndex={dropdownOpen ? 0 : -1}>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmLogout && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title" aria-label="Confirm logout">
          <div className="modal" ref={logoutModalRef}>
            <h3 id="logout-modal-title" className="card__title">Log out?</h3>
            <p className="card__subtitle">You will need to sign in again to access your dashboard.</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <Button variant="secondary" onClick={() => setConfirmLogout(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => { setConfirmLogout(false); onLogout(); }}>Log out</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
