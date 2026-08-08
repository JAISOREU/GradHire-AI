import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';
import type { NavItem } from '../core/utils/navigation';

type AuthHeaderProps = {
  title: string;
  user: { email: string; name?: string; role: string };
  links: NavItem[];
  onToggleSidebar: () => void;
  onLogout: () => void;
  sidebarOpen?: boolean;
};

const initials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

export const AuthHeader = ({ title, user, links, onToggleSidebar, onLogout, sidebarOpen }: AuthHeaderProps) => {
  const displayName = user.name || user.email;
  const initial = initials(user.name || user.email);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

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

  return (
    <header ref={headerRef} className="app-header">
      <div className="app-header__inner">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
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
          <Link to="/" className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="brand__mark">G</span>
            <span>{title}</span>
          </Link>
        </div>

        <div className="header-user">
          <div className="header-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="header-dropdown__trigger"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-label={displayName}
            >
              <div className="header-avatar" aria-hidden="true">{initial}</div>
              <span className="header-dropdown__arrow" aria-hidden="true">▾</span>
            </button>
            <div className={`header-dropdown__menu ${dropdownOpen ? 'is-open' : ''}`} role="list">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="header-dropdown__item" role="listitem" onClick={() => setDropdownOpen(false)}>
                  {link.icon && <span aria-hidden="true"><Icon name={link.icon as any} size={18} /></span>}
                  <span>{link.label}</span>
                </Link>
              ))}
              <button type="button" className="header-dropdown__item header-dropdown__item--danger" onClick={() => setConfirmLogout(true)} role="listitem">
                <span>🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
          <ThemeToggle />
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
