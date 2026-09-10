import { Link, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { roleHomePath } from '../core/utils/navigation';
import { useHeaderMorph } from '../core/hooks/useHeaderMorph';
import { SiteFooter } from './SiteFooter';
import { Logo } from '../components/Logo';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 992);
  const headerRef = useRef<HTMLElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const morph = useHeaderMorph(true);
  const homeRoute = roleHomePath(user?.role);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) setMobileNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    if (!location.hash) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

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

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  const headerClassName = [
    'app-header',
    'app-header--landing',
  ]
    .filter(Boolean)
    .join(' ');

  const headerStyle: React.CSSProperties = {
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
      {!isHome && (
        <header ref={headerRef} className={headerClassName} style={headerStyle}>
          <div className="app-header__inner" style={innerStyle}>
            <Link
              to={homeRoute}
              className="brand inline-flex items-center no-underline text-inherit"
              style={brandStyle}
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  setMobileNavOpen((prev) => !prev);
                }
              }}
              aria-label={isMobile ? (mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu') : undefined}
            >
              <Logo size={28} />
              <span className="header-logo__text" style={titleStyle}>
                <span className="header-logo__inner">Gradture</span>
              </span>
            </Link>
            <nav className="public-nav" aria-label="Primary" style={navStyle}>
              <NavLink to="/" end className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
              <NavLink to="/jobs" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
              <NavLink to="/companies" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
              <NavLink to="/about" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>
            </nav>
            <div className={`public-nav-overlay ${mobileNavOpen ? 'is-open' : ''}`} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
            <div className={`public-nav-drawer ${mobileNavOpen ? 'is-open' : ''}`} ref={mobileNavRef} role="dialog" aria-modal="true" aria-label="Navigation menu">
              <NavLink to="/" end onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
              <NavLink to="/jobs" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
              <NavLink to="/companies" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
              <NavLink to="/about" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>

              {isAuthenticated && user ? (
                <div className="public-nav-drawer__section">
                  <Button to={homeRoute} onClick={() => setMobileNavOpen(false)} variant="secondary" size="lg" className="public-nav-drawer__btn">Go to dashboard</Button>
                </div>
              ) : (
                <div className="public-nav-drawer__section public-nav-drawer__section--auth">
                  <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="secondary" size="lg" className="public-nav-drawer__btn">Log in</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileNavOpen(false)}>
                    <Button variant="primary" size="lg" className="public-nav-drawer__btn">Register</Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="header-user header-user--desktop" style={userGroupStyle}>
              <span style={themeStyle}>
                <ThemeToggle />
              </span>
              {isAuthenticated && user ? (
                <Button to={homeRoute} onClick={() => setMobileNavOpen(false)} variant="secondary" size="sm">Go to dashboard</Button>
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

      <main id="main-content" className={`public-main ${!isHome ? 'has-header' : ''}`}>
        <Outlet />
      </main>

      {!isHome && <SiteFooter />}
    </div>
  );
};
