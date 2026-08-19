import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { HeroVisual } from './visuals/HeroVisual';
import { WhyGradture } from './WhyGradture';
import { HowItWorks } from './HowItWorks';

const HERO_INDICATORS = [
  'AI-powered matching',
  'Real opportunities',
  'Profile-based recommendations',
];

export const HomePage = () => (
  <div className="public-page">
    <section className="section-full hero-wrapper">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-anim hero-anim--logo">
            <AnimatedLogo size={96} showText={true} />
          </div>
          <h1 className="hero-title gradient-text gradient-text--hero hero-anim hero-anim--title">
            Find the career you always wanted
          </h1>
          <p className="hero-subtitle hero-anim hero-anim--subtitle">
            Discover opportunities that fit your skills, education, experience, and goals — while building a stronger profile for the right employers.
          </p>
          <div className="hero-actions hero-anim hero-anim--actions">
            <Button to="/jobs" size="lg" iconRight={<Icon name="arrow-right" size={18} />}>Browse jobs</Button>
            <Button to="/register" variant="secondary" size="lg">Create account</Button>
          </div>
          <div className="hero-indicators hero-anim hero-anim--indicators">
            {HERO_INDICATORS.map((item) => (
              <span key={item} className="hero-indicator">
                <span className="hero-indicator__dot" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
          <p className="hero-context">
            For talent looking for the right opportunity — and employers looking for the right people.
          </p>
        </div>
        <div className="hero-visual-wrap hero-anim hero-anim--visual">
          <HeroVisual />
        </div>
      </div>
      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-cue__label">Scroll to explore</span>
        <span className="scroll-cue__line" />
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
