import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from './Avatar';
import { PhosphorIcon } from './PhosphorIcon';
import { useAuth } from '../core/auth/AuthContext';
import { roleHomePath } from '../core/utils/navigation';

type AuthHeaderProps = {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
};

export const AuthHeader = ({ onToggleSidebar, sidebarOpen }: AuthHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || user?.email || 'User';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logoutModalRef = useRef<HTMLDivElement>(null);
  const homeRoute = roleHomePath(user?.role);

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

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/jobs?q=${encodeURIComponent(q)}`);
  };

  const roleMenuItems = user?.role === 'STUDENT' ? [
    { to: '/student/account', label: 'Profile', icon: 'User' as const },
    { to: '/student/settings', label: 'Settings', icon: 'Gear' as const },
  ] : user?.role === 'EMPLOYER' ? [
    { to: '/employer/account', label: 'Profile', icon: 'User' as const },
    { to: '/employer/settings', label: 'Settings', icon: 'Gear' as const },
  ] : [
    { to: '/admin/account', label: 'Profile', icon: 'User' as const },
    { to: '/admin/settings', label: 'Settings', icon: 'Gear' as const },
  ];

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
  };

  return (
    <header className="app-header" style={{ height: 'var(--header-height)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="app-header__inner" style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', padding: '0 var(--space-5)' }}>
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} aria-expanded={sidebarOpen ?? false} className="mobile-menu-toggle">
          <span className="mobile-menu-toggle__bars" aria-hidden="true"><span /><span /><span /></span>
          <span className="sr-only">Menu</span>
        </Button>

        <span className="app-header__title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>Talent</span>

        <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 0px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <PhosphorIcon name="MagnifyingGlass" size={16} weight="regular" className="app-header__search-icon" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies…"
              className="app-header__search-input"
              aria-label="Global search"
            />
          </div>
        </form>

        <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <Link to={`${homeRoute.replace('/dashboard', '/notifications')}`} className="header-icon-link" aria-label="Notifications">
            <PhosphorIcon name="Bell" size={20} weight="regular" />
          </Link>
          <Link to={`${homeRoute.replace('/dashboard', '/messages')}`} className="header-icon-link" aria-label="Messages">
            <PhosphorIcon name="ChatCircle" size={20} weight="regular" />
          </Link>
          <div className="header-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="header-dropdown__trigger"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label={displayName}
            >
              <Avatar src={user?.avatarUrl} name={displayName} size="sm" userId={user?.id} />
            </button>
            <div className={`header-dropdown__menu ${dropdownOpen ? 'is-open' : ''}`} role="menu">
              <Link to={homeRoute} className="header-dropdown__item" role="menuitem" onClick={() => setDropdownOpen(false)} tabIndex={dropdownOpen ? 0 : -1}>
                <PhosphorIcon name="House" size={18} weight="regular" /><span>Dashboard</span>
              </Link>
              {roleMenuItems.map((item) => (
                <Link key={item.to} to={item.to} className="header-dropdown__item" role="menuitem" onClick={() => setDropdownOpen(false)} tabIndex={dropdownOpen ? 0 : -1}>
                  <PhosphorIcon name={item.icon} size={18} weight="regular" /><span>{item.label}</span>
                </Link>
              ))}
              <div className="header-dropdown__separator" role="separator" />
              <button type="button" className="header-dropdown__item header-dropdown__item--danger" onClick={() => setConfirmLogout(true)} role="menuitem" tabIndex={dropdownOpen ? 0 : -1}>
                <PhosphorIcon name="SignOut" size={18} weight="regular" /><span>Log out</span>
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
              <Button variant="danger" onClick={handleLogout}>Log out</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};