import { useEffect, useRef } from 'react';
import type { AuthUser } from '../core/types';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { useHeaderMorph } from '../core/hooks/useHeaderMorph';
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
  const headerRef = useRef<HTMLElement>(null);
  const morph = useHeaderMorph(true);

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
    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'hidden',
  };

  const innerStyle: React.CSSProperties = {
    gap: `${morph.groupGap}px`,
    padding: '0',
    transition: 'gap 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const brandStyle: React.CSSProperties = {
    gap: `${morph.itemGap}px`,
    marginLeft: `${morph.brandMargin}px`,
    transform: `scale(${morph.logoScale})`,
    transformOrigin: 'left center',
    transition: 'gap 0.5s cubic-bezier(0.22, 1, 0.36, 1), margin-left 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const titleStyle: React.CSSProperties = {
    opacity: morph.titleOpacity,
    transform: `scale(${morph.titleScale})`,
    transformOrigin: 'left center',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  };

  const navStyle: React.CSSProperties = {
    flex: `${morph.navFlex} ${morph.navFlex} 0px`,
    opacity: morph.navOpacity,
    paddingLeft: `${morph.navPadding}px`,
    paddingRight: `${morph.navPadding}px`,
    gap: `${morph.navGap}px`,
    minWidth: 0,
    transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
    overflow: 'hidden',
  };

  const userGroupStyle: React.CSSProperties = {
    gap: `${morph.itemGap}px`,
    marginRight: `${morph.userMargin}px`,
    opacity: morph.userOpacity,
    transition: 'gap 0.5s cubic-bezier(0.22, 1, 0.36, 1), margin-right 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease',
  };

  const themeStyle: React.CSSProperties = {
    opacity: morph.themeOpacity,
    transition: 'opacity 0.5s ease',
  };

  return (
    <header ref={headerRef} className={headerClassName} style={headerStyle}>
      <div className="app-header__inner" style={innerStyle}>
        <div className="brand" style={brandStyle}>
          <Logo size={28} />
          <span className="header-logo__text" style={titleStyle}>
            <span className="header-logo__inner">Gradture</span>
          </span>
        </div>

        <nav className="public-nav" aria-label="Primary" style={navStyle}>
          <NavLink to="/" end className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
          <NavLink to="/companies" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
          <NavLink to="/about" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>
        </nav>

        {user ? (
          <div className="header-user" style={userGroupStyle}>
            <Avatar src={user.avatarUrl} name={displayName} size="sm" userId={user.id} />
            <div className="header-user__meta" style={{ opacity: morph.metaOpacity, transition: 'opacity 0.35s ease' }}>
              <span className="header-user__name">{displayName}</span>
              <span className="header-user__role">{user.role}</span>
            </div>
            <span style={themeStyle}>
              <ThemeToggle />
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout} aria-label="Log out">
              Log out
            </Button>
          </div>
        ) : (
          <div className="header-user" style={{ ...userGroupStyle, opacity: 1 }}>
            <span style={themeStyle}>
              <ThemeToggle />
            </span>
            <Button variant="primary" size="sm" onClick={onSignIn}>
              Sign in
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
