import { useRef, useEffect, useCallback } from 'react';
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
    visual: CreateAccountVisual,
  },
  {
    number: '02',
    label: 'Your profile',
    title: 'Build your profile',
    text: 'Add your skills, experience, resume, and career preferences.',
    visual: BuildProfileVisual,
  },
  {
    number: '03',
    label: 'Discovery',
    title: 'Discover opportunities',
    text: 'Discover opportunities that align with your skills and goals.',
    visual: DiscoverOpportunitiesVisual,
  },
  {
    number: '04',
    label: 'Next steps',
    title: 'Move forward',
    text: 'Apply, communicate, track progress, and take your next step.',
    visual: MoveForwardVisual,
  },
];

export const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visualRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const windowHeight = window.innerHeight;

    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const start = windowHeight;
      const end = windowHeight * 0.15;
      const raw = (start - center) / (start - end);
      const p = Math.min(Math.max(raw, 0), 1);
      const visualEl = visualRefs.current[i];
      if (visualEl) {
        visualEl.style.setProperty('--visual-progress', String(p));
      }
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stepEls = section.querySelectorAll('.journey-step');
    const rafId = { current: 0 };

    stepEls.forEach((el, i) => {
      stepRefs.current[i] = el as HTMLDivElement;
    });

    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updateProgress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Array.from(stepEls).indexOf(entry.target);
          if (index === -1) return;
          if (entry.isIntersecting) {
            entry.target.classList.add('journey-step--inview');
          } else {
            entry.target.classList.remove('journey-step--inview');
          }
        });
        handleScroll();
      },
      { threshold: 0.1 }
    );

    stepEls.forEach((el) => observer.observe(el));
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [updateProgress]);

  return (
    <section className="how-section" ref={sectionRef} aria-labelledby="how-it-works-title">
      <div className="how-header">
        <h2 id="how-it-works-title" className="section-title gradient-text gradient-text--subtle">How it works</h2>
        <p className="section-subtitle">From creating your profile to discovering the right opportunity, Gradture keeps the journey simple.</p>
      </div>

      <div className="journey">
        <div className="journey__steps">
          {STEPS.map((step, index) => {
            const StepVisual = step.visual;
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.number}
                ref={(el) => { stepRefs.current[index] = el; }}
                className={`journey-step ${isEven ? 'journey-step--text-left' : 'journey-step--text-right'}`}
                style={{ '--step-index': index } as React.CSSProperties}
              >
                <div className="journey-step__visual" ref={(el) => { visualRefs.current[index] = el; }}>
                  <StepVisual />
                </div>
                <div className="journey-step__content">
                  <span className="journey-step__label">{step.label}</span>
                  <span className="journey-step__number">{step.number}</span>
                  <h3 className="journey-step__title">{step.title}</h3>
                  <p className="journey-step__text">{step.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
