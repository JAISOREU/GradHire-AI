import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/Button';
import { SkipLink } from '../components/SkipLink';
import { ThemeToggle } from '../components/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { roleHomePath } from '../core/utils/navigation';
import { useHeaderMorph } from '../core/hooks/useHeaderMorph';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const morph = useHeaderMorph(true);
  const homeRoute = roleHomePath(user?.role);

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
    overflow: 'hidden',
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

  const navStyle: React.CSSProperties = {
    opacity: morph.navOpacity,
    flex: `${morph.navFlex} ${morph.navFlex} 0px`,
    padding: `0 ${morph.navPadding}px`,
    gap: `${morph.navGap}px`,
    overflow: 'hidden',
    transition: 'opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), flex 0.35s cubic-bezier(0.22, 1, 0.36, 1), padding 0.35s cubic-bezier(0.22, 1, 0.36, 1), gap 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
    pointerEvents: morph.navOpacity < 0.5 ? 'none' : 'auto',
  };

  const userGroupStyle: React.CSSProperties = {
    gap: `${morph.itemGap}px`,
    marginRight: `${morph.userMargin}px`,
    opacity: morph.userOpacity,
    transition: 'gap 0.35s cubic-bezier(0.22, 1, 0.36, 1), margin-right 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease',
  };

  const themeStyle: React.CSSProperties = {
    opacity: morph.themeOpacity,
    transition: 'opacity 0.35s ease',
  };

  return (
    <div className="public-layout">
      <SkipLink />
      <header ref={headerRef} className={headerClassName} style={headerStyle}>
        <div className="app-header__inner" style={innerStyle}>
          <Link to={homeRoute} className="brand" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', ...brandStyle }}>
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
              <span className="header-logo__inner">Gradture <span className="header-logo__ai">AI</span></span>
            </span>
          </Link>
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2)', fontSize: '1.25rem', lineHeight: 1 }}
          >
            ☰
          </button>
          <nav className="public-nav" aria-label="Primary" style={navStyle}>
            <Link to="/">Home</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/companies">Companies</Link>
            <Link to="/about">About</Link>
          </nav>
          <div className={`public-nav-overlay ${mobileNavOpen ? 'is-open' : ''}`} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
          <div className={`public-nav-drawer ${mobileNavOpen ? 'is-open' : ''}`}>
            <Link to="/" onClick={() => setMobileNavOpen(false)}>Home</Link>
            <Link to="/jobs" onClick={() => setMobileNavOpen(false)}>Jobs</Link>
            <Link to="/companies" onClick={() => setMobileNavOpen(false)}>Companies</Link>
            <Link to="/about" onClick={() => setMobileNavOpen(false)}>About</Link>
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

      <main id="main-content" className="public-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        Gradture AI — connecting talent with opportunities.
      </footer>
    </div>
  );
};
