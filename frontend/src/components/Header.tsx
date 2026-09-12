import type { AuthUser } from '../core/types';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { NavLink } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Logo } from './Logo';

type HeaderProps = {
  user: AuthUser | null;
  onLogout: () => void;
  onSignIn?: () => void;
};

export const Header = ({ user, onLogout, onSignIn }: HeaderProps) => {
  const displayName = user?.name || user?.email || '';

  return (
    <header className="app-header" style={{ height: 'var(--header-height)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="app-header__inner" style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', padding: '0 var(--space-5)' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo size={28} />
          <span className="header-logo__text" style={{ fontSize: '15px', fontWeight: 600 }}>
            Gradture
          </span>
        </div>

        <nav className="public-nav" aria-label="Primary" style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
          <NavLink to="/" end className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
          <NavLink to="/companies" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
          <NavLink to="/about" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>
        </nav>

        <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <ThemeToggle />
          {user ? (
            <>
              <Avatar src={user.avatarUrl} name={displayName} size="sm" userId={user.id} />
              <Button variant="ghost" size="sm" onClick={onLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onSignIn}>Sign in</Button>
              <Button variant="primary" size="sm" onClick={onSignIn}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};