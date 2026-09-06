import { Link } from 'react-router-dom';

export const SiteFooter = () => {
  return (
    <footer className="app-footer">
      <div className="app-footer__brand">
        <h2>GRADTURE</h2>
        <small className="app-footer__tagline">Connecting emerging talent with meaningful opportunities.</small>
      </div>
      <div className="app-footer__cols">
        <div className="app-footer__col">
          <h3>Product</h3>
          <ul>
            <li><Link to="/jobs">Jobs</Link></li>
            <li><Link to="/companies">Companies</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        <div className="app-footer__col">
          <h3>Account</h3>
          <ul>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="app-footer__bottom">
        <p>&copy; 2026 Gradture AI</p>
      </div>
    </footer>
  );
};
