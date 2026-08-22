import { useRef, useEffect } from 'react';
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const stepEls = section.querySelectorAll('.journey-step');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('journey-step--inview');
          } else {
            entry.target.classList.remove('journey-step--inview');
          }
        });
      },
      { threshold: 0.1 }
    );

    stepEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="how-section" ref={sectionRef} aria-labelledby="how-it-works-title">
      <div className="how-header">
        <h2 id="how-it-works-title" className="section-title gradient-text gradient-text--subtle how-header__title">How it works</h2>
        <p className="section-subtitle">From creating your profile to discovering the right opportunity, Gradture AI keeps the journey simple.</p>
      </div>

      <div className="journey">
        <div className="journey__steps">
          {STEPS.map((step, index) => {
            const StepVisual = step.visual;
            const isEven = index % 2 === 0;

            return (
              <div
                key={step.number}
                className={`journey-step ${isEven ? 'journey-step--text-left' : 'journey-step--text-right'}`}
              >
                <div className="journey-step__visual">
                  <StepVisual />
                </div>
                <div className="journey-step__content">
                  <span className="journey-step__label">{step.label}</span>
                  <span className="journey-step__number">{step.number}</span>
                  <h3 className="journey-step__title">{step.title}</h3>
                  <p className="journey-step__text">{step.text}</p>
                  <p className="journey-step__details">{step.details}</p>
                  <ul className="journey-step__supporting" aria-label={`${step.title} details`}>
                    {step.supporting.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
