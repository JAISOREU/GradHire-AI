import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/Button';
import { SkipLink } from '../components/SkipLink';
import { ThemeToggle } from '../components/ThemeToggle';
import { AnimatedLogo } from '../components/AnimatedLogo';
import { useState } from 'react';
import { roleHomePath } from '../core/utils/navigation';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="public-layout">
      <SkipLink />
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="brand">
            <AnimatedLogo size={32} showText={false} />
            <span>Gradture AI</span>
          </Link>
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileNavOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={mobileNavOpen}
          >
            ☰
          </button>
          <nav className="public-nav" aria-label="Primary">
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
          <div className="header-user">
            <ThemeToggle />
            {isAuthenticated && user ? (
              <Link to={roleHomePath(user.role)}>
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
        Gradture AI — connecting fresh grads with opportunities.
      </footer>
    </div>
  );
};
