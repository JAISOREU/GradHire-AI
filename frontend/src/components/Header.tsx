import { useEffect, useRef } from 'react';
import type { AuthUser } from '../core/types';
import { Button } from './Button';
import { AnimatedLogo } from './AnimatedLogo';
import { ThemeToggle } from './ThemeToggle';

type HeaderProps = {
  user: AuthUser | null;
  onLogout: () => void;
  onSignIn?: () => void;
};

const initials = (name?: string): string => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

export const Header = ({ user, onLogout, onSignIn }: HeaderProps) => {
  const displayName = user?.name || user?.email || '';
  const headerRef = useRef<HTMLElement>(null);

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
        <div className="brand">
          <AnimatedLogo size={32} showText={false} />
          <span>Gradture AI</span>
        </div>

        {user ? (
          <div className="header-user">
            <div className="header-avatar" aria-hidden="true">
              {initials(displayName)}
            </div>
            <div className="header-user__meta">
              <span className="header-user__name">{displayName}</span>
              <span className="header-user__role">{user.role}</span>
            </div>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Log out">
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="primary" size="sm" onClick={onSignIn}>
              Sign in
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

