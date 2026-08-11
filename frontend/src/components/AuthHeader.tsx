import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';
import { useHeaderMorph } from '../core/hooks/useHeaderMorph';
import { Avatar } from './Avatar';

type AuthHeaderProps = {
  title: string;
  user: { email: string; name?: string; role: string; avatarUrl?: string };
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarOpen?: boolean;
};

export const AuthHeader = ({ title, user, onToggleSidebar, onLogout, sidebarOpen }: AuthHeaderProps) => {
  const displayName = user.name || user.email;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const morph = useHeaderMorph(true);

  const rolePrefix = user.role === 'EMPLOYER' ? '/employer' : user.role === 'ADMIN' ? '/admin' : '/student';

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

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
    boxShadow: morph.shadowOpacity > 0 ? `0 4px 6px -1px rgba(15, 23, 42, ${morph.shadowOpacity})` : 'none',
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

  const brandStyle: React.CSSProperties = {
    gap: `${morph.itemGap}px`,
    marginLeft: `${morph.brandMargin}px`,
    transform: `scale(${morph.logoScale})`,
    transformOrigin: 'left center',
    transition: 'gap 0.35s cubic-bezier(0.22, 1, 0.36, 1), margin-left 0.35s cubic-bezier(0.22, 1, 0.36, 1), transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const titleStyle: React.CSSProperties = {
    opacity: morph.titleOpacity,
    transform: `scale(${morph.titleScale})`,
    transformOrigin: 'left center',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
  };

  const themeStyle: React.CSSProperties = {
    opacity: morph.themeOpacity,
    transition: 'opacity 0.35s ease',
  };

  const publicNavItems = [
    { to: '/jobs', label: 'Jobs', icon: 'jobs' as const },
    { to: '/companies', label: 'Companies', icon: 'company' as const },
    { to: '/about', label: 'About' },
  ];

  const roleMenuItems = useMemo(() => {
    switch (user.role) {
      case 'STUDENT':
        return [
          { to: '/student/account', label: 'Profile', icon: 'profile' as const },
          { to: '/student/applications', label: 'Applications', icon: 'applications' as const },
          { to: '/student/saved', label: 'Saved jobs', icon: 'saved' as const },
          { to: '/student/messages', label: 'Messages', icon: 'messages' as const },
          { to: '/student/notifications', label: 'Notifications', icon: 'notifications' as const },
          { to: '/student/settings', label: 'Settings', icon: 'settings' as const },
        ];
      case 'EMPLOYER':
        return [
          { to: '/employer/account', label: 'Company profile', icon: 'company' as const },
          { to: '/employer/jobs', label: 'Job posts', icon: 'jobs' as const },
          { to: '/employer/applicants', label: 'Applicants', icon: 'users' as const },
          { to: '/employer/messages', label: 'Messages', icon: 'messages' as const },
          { to: '/employer/notifications', label: 'Notifications', icon: 'notifications' as const },
          { to: '/employer/settings', label: 'Hiring settings', icon: 'settings' as const },
        ];
      case 'ADMIN':
        return [
          { to: '/admin/account', label: 'Admin profile', icon: 'profile' as const },
          { to: '/admin/users', label: 'Users', icon: 'users' as const },
          { to: '/admin/jobs', label: 'Jobs', icon: 'jobs' as const },
          { to: '/admin/companies', label: 'Companies', icon: 'company' as const },
          { to: '/admin/audit-logs', label: 'Audit logs', icon: 'audit' as const },
          { to: '/admin/settings', label: 'Settings', icon: 'settings' as const },
        ];
      default:
        return [];
    }
  }, [user.role, rolePrefix]);

  return (
    <header ref={headerRef} className={headerClassName} style={headerStyle}>
      <div className="app-header__inner" style={innerStyle}>
        <div className="brand" style={brandStyle}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen ?? false}
            className="mobile-menu-toggle"
            style={{ display: 'inline-flex', padding: 'var(--space-2)', fontSize: '1.25rem', lineHeight: 1 }}
          >
            <Icon name="menu" size={22} />
          </Button>
          <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center' }}>
            <span className="header-logo__mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8L4 16L20 24L36 16L20 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" className="header-logo-cap" />
                <path d="M20 24V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="header-logo-tassel" />
                <circle cx="20" cy="33" r="2" fill="currentColor" className="header-logo-tassel-dot" />
                <circle cx="4" cy="16" r="2.5" fill="currentColor" className="header-logo-node header-logo-node--1" />
                <circle cx="20" cy="8" r="2.5" fill="currentColor" className="header-logo-node header-logo-node--2" />
                <circle cx="36" cy="16" r="2.5" fill="currentColor" className="header-logo-node header-logo-node--3" />
                <circle cx="20" cy="24" r="2.5" fill="currentColor" className="header-logo-node header-logo-node--4" />
                <path d="M4 16H36M20 8V24M4 16L20 24M36 16L20 24" stroke="currentColor" strokeWidth="1" opacity="0.3" className="header-logo-lines" />
              </svg>
            </span>
            <span className="header-logo__text" style={titleStyle}>
              <span className="header-logo__inner">{title.split(' ').map((word, i, arr) => {
                const isLast = i === arr.length - 1;
                if (isLast && arr.length > 1) {
                  return <span key={i} className="header-logo__ai">{word} </span>;
                }
                return <span key={i}>{word} </span>;
              })}</span>
            </span>
          </Link>
        </div>

        <div className="header-user" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', opacity: morph.userOpacity, transition: 'opacity 0.35s ease' }}>
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
              <Avatar src={user.avatarUrl} name={displayName} size="sm" />
            </button>
            <div className={`header-dropdown__menu ${dropdownOpen ? 'is-open' : ''}`} role="list">
              {roleMenuItems.map((item) => (
                <Link key={item.to} to={item.to} className="header-dropdown__item" role="listitem" onClick={() => setDropdownOpen(false)}>
                  {item.icon && <span aria-hidden="true"><Icon name={item.icon} size={18} /></span>}
                  <span>{item.label}</span>
                </Link>
              ))}
              <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} role="separator" />
              {publicNavItems.map((item) => (
                <Link key={item.to} to={item.to} className="header-dropdown__item" role="listitem" onClick={() => setDropdownOpen(false)}>
                  {item.icon && <span aria-hidden="true"><Icon name={item.icon} size={18} /></span>}
                  <span>{item.label}</span>
                </Link>
              ))}
              <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} role="separator" />
              <button type="button" className="header-dropdown__item header-dropdown__item--danger" onClick={() => setConfirmLogout(true)} role="listitem">
                <span>🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmLogout && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm logout">
          <div className="modal">
            <h3 className="card__title">Log out?</h3>
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
