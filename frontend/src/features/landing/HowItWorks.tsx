import { useRef, useEffect, useState } from 'react';
import { ScrollReveal, StaggerContainer, StaggerChild } from '../../animations';
import { MOTION } from '../../animations/motion-tokens';
import { CreateAccountVisual } from './visuals/CreateAccountVisual';
import { BuildProfileVisual } from './visuals/BuildProfileVisual';
import { DiscoverOpportunitiesVisual } from './visuals/DiscoverOpportunitiesVisual';
import { MoveForwardVisual } from './visuals/MoveForwardVisual';

const STEPS = [
  {
    number: '01',
    label: 'Getting started',
    title: 'Create your account',
    text: 'Create your account and get started in minutes.',
    details: 'Start with the basic information needed to establish your account. Once registered, you can continue building your profile and access the parts of the platform available to your role.',
    supporting: ['Email', 'Password', 'Name', 'Account created', 'Profile initialized'],
    visual: CreateAccountVisual,
  },
  {
    number: '02',
    label: 'Your profile',
    title: 'Build your profile',
    text: 'Add your skills, experience, resume, and career preferences.',
    details: 'A more complete profile gives the platform better information to work with. Add your education, skills, experience, resume, projects, certifications, and preferences so opportunities and recommendations are evaluated against information you actually provide.',
    supporting: ['Skills', 'Education', 'Experience', 'Resume', 'Projects', 'Preferences'],
    visual: BuildProfileVisual,
  },
  {
    number: '03',
    label: 'Discovery',
    title: 'Discover opportunities',
    text: 'Discover opportunities that align with your skills and goals.',
    details: 'Browse available jobs and internships through the discovery experience. Search and filter opportunities using the criteria that matter to you, then open complete job details before deciding whether to apply.',
    supporting: ['Search opportunities', 'Remote', 'Full-time', 'Internship'],
    visual: DiscoverOpportunitiesVisual,
  },
  {
    number: '04',
    label: 'Next steps',
    title: 'Move forward',
    text: 'Apply, communicate, track progress, and take your next step.',
    details: 'Once you find an opportunity, continue through the employment process from the same platform. Submit applications, communicate when available, monitor progress, and stay aware of important updates as your application moves forward.',
    supporting: ['Applied', 'Reviewed', 'Interview', 'Next step'],
    visual: MoveForwardVisual,
  },
];

