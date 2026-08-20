import { useEffect, useRef, useCallback } from 'react';
import { SmartMatchingVisual } from './visuals/SmartMatchingVisual';
import { ResumeParsingVisual } from './visuals/ResumeParsingVisual';
import { JobHubVisual } from './visuals/JobHubVisual';
import { RealTimeNotificationsVisual } from './visuals/RealTimeNotificationsVisual';
import { DirectMessagingVisual } from './visuals/DirectMessagingVisual';
import { ApplicationTrackingVisual } from './visuals/ApplicationTrackingVisual';
import { SkillMatchingVisual } from './visuals/SkillMatchingVisual';
import { PrivacyFirstVisual } from './visuals/PrivacyVisual';

const FEATURES = [
  {
    id: 'ai-matches',
    number: '01',
    label: 'Smart Matching',
    title: 'Smart matches',
    text: 'Find opportunities matched to your skills, interests, and goals — not just keywords.',
  },
  {
    id: 'resume-parsing',
    number: '02',
    label: 'Resume Intelligence',
    title: 'Resume parsing',
    text: 'Upload your resume and Gradture understands it, extracting skills, experience, and education.',
  },
  {
    id: 'job-hub',
    number: '03',
    label: 'Discovery',
    title: 'Job & internship hub',
    text: 'Browse hiring roles and internships from top companies, curated around your profile.',
  },
  {
    id: 'notifications',
    number: '04',
    label: 'Real-time Updates',
    title: 'Real-time notifications',
    text: 'Never miss an application update, interview invite, or message from an employer.',
  },
  {
    id: 'messaging',
    number: '05',
    label: 'Communication',
    title: 'Direct messaging',
    text: 'Chat with employers and get answers faster — all inside the platform.',
  },
  {
    id: 'tracking',
    number: '06',
    label: 'Visibility',
    title: 'Application tracking',
    text: 'See every application status in one clean timeline, from applied to hired.',
  },
  {
    id: 'skill-match',
    number: '07',
    label: 'Skill Graph',
    title: 'Skill matching',
    text: 'We match you to roles based on real skills, giving you a clear recommendation signal.',
  },
  {
    id: 'privacy',
    number: '08',
    label: 'Security',
    title: 'Privacy first',
    text: 'Your data stays secure with encrypted storage, access controls, and minimal exposure.',
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export const WhyGradture = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visualRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressValues = useRef(new Array(FEATURES.length).fill(0));
  const inViewFlags = useRef(new Array(FEATURES.length).fill(false));

  const updateProgress = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;
    const windowHeight = window.innerHeight;

    featureRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const start = windowHeight;
      const end = windowHeight * 0.15;
      const raw = (start - center) / (start - end);
      const p = clamp(raw, 0, 1);
      progressValues.current[i] = p;

      const visualEl = visualRefs.current[i];
      if (visualEl) {
        const eased = easeOut(clamp((p - 0.2) / 0.6, 0, 1));
        visualEl.style.setProperty('--visual-progress', String(eased));
      }
    });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const featureEls = section.querySelectorAll('.feature-story');
    const rafId = { current: 0 };

    featureEls.forEach((el, i) => {
      featureRefs.current[i] = el as HTMLDivElement;
    });

    const handleScroll = () => {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(updateProgress);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Array.from(featureEls).indexOf(entry.target);
          if (index === -1) return;
          if (entry.isIntersecting) {
            inViewFlags.current[index] = true;
            entry.target.classList.add('feature-story--inview');
          } else {
            inViewFlags.current[index] = false;
            entry.target.classList.remove('feature-story--inview');
          }
        });
        handleScroll();
      },
      { threshold: 0.1 }
    );

    featureEls.forEach((el) => observer.observe(el));
    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId.current);
      observer.disconnect();
    };
  }, [updateProgress]);

  return (
    <section className="why-section" ref={sectionRef} aria-labelledby="why-gradture-title">
      <div className="why-header">
        <div className="why-header__text">
          <span className="why-header__eyebrow">Platform capabilities</span>
          <h2 id="why-gradture-title" className="why-header__title">
            Why Gradture?
          </h2>
          <p className="why-header__subtitle">
            Everything you need to discover opportunities, showcase your potential, and move your career forward.
          </p>
        </div>
      </div>

      <div className="why-features">
        {FEATURES.map((feature, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={feature.id}
              ref={(el) => { featureRefs.current[index] = el; }}
              className={`feature-story ${isEven ? 'feature-story--text-left' : 'feature-story--text-right'}`}
              style={{ '--feature-index': index } as React.CSSProperties}
            >
              <div className="feature-story__glow" aria-hidden="true" />
              <div className="feature-story__content">
                <div className="feature-story__header">
                  <span className="feature-story__number">{feature.number}</span>
                  <span className="feature-story__label">{feature.label}</span>
                </div>
                <h3 className="feature-story__title">
                  {feature.title.split(' ').map((word, i, arr) => {
                    const isLast = i === arr.length - 1;
                    if (isLast && arr.length > 1) {
                      return (
                        <span key={i} className="gradient-text">
                          {word}{' '}
                        </span>
                      );
                    }
                    return <span key={i}>{word} </span>;
                  })}
                </h3>
                <p className="feature-story__text">{feature.text}</p>
              </div>
              <div className="feature-story__visual" ref={(el) => { visualRefs.current[index] = el; }}>
                {index === 0 && <SmartMatchingVisual />}
                {index === 1 && <ResumeParsingVisual />}
                {index === 2 && <JobHubVisual />}
                 {index === 3 && <RealTimeNotificationsVisual />}
                 {index === 4 && <DirectMessagingVisual />}
                {index === 5 && <ApplicationTrackingVisual />}
                {index === 6 && <SkillMatchingVisual />}
                 {index === 7 && <PrivacyFirstVisual />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
