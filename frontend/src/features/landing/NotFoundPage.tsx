import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { AnimatedLogo } from '../../components/AnimatedLogo';

export const NotFoundPage = () => (
  <div className="public-page">
    <section className="section-full">
      <div className="section-inner" style={{ textAlign: 'center', paddingTop: 'var(--space-16)', paddingBottom: 'var(--space-16)' }}>
        <AnimatedLogo size={48} showText={true} />
        <h1 className="not-found__code">404</h1>
        <h2 className="page-title">Page not found</h2>
        <p className="card__subtitle not-found__text">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/">
          <Button>Go back home</Button>
        </Link>
      </div>
    </section>
  </div>
);
