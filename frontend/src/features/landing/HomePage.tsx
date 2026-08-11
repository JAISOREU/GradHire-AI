import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { WhyGradture } from './WhyGradture';
import { HowItWorks } from './HowItWorks';

export const HomePage = () => (
  <div className="page fade-in">
    <section className="hero-wrapper hero-glow">
      <div className="app-hero">
        <AnimatedLogo size={64} showText={true} />
        <p className="hero-subtitle">
          Build a stronger profile and let AI connect you with the right opportunities.
        </p>
        <div className="hero-actions">
          <Link to="/jobs"><Button>Browse jobs</Button></Link>
          <Link to="/register"><Button variant="secondary">Create account</Button></Link>
        </div>
      </div>
    </section>

    <WhyGradture />

    <HowItWorks />

    <section className="section">
      <div className="card cta-section text-center">
        <h2 className="section-title">Ready to get started?</h2>
        <p className="card__subtitle">
          Join talent and employers already using Gradture AI.
        </p>
        <div className="hero-actions">
          <Link to="/register"><Button>Create account</Button></Link>
          <Link to="/jobs"><Button variant="secondary">Browse jobs</Button></Link>
        </div>
      </div>
    </section>
  </div>
);
