import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';

export const NotFoundPage = () => (
  <div className="page fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center' }}>
    <h1 style={{ fontSize: '4rem', fontWeight: 800, background: 'var(--gradient-brand)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>404</h1>
    <h2 className="page-title" style={{ fontSize: '1.5rem' }}>Page not found</h2>
    <p className="card__subtitle" style={{ maxWidth: '400px' }}>
      The page you&apos;re looking for doesn&apos;t exist or has been moved.
    </p>
    <Link to="/">
      <Button>Go back home</Button>
    </Link>
  </div>
);
