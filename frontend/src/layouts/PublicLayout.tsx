import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/Button';
import { SkipLink } from '../components/SkipLink';
import { ThemeToggle } from '../components/ThemeToggle';
import { roleHomePath } from '../core/utils/navigation';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="public-layout">
      <SkipLink />
      <header className="app-header">
        <div className="app-header__inner">
          <Link to="/" className="brand">
            <span className="brand__mark">G</span>
            <span>GradHire AI</span>
          </Link>
          <nav className="public-nav" aria-label="Primary">
            <Link to="/">Home</Link>
            <Link to="/jobs">Jobs</Link>
            <Link to="/companies">Companies</Link>
            <Link to="/about">About</Link>
          </nav>
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
        GradHire AI — connecting fresh grads with opportunities.
      </footer>
    </div>
  );
};
