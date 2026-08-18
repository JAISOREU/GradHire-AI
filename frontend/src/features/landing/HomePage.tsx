import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { WhyGradture } from './WhyGradture';
import { HowItWorks } from './HowItWorks';

export const HomePage = () => (
  <div className="public-page">
    <section className="section-full hero-wrapper hero-glow">
      <div className="section-inner">
        <div className="app-hero">
          <div className="hero-anim hero-anim--logo">
            <AnimatedLogo size={64} showText={true} />
          </div>
          <h1 className="hero-title gradient-text gradient-text--hero hero-anim hero-anim--title">
            Find the career you always wanted
          </h1>
          <p className="hero-subtitle hero-anim hero-anim--subtitle">
            Build a stronger profile and let AI connect you with the right opportunities.
          </p>
          <div className="hero-actions hero-anim hero-anim--actions">
            <Button to="/jobs" iconRight={<Icon name="arrow-right" size={16} />}>Browse jobs</Button>
            <Button to="/register" variant="secondary">Create account</Button>
          </div>
        </div>
      </div>
    </section>

    <section className="section-full">
      <div className="section-inner">
        <WhyGradture />
      </div>
    </section>

    <div className="section-divider" aria-hidden="true" />

    <section className="section-full">
      <div className="section-inner">
        <HowItWorks />
      </div>
    </section>

    <div className="section-divider" aria-hidden="true" />

    <section className="section-full">
      <div className="section-inner">
        <section className="cta-section">
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
    </section>
  </div>
);