export const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stepEls = section.querySelectorAll('.journey-step');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('journey-step--inview');
            const index = Number(entry.target.getAttribute('data-step-index'));
            if (!Number.isNaN(index)) {
              setActiveStep(index);
            }
          } else {
            entry.target.classList.remove('journey-step--inview');
          }
        });
      },
      { threshold: 0.3, rootMargin: '-40px 0px -40px 0px' }
    );

    stepEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-section" ref={sectionRef} aria-labelledby="how-it-works-title">
      <div className="how-header">
        <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slowest, distance: MOTION.distance.lg, direction: 'up' }}>
          <h2 id="how-it-works-title" className="section-title gradient-text gradient-text--subtle how-header__title">
            How it works
          </h2>
        </ScrollReveal>
        <ScrollReveal options={{ threshold: 0.2, once: true, duration: MOTION.duration.slower, distance: MOTION.distance.md, direction: 'up', delay: 100 }}>
          <p className="section-subtitle">
            From creating your profile to discovering the right opportunity, Gradture AI keeps the journey simple.
          </p>
        </ScrollReveal>
      </div>

      <div className="journey">
        <div className="journey__progress" aria-hidden="true">
          <div className="journey__progress-track">
            <div
              className="journey__progress-fill"
              style={{ transform: `scaleX(${(activeStep + 1) / STEPS.length})` }}
            />
          </div>
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className={`journey__progress-dot ${index <= activeStep ? 'journey__progress-dot--active' : ''}`}
              style={{ '--dot-index': index } as Record<string, number>}
            />
          ))}
        </div>

        <div className="journey__steps">
          {STEPS.map((step, index) => {
            const StepVisual = step.visual;
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.number}
                className={`journey-step ${isEven ? 'journey-step--text-left' : 'journey-step--text-right'}`}
                data-step-index={index}
              >
                <div className="journey-step__visual">
                  <ScrollReveal
                    options={{
                      threshold: 0.2,
                      once: true,
                      duration: MOTION.duration.slowest,
                      distance: MOTION.distance.lg,
                      blur: MOTION.blur.md,
                      direction: isEven ? 'left' : 'right',
                    }}
                  >
                    <StepVisual />
                  </ScrollReveal>
                </div>
                <div className="journey-step__content">
                  <StaggerContainer options={{ stagger: MOTION.stagger.sm, once: true }} className="journey-step__text-content">
                    <StaggerChild>
                      <span className="journey-step__label">{step.label}</span>
                    </StaggerChild>
                    <StaggerChild>
                      <span className="journey-step__number">{step.number}</span>
                    </StaggerChild>
                    <StaggerChild>
                      <h3 className="journey-step__title">{step.title}</h3>
                    </StaggerChild>
                    <StaggerChild>
                      <p className="journey-step__text">{step.text}</p>
                    </StaggerChild>
                    <StaggerChild>
                      <p className="journey-step__details">{step.details}</p>
                    </StaggerChild>
                    <StaggerChild>
                      <ul className="journey-step__supporting" aria-label={`${step.title} details`}>
                        {step.supporting.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    </StaggerChild>
                  </StaggerContainer>
                </div>
              </div>
            );
          })}
        </div>
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
          margin-bottom: var(--space-4, 1rem);
        }

        .section-subtitle {
          max-width: var(--container-narrow, 720px);
          margin: 0 auto;
          font-size: var(--text-lg, 1.125rem);
          color: var(--color-text-secondary);
        }

        .journey {
          position: relative;
          max-width: var(--container-max, 1200px);
          margin: 0 auto;
          padding: 0 var(--space-6, 1.5rem);
        }

        .journey__progress {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4, 1rem);
          margin-bottom: var(--space-12, 3rem);
          position: relative;
        }

        .journey__progress-track {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: calc(100% - 48px);
          max-width: 600px;
          height: 3px;
          background: var(--color-border, #e8e2d8);
          border-radius: var(--radius-full, 9999px);
          overflow: hidden;
        }

        .journey__progress-fill {
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary, #4f46e5), var(--color-info, #2563eb));
          border-radius: var(--radius-full, 9999px);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .journey__progress-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-surface, #ffffff);
          border: 2px solid var(--color-border, #e8e2d8);
          position: relative;
          z-index: 1;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .journey__progress-dot--active {
          background: var(--color-primary, #4f46e5);
          border-color: var(--color-primary, #4f46e5);
          transform: scale(1.2);
        }

        .journey__steps {
          display: flex;
          flex-direction: column;
          gap: var(--space-16, 4rem);
        }

        .journey-step {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12, 3rem);
          align-items: center;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .journey-step--inview {
          opacity: 1;
          transform: translateY(0);
        }

        .journey-step__visual {
          position: relative;
        }

        .journey-step__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-3, 0.75rem);
        }

        .journey-step__label {
          display: inline-block;
          font-size: var(--text-xs, 0.75rem);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--color-primary);
          margin-bottom: var(--space-1, 0.25rem);
        }

        .journey-step__number {
          font-size: var(--text-6xl, 3.75rem);
          font-weight: 800;
          line-height: 1;
          color: var(--color-text);
          opacity: 0.08;
          position: absolute;
          top: -1.5rem;
          left: -0.5rem;
          pointer-events: none;
        }

        .journey-step__title {
          font-size: var(--text-3xl, 1.875rem);
          font-weight: 700;
          color: var(--color-text);
          margin: 0;
        }

        .journey-step__text {
          font-size: var(--text-lg, 1.125rem);
          color: var(--color-text-secondary);
          margin: 0;
        }

        .journey-step__details {
          font-size: var(--text-base, 1rem);
          color: var(--color-text-secondary);
          opacity: 0.8;
          margin: 0;
        }

        .journey-step__supporting {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2, 0.5rem);
          margin: var(--space-3, 0.75rem) 0 0 0;
          padding: 0;
          list-style: none;
        }

        .journey-step__supporting li {
          padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
          border-radius: var(--radius-full, 9999px);
          font-size: var(--text-xs, 0.75rem);
          font-weight: 500;
          background: var(--color-primary-soft, #eef2ff);
          color: var(--color-primary);
          border: 1px solid var(--color-primary);
        }

        @media (max-width: 768px) {
          .journey-step {
            grid-template-columns: 1fr;
            gap: var(--space-6, 1.5rem);
          }

          .journey-step__visual {
            order: -1;
          }

          .journey__progress-dot {
            width: 10px;
            height: 10px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .journey-step {
            opacity: 1 !important;
            transform: none !important;
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }

          .journey__progress-fill {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
};
