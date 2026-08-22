import React, { useMemo } from 'react';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { AnimatedLogo } from '../../components/AnimatedLogo';
import { HeroVisual } from './visuals/HeroVisual';
import { FEATURES, FeatureSlide } from './WhyGradture';
import { HowItWorks } from './HowItWorks';
import { SiteFooter } from '../../layouts/SiteFooter';
import { LandingPresentation, PresentationSlide } from './LandingPresentation';
import { useAuth } from '../../core/auth/AuthContext';

const HERO_INDICATORS = [
  'Smart matching',
  'Real opportunities',
  'Profile-based recommendations',
];

const HeroNode = () => {
  const { user } = useAuth();
  const jobsLink = user?.role === 'STUDENT' ? '/student/jobs' : user?.role === 'EMPLOYER' ? '/employer/post-job' : '/jobs';

  return (
    <React.Fragment>
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-anim hero-anim--logo">
            <AnimatedLogo size={96} showText={true} />
          </div>
          <h1 className="hero-title gradient-text gradient-text--hero hero-anim hero-anim--title">
            Find the career you always wanted
          </h1>
          <p className="hero-subtitle hero-anim hero-anim--subtitle">
            Discover opportunities that fit your skills, education, experience, and goals while building a stronger profile for the right employers.
          </p>
          <div className="hero-actions hero-anim hero-anim--actions">
            <Button to={jobsLink} size="lg" iconRight={<Icon name="arrow-right" size={18} />}>
              Browse jobs
            </Button>
            <Button to="/register" variant="secondary" size="lg">
              Create account
            </Button>
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
            For talent looking for the right opportunity and employers looking for the right people.
          </p>
        </div>
        <div className="hero-visual-wrap hero-anim hero-anim--visual">
          <HeroVisual />
        </div>
      </div>
    </React.Fragment>
  );
};

const CtaNode = () => {
  const { user } = useAuth();
  const jobsLink = user?.role === 'STUDENT' ? '/student/jobs' : user?.role === 'EMPLOYER' ? '/employer/post-job' : '/jobs';

  return (
    <div className="cta-slide-body">
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
                <Button to={jobsLink} variant="secondary">
                  Browse jobs
                </Button>
              </div>
            </div>
          </section>
        </div>
      </section>
      <div className="cta-footer-divider" aria-hidden="true">
        <span className="cta-footer-divider__line" />
        <span className="cta-footer-divider__mark">{'\u2726'}</span>
        <span className="cta-footer-divider__line" />
      </div>
      <SiteFooter />
    </div>
  );
};

export const HomePage = () => {
  const slides = useMemo<PresentationSlide[]>(() => {
    const featureSlides: PresentationSlide[] = FEATURES.map((feature, index) => ({
      id: feature.id,
      label: feature.label,
      node: <FeatureSlide feature={feature} index={index} />,
    }));

    return [
      {
        id: 'hero',
        label: 'Introduction',
        node: <HeroNode />,
      },
      ...featureSlides,
      {
        id: 'how-it-works',
        label: 'How it works',
        scrollable: true,
        node: <HowItWorks />,
      },
      {
        id: 'cta',
        label: 'Get started',
        scrollable: true,
        node: <CtaNode />,
      },
    ];
  }, []);

  return <LandingPresentation slides={slides} />;
};
