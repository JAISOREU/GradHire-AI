import React, { useMemo, lazy, Suspense } from 'react';
import { Button } from '../../components/Button';
import { SEO } from '../../components/SEO';
import { FEATURES, FeatureSlide } from './WhyGradture';
import { SiteFooter } from '../../layouts/SiteFooter';
import { LandingPresentation, PresentationSlide } from './LandingPresentation';
import { useAuth } from '../../core/auth/AuthContext';
import { ProductMatchVisual } from './visuals/ProductMatchVisual';

const HowItWorks = lazy(() => import('./HowItWorks').then((m) => ({ default: m.HowItWorks })));

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
      <div className="hero-inner hero-inner--product">
        <div className="hero-content hero-content--product">
          <div className="hero-badge hero-anim hero-anim--logo">
            <span className="hero-badge__dot" aria-hidden="true" />
            AI-Powered Career Matching
          </div>
          <h1 className="hero-title hero-title--product hero-anim hero-anim--title">
            Launch your career with the right opportunity.
          </h1>
          <p className="hero-subtitle hero-subtitle--product hero-anim hero-anim--subtitle">
            Build your profile, upload your resume, and discover roles tailored to your skills, education, and career goals.
          </p>
          <div className="hero-actions hero-actions--product hero-anim hero-anim--actions">
            <Button to={jobsLink} size="lg">
              Browse jobs
            </Button>
            <Button to="/register" variant="secondary" size="lg">
              Create account
            </Button>
          </div>
          <div className="hero-indicators hero-indicators--product hero-anim hero-anim--indicators">
            {HERO_INDICATORS.map((item) => (
              <span key={item} className="hero-indicator">
                <span className="hero-indicator__dot" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-visual-wrap hero-visual-wrap--product hero-anim hero-anim--visual">
          <ProductMatchVisual />
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
              <h2 className="cta-card__title">Ready to get started?</h2>
              <p className="cta-card__subtitle">
                Join talent and employers already using Gradture AI.
              </p>
               <div className="hero-actions">
                 <Button to="/register" size="lg">Create account</Button>
                 <Button to={jobsLink} variant="secondary" size="lg">
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
      <Suspense fallback={<div className="h-24" aria-hidden="true" />}>
        <SiteFooter />
      </Suspense>
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
        node: (
          <Suspense fallback={<div className="h-64 flex items-center justify-center" aria-hidden="true" />}>
            <HowItWorks />
          </Suspense>
        ),
      },
      {
        id: 'cta',
        label: 'Get started',
        scrollable: true,
        node: <CtaNode />,
      },
    ];
  }, []);

  return (
    <>
      <SEO
        title="GradTure — AI-Powered Job Matching for Graduates"
        description="Gradture AI connects fresh graduates with matched job opportunities. Build your profile, upload your resume, and discover roles tailored to your skills and career goals."
        canonical="/"
        ogType="website"
      />
      <LandingPresentation slides={slides} />
    </>
  );
};
