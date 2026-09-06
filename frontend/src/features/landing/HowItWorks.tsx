import { useRef, useEffect } from 'react';
import { ScrollReveal, StaggerContainer, StaggerChild } from '../../animations';
import { MOTION } from '../../animations/motion-tokens';
import { MatchInline, TalentFlowInline, ApplicationsInline, PrivacyInline } from './inline';

const STEPS = [
  {
    number: '01',
    label: 'Getting started',
    title: 'Create your account',
    text: 'Create your account and get started in minutes.',
    details: 'Start with the basic information needed to establish your account. Once registered, you can continue building your profile and access the parts of the platform available to your role.',
    supporting: ['Email', 'Password', 'Name', 'Account created', 'Profile initialized'],
    visual: PrivacyInline,
  },
  {
    number: '02',
    label: 'Your profile',
    title: 'Build your profile',
    text: 'Add your skills, experience, resume, and career preferences.',
    details: 'A more complete profile gives the platform better information to work with. Add your education, skills, experience, resume, projects, certifications, and preferences so opportunities and recommendations are evaluated against information you actually provide.',
    supporting: ['Skills', 'Education', 'Experience', 'Resume', 'Projects', 'Preferences'],
    visual: ApplicationsInline,
  },
  {
    number: '03',
    label: 'Discovery',
    title: 'Discover opportunities',
    text: 'Discover opportunities that align with your skills and goals.',
    details: 'Browse available jobs and internships through the discovery experience. Search and filter opportunities using the criteria that matter to you, then open complete job details before deciding whether to apply.',
    supporting: ['Search opportunities', 'Remote', 'Full-time', 'Internship'],
    visual: TalentFlowInline,
  },
  {
    number: '04',
    label: 'Next steps',
    title: 'Move forward',
    text: 'Apply, communicate, track progress, and take your next step.',
    details: 'Once you find an opportunity, continue through the employment process from the same platform. Submit applications, communicate when available, monitor progress, and stay aware of important updates as your application moves forward.',
    supporting: ['Applied', 'Reviewed', 'Interview', 'Next step'],
    visual: MatchInline,
  },
];

