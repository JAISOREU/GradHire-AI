import { useEffect, useRef, useState } from 'react';

const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.2, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

export const BuildProfileVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--profile ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="profile-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-soft)" />
            <stop offset="100%" stopColor="var(--color-info-soft)" />
          </linearGradient>
          <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        <g className="prof-card">
          <rect x="110" y="50" width="100" height="120" rx="10" fill="url(#profile-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="160" cy="80" r="16" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="160" y="110" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="8" fontWeight="600">Profile Ready</text>
        </g>

        <g className="prof-skill prof-skill--1">
          <rect x="30" y="60" width="60" height="22" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="60" y="75" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="8" fontWeight="600">React</text>
        </g>

        <g className="prof-skill prof-skill--2">
          <rect x="230" y="60" width="60" height="22" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="260" y="75" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="8" fontWeight="600">Python</text>
        </g>

        <g className="prof-skill prof-skill--3">
          <rect x="30" y="150" width="60" height="22" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="60" y="165" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="8" fontWeight="600">SQL</text>
        </g>

        <g className="prof-skill prof-skill--4">
          <rect x="230" y="150" width="60" height="22" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="260" y="165" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="8" fontWeight="600">Resume</text>
        </g>

        <g className="prof-conns">
          <line x1="90" y1="71" x2="110" y2="80" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="230" y1="71" x2="210" y2="80" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="90" y1="161" x2="110" y2="130" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="230" y1="161" x2="210" y2="130" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        </g>
      </svg>

      <style>{`
        .step-visual--profile .prof-card,
        .step-visual--profile .prof-skill,
        .step-visual--profile .prof-conns {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--profile.is-animated .prof-card { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--profile.is-animated .prof-skill--1 { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .step-visual--profile.is-animated .prof-skill--2 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .step-visual--profile.is-animated .prof-skill--3 { opacity: 1; transform: scale(1); transition-delay: 0.4s; }
        .step-visual--profile.is-animated .prof-skill--4 { opacity: 1; transform: scale(1); transition-delay: 0.5s; }
        .step-visual--profile.is-animated .prof-conns { opacity: 1; transform: scale(1); transition-delay: 0.6s; }
      `}</style>
    </div>
  );
};
