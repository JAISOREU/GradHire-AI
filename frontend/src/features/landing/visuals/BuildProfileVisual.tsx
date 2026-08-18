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
      <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="profile-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-soft)" />
            <stop offset="100%" stopColor="var(--color-info-soft)" />
          </linearGradient>
          <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <radialGradient id="profile-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="140" r="120" fill="url(#profile-glow)" opacity="0.6" className="prof-glow" />

        <g className="prof-card">
          <rect x="150" y="60" width="100" height="120" rx="12" fill="url(#profile-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="200" cy="92" r="18" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="200" y="124" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Profile Ready</text>
          <rect x="164" y="134" width="72" height="5" rx="2.5" fill="var(--color-border)" opacity="0.6" />
          <rect x="170" y="144" width="60" height="5" rx="2.5" fill="var(--color-border)" opacity="0.4" />
        </g>

        <g className="prof-skill prof-skill--1">
          <rect x="40" y="70" width="70" height="24" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="75" y="86" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">React</text>
        </g>

        <g className="prof-skill prof-skill--2">
          <rect x="290" y="70" width="70" height="24" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="325" y="86" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Python</text>
        </g>

        <g className="prof-skill prof-skill--3">
          <rect x="40" y="170" width="70" height="24" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="75" y="186" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">SQL</text>
        </g>

        <g className="prof-skill prof-skill--4">
          <rect x="290" y="170" width="70" height="24" rx="6" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="325" y="186" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Resume</text>
        </g>

        <g className="prof-conns">
          <line x1="110" y1="82" x2="150" y2="92" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="250" y1="92" x2="290" y2="82" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="110" y1="182" x2="150" y2="130" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="250" y1="130" x2="290" y2="182" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
        </g>
      </svg>

      <style>{`
        .step-visual--profile .prof-glow,
        .step-visual--profile .prof-card,
        .step-visual--profile .prof-skill,
        .step-visual--profile .prof-conns {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--profile.is-animated .prof-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--profile.is-animated .prof-card { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .step-visual--profile.is-animated .prof-skill--1 { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .step-visual--profile.is-animated .prof-skill--2 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .step-visual--profile.is-animated .prof-skill--3 { opacity: 1; transform: scale(1); transition-delay: 0.4s; }
        .step-visual--profile.is-animated .prof-skill--4 { opacity: 1; transform: scale(1); transition-delay: 0.5s; }
        .step-visual--profile.is-animated .prof-conns { opacity: 1; transform: scale(1); transition-delay: 0.6s; }
      `}</style>
    </div>
  );
};