export const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stepEls = section.querySelectorAll('.how-step');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('how-step--inview');
          } else {
            entry.target.classList.remove('how-step--inview');
          }
        });
      },
      { threshold: 0.2, rootMargin: '-40px 0px -40px 0px' }
    );

    stepEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-section" ref={sectionRef} aria-labelledby="how-it-works-title">
      <div className="how-header">
        <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slowest, distance: MOTION.distance.lg, direction: 'up' }}>
          <h2 id="how-it-works-title" className="how-header__title">
            How it works
          </h2>
        </ScrollReveal>
        <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.md, direction: 'up', delay: 100 }}>
          <p className="how-header__subtitle">
            From creating your profile to discovering the right opportunity, Gradture AI keeps the journey simple.
          </p>
        </ScrollReveal>
      </div>

      <div className="how-steps">
        {STEPS.map((step, index) => {
          const StepVisual = step.visual;

          return (
            <div key={step.number} className="how-step" data-step-index={index}>
              <div className="how-step__marker" aria-hidden="true">
                <span className="how-step__number">{step.number}</span>
              </div>
              <div className="how-step__content">
                <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.md, direction: 'up' }}>
                  <span className="how-step__label">{step.label}</span>
                  <h3 className="how-step__title">{step.title}</h3>
                </ScrollReveal>
                <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.sm, direction: 'up', delay: 100 }}>
                  <p className="how-step__text">{step.text}</p>
                </ScrollReveal>
                <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.sm, direction: 'up', delay: 150 }}>
                  <p className="how-step__details">{step.details}</p>
                </ScrollReveal>
                <StaggerContainer options={{ stagger: MOTION.stagger.sm, once: true, threshold: 0.2 }} className="how-step__supporting">
                  {step.supporting.map((item) => (
                    <StaggerChild key={item}>
                      <span className="how-step__chip">{item}</span>
                    </StaggerChild>
                  ))}
                </StaggerContainer>
              </div>
              <div className="how-step__visual">
                <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.md, direction: 'up', delay: 100 }}>
                  <StepVisual />
                </ScrollReveal>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .how-section {
          position: relative;
          padding: var(--space-16, 4rem) 0;
        }

        .how-header {
          text-align: center;
          margin-bottom: var(--space-12, 3rem);
        }

        .how-header__title {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 700;
          color: var(--color-text);
          margin: 0 0 var(--space-3, 0.75rem);
          letter-spacing: -0.02em;
        }

        .how-header__subtitle {
          max-width: var(--container-narrow, 720px);
          margin: 0 auto;
          font-size: var(--text-lg, 1.125rem);
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .how-steps {
          max-width: var(--container-max, 1200px);
          margin: 0 auto;
          padding: 0 var(--space-6, 1.5rem);
          display: flex;
          flex-direction: column;
          gap: var(--space-16, 4rem);
          position: relative;
        }

        .how-steps::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, var(--color-border), var(--color-text-tertiary), var(--color-border));
          opacity: 0.25;
          z-index: 0;
        }

        @media (min-width: 768px) {
          .how-steps::before {
            left: 50%;
            transform: translateX(-50%);
          }
        }

        .how-step {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-6, 1.5rem);
          align-items: center;
          position: relative;
          opacity: 0;
          transform: translate3d(0, 20px, 0);
          transition: opacity 650ms cubic-bezier(0.22, 1, 0.36, 1), transform 650ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .how-step--inview {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }

        @media (min-width: 1024px) {
          .how-step {
            grid-template-columns: 1fr 1fr;
            gap: clamp(var(--space-10), 4vw, var(--space-16));
          }
        }

        .how-step__marker {
          display: none;
          position: absolute;
          left: 12px;
          top: 24px;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--color-surface);
          border: 2px solid var(--color-text-tertiary);
          z-index: 2;
          align-items: center;
          justify-content: center;
        }

        .how-step--inview .how-step__marker {
          background: var(--color-text);
          border-color: var(--color-text);
        }

        .how-step__number {
          font-family: var(--font-display);
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-text-tertiary);
        }

        .how-step--inview .how-step__number {
          color: var(--color-surface);
        }

        @media (min-width: 768px) {
          .how-step__marker {
            display: flex;
            left: 50%;
            top: 32px;
            transform: translateX(-50%);
            width: 40px;
            height: 40px;
          }
        }

        .how-step__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-3, 0.75rem);
          position: relative;
          z-index: 1;
        }

        .how-step__label {
          display: inline-block;
          font-size: var(--text-xs, 0.75rem);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-text-tertiary);
          margin-bottom: var(--space-1, 0.25rem);
        }

        .how-step__title {
          font-family: var(--font-display);
          font-size: var(--text-3xl, 1.875rem);
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .how-step__text {
          font-size: var(--text-lg, 1.125rem);
          color: var(--color-text-secondary);
          margin: 0;
          line-height: 1.6;
        }

        .how-step__details {
          color: var(--color-text-secondary);
          font-size: var(--text-base, 1rem);
          opacity: 0.75;
          margin: 0;
          line-height: 1.6;
        }

        .how-step__supporting {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2, 0.5rem);
          margin: var(--space-3, 0.75rem) 0 0 0;
          padding: 0;
          list-style: none;
        }

        .how-step__chip {
          display: inline-block;
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-full, 9999px);
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          background: var(--color-surface-muted);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), color var(--transition-theme);
        }

        .how-step__visual {
          position: relative;
          display: flex;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .how-step {
            grid-template-columns: 1fr;
            gap: var(--space-6, 1.5rem);
          }

          .how-step__visual {
            order: -1;
          }

          .how-step__marker {
            display: none;
          }

          .how-step {
            padding-left: var(--space-8, 2rem);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .how-step {
            opacity: 1 !important;
            transform: none !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
        }
      `}</style>
    </section>
  );
};
