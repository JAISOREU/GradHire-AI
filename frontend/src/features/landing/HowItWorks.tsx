import { useRef, useEffect, useState, useCallback } from 'react';
import { CreateAccountVisual } from './visuals/CreateAccountVisual';
import { BuildProfileVisual } from './visuals/BuildProfileVisual';
import { DiscoverOpportunitiesVisual } from './visuals/DiscoverOpportunitiesVisual';
import { MoveForwardVisual } from './visuals/MoveForwardVisual';

const STEPS = [
  {
    number: '01',
    title: 'Create account',
    text: 'Create your account and get started in minutes.',
    visual: CreateAccountVisual,
  },
  {
    number: '02',
    title: 'Build your profile',
    text: 'Add your skills, experience, resume, and career preferences.',
    visual: BuildProfileVisual,
  },
  {
    number: '03',
    title: 'Discover opportunities',
    text: 'Discover opportunities that align with your skills and goals.',
    visual: DiscoverOpportunitiesVisual,
  },
  {
    number: '04',
    title: 'Move forward',
    text: 'Apply, communicate, track progress, and take your next step.',
    visual: MoveForwardVisual,
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndexRef = useRef(0);

  const updateProgress = useCallback(() => {
    const windowHeight = window.innerHeight;
    let maxProgress = -Infinity;
    let maxIndex = 0;

    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const start = windowHeight;
      const end = windowHeight * 0.2;
      const raw = (start - center) / (start - end);
      const p = clamp(raw, 0, 1);
      if (p > maxProgress) {
        maxProgress = p;
        maxIndex = i;
      }
    });

    if (activeIndexRef.current !== maxIndex) {
      activeIndexRef.current = maxIndex;
      setActiveStep(maxIndex);
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stepEls = section.querySelectorAll('.journey-step');

    stepEls.forEach((el, i) => {
      stepRefs.current[i] = el as HTMLDivElement;
    });

    const handleScroll = () => {
      requestAnimationFrame(updateProgress);
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
      { threshold: 0.2 }
    );

    stepEls.forEach((el) => observer.observe(el));
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [updateProgress]);

  useEffect(() => {
    const stepEls = sectionRef.current?.querySelectorAll('.journey-step');
    if (!stepEls) return;

    stepEls.forEach((el, i) => {
      (el as HTMLElement).classList.toggle('journey-step--active', i <= activeStep);
    });
  }, [activeStep]);

  return (
    <section className="how-section" ref={sectionRef} aria-labelledby="how-it-works-title">
      <div className="how-header">
        <h2 id="how-it-works-title" className="section-title gradient-text gradient-text--subtle">How it works</h2>
        <p className="section-subtitle">From creating your profile to discovering the right opportunity, Gradture AI keeps the journey simple.</p>
      </div>

      <div className="journey">
        <div className="journey__track" aria-hidden="true">
          <div className="journey__line" style={{ '--track-progress': `${activeStep / (STEPS.length - 1)}` } as React.CSSProperties} />
        </div>

        <div className="journey__steps">
          {STEPS.map((step, index) => {
            const StepVisual = step.visual;
            const isActive = index === activeStep;
            const isPast = index < activeStep;
            const isLast = index === STEPS.length - 1;

            return (
              <div
                key={step.number}
                ref={(el) => { stepRefs.current[index] = el; }}
                className={`journey-step ${isActive ? 'journey-step--active' : ''} ${isPast ? 'journey-step--past' : ''}`}
                style={{ '--step-index': index } as React.CSSProperties}
              >
                <div className="journey-step__visual">
                  <StepVisual />
                </div>
                <div className="journey-step__marker-group">
                  <div className="journey-step__marker">
                    <span className="journey-step__number">{step.number}</span>
                  </div>
                  {!isLast && (
                    <div className="journey-step__connector">
                      <div className="journey-step__connector-line" />
                    </div>
                  )}
                </div>
                <div className="journey-step__content">
                  <h3 className={`journey-step__title ${isActive ? 'gradient-text' : ''}`}>{step.title}</h3>
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
