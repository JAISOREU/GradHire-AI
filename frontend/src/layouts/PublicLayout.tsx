import { Link, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { roleHomePath } from '../core/utils/navigation';
import { SiteFooter } from './SiteFooter';
import { Logo } from '../components/Logo';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 992);
  const mobileNavRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="public-layout">
      {!isHome && (
        <header className="app-header" style={{ height: 'var(--header-height)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="app-header__inner" style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', padding: '0 var(--space-5)' }}>
            <Link
              to={homeRoute}
              className="brand"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => {
                if (isMobile) {
                  e.preventDefault();
                  setMobileNavOpen((prev) => !prev);
                }
              }}
              aria-label={isMobile ? (mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu') : undefined}
            >
              <Logo size={28} />
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Gradture</span>
            </Link>

            <nav className="public-nav" aria-label="Primary" style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
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

            <div className="header-user header-user--desktop" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
              <ThemeToggle />
              {isAuthenticated && user ? (
                <Button to={homeRoute} onClick={() => setMobileNavOpen(false)} variant="secondary" size="sm">Go to dashboard</Button>
              ) : (
                <>
                  <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                  <Link to="/register"><Button variant="primary" size="sm">Register</Button></Link>
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