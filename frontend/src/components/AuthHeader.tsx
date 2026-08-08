import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import type { NavItem } from '../core/utils/navigation';

type AuthHeaderProps = {
  title: string;
  user: { email: string; name?: string; role: string };
  links: NavItem[];
  onToggleSidebar: () => void;
  onLogout: () => void;
};

const initials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

export const AuthHeader = ({ title, user, links, onToggleSidebar, onLogout }: AuthHeaderProps) => {
  const displayName = user.name || user.email;
  const initial = initials(user.name || user.email);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
          className="mobile-menu-toggle"
        >
          ☰
        </Button>
          <div className="brand">
            <span className="brand__mark">G</span>
            <span>{title}</span>
          </div>
        </div>

        <div className="header-user">
          <ThemeToggle />
          <div className="header-dropdown" ref={dropdownRef}>
            <button
              type="button"
              className="header-dropdown__trigger"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              <div className="header-avatar" aria-hidden="true">{initial}</div>
              <div className="header-user__meta">
                <span className="header-user__name">{displayName}</span>
                <span className="header-user__role">{user.role}</span>
              </div>
              <span className="header-dropdown__arrow" aria-hidden="true">▾</span>
            </button>
            <div className={`header-dropdown__menu ${dropdownOpen ? 'is-open' : ''}`} role="list">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="header-dropdown__item" role="listitem" onClick={() => setDropdownOpen(false)}>
                  {link.icon && <span aria-hidden="true">{link.icon}</span>}
                  <span>{link.label}</span>
                </Link>
              ))}
              <button type="button" className="header-dropdown__item header-dropdown__item--danger" onClick={onLogout} role="listitem">
                <span>🚪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
