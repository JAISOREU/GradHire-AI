import { Link, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/Button';
import { SkipLink } from '../components/SkipLink';
import { ThemeToggle } from '../components/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { roleHomePath } from '../core/utils/navigation';
import { useHeaderMorph } from '../core/hooks/useHeaderMorph';
import { SiteFooter } from './SiteFooter';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileNavToggleRef = useRef<HTMLButtonElement>(null);
  const morph = useHeaderMorph(true);
  const homeRoute = roleHomePath(user?.role);
  const isHome = useLocation().pathname === '/';

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

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const drawer = mobileNavRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>('a, button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [mobileNavOpen]);

  const headerClassName = [
    'app-header',
    'app-header--landing',
  ]
    .filter(Boolean)
    .join(' ');

  const headerStyle: React.CSSProperties = {
    background: 'transparent',
    borderBottom: '1px solid var(--color-border)',
    backdropFilter: 'blur(12px) saturate(180%)',
    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
    transition: 'background-color var(--transition-theme), border-color var(--transition-theme)',
  };

  const innerStyle: React.CSSProperties = {
    gap: `${morph.groupGap}px`,
    padding: '0',
    transition: 'gap 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const brandStyle: React.CSSProperties = {
    gap: `${morph.itemGap}px`,
    marginLeft: '0',
    transform: 'scale(1)',
    transformOrigin: 'left center',
    transition: 'gap 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const titleStyle: React.CSSProperties = {
    opacity: 1,
    transform: 'scale(1)',
    transformOrigin: 'left center',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
  };

  const navStyle: React.CSSProperties = {
    opacity: 1,
    flex: '1 1 0px',
    padding: '0',
    gap: `${morph.navGap}px`,
    transition: 'opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), gap 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
    pointerEvents: 'auto',
  };

  const userGroupStyle: React.CSSProperties = {
    gap: `${morph.itemGap}px`,
    marginRight: '0',
    opacity: 1,
    transition: 'gap 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  };

  const themeStyle: React.CSSProperties = {
    opacity: 1,
    transition: 'opacity 0.35s ease',
  };

  return (
    <div className="public-layout">
      <SkipLink />
      {!isHome && (
        <header ref={headerRef} className={headerClassName} style={headerStyle}>
          <div className="app-header__inner" style={innerStyle}>
            <Link to={homeRoute} className="brand inline-flex items-center no-underline text-inherit" style={brandStyle}>
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
                <span className="header-logo__inner">Gradture</span>
              </span>
            </Link>
            <button
              type="button"
              className="mobile-menu-toggle mobile-menu-toggle--landing"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              aria-label="Toggle navigation"
              aria-expanded={mobileNavOpen}
              ref={mobileNavToggleRef}
            >
              <span className="mobile-menu-toggle__label">Menu</span>
            </button>
            <nav className="public-nav" aria-label="Primary" style={navStyle}>
              <NavLink to="/" end className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
              <NavLink to="/jobs" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
              <NavLink to="/companies" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
              <NavLink to="/about" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>
            </nav>
            <div className={`public-nav-overlay ${mobileNavOpen ? 'is-open' : ''}`} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
            <div className={`public-nav-drawer ${mobileNavOpen ? 'is-open' : ''}`} ref={mobileNavRef} role="dialog" aria-modal="true" aria-label="Navigation menu" aria-labelledby="mobile-nav-toggle">
              <NavLink to="/" end onClick={() => setMobileNavOpen(false)} className={({ isActive }) => isActive ? 'is-active' : ''}>Home</NavLink>
              <NavLink to="/jobs" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => isActive ? 'is-active' : ''}>Jobs</NavLink>
              <NavLink to="/companies" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => isActive ? 'is-active' : ''}>Companies</NavLink>
              <NavLink to="/about" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => isActive ? 'is-active' : ''}>About</NavLink>
            </div>
            <div className="header-user" style={userGroupStyle}>
              <span style={themeStyle}>
                <ThemeToggle />
              </span>
              {isAuthenticated && user ? (
                <Link to={homeRoute}>
                  <Button variant="secondary" size="sm">Go to dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main id="main-content" className="public-main">
        <Outlet />
      </main>

      {!isHome && <SiteFooter />}
    </div>
  );
};
