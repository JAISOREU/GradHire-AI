import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { WhyGradture } from './WhyGradture';
import { HowItWorks } from './HowItWorks';

export const HomePage = () => (
  <div className="page fade-in">
    <section className="hero-wrapper hero-glow">
      <div className="app-hero">
        <AnimatedLogo size={64} showText={true} />
        <h1 className="hero-title gradient-text gradient-text--hero">
          Find the career you always wanted
        </h1>
        <p className="hero-subtitle">
          Build a stronger profile and let AI connect you with the right opportunities.
        </p>
        <div className="hero-actions">
          <Button to="/jobs" iconRight={<Icon name="arrow-right" size={16} />}>Browse jobs</Button>
          <Button to="/register" variant="secondary">Create account</Button>
        </div>
      </div>
    </section>

    <WhyGradture />

    <HowItWorks />

    <section className="section section--cta">
      <div className="cta-card">
        <h2 className="cta-card__title gradient-text gradient-text--subtle">Ready to get started?</h2>
        <p className="cta-card__subtitle">
          Join talent and employers already using Gradture AI.
        </p>
        <div className="hero-actions">
          <Button to="/register">Create account</Button>
          <Button to="/jobs" variant="secondary">Browse jobs</Button>
        </div>
      </div>
    </section>
  </div>
);
