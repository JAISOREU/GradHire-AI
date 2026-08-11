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

export const SkillMatchingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--skills ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="skill-chip-candidate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <linearGradient id="skill-chip-job" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft)" />
            <stop offset="100%" stopColor="var(--color-info-soft)" />
          </linearGradient>
          <linearGradient id="match-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <g className="skill-group skill-group--candidate">
          <rect x="30" y="40" width="140" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="100" y="56" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Your skills</text>

          <rect x="50" y="80" width="100" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="100" y="97" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">React</text>

          <rect x="50" y="116" width="100" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="100" y="133" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Python</text>

          <rect x="50" y="152" width="100" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="100" y="169" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">SQL</text>

          <rect x="50" y="188" width="100" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="100" y="205" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">TypeScript</text>
        </g>

        <g className="skill-group skill-group--job">
          <rect x="230" y="40" width="140" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="300" y="56" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Role requirements</text>

          <rect x="250" y="80" width="100" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="300" y="97" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">React</text>

          <rect x="250" y="116" width="100" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="300" y="133" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">TypeScript</text>

          <rect x="250" y="152" width="100" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="300" y="169" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">REST APIs</text>

          <rect x="250" y="188" width="100" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="300" y="205" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Git</text>
        </g>

        <g className="skill-conns">
          <line x1="150" y1="93" x2="250" y2="93" stroke="var(--color-primary)" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.7" />
          <line x1="150" y1="129" x2="250" y2="129" stroke="var(--color-primary)" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.7" />
          <line x1="150" y1="165" x2="250" y2="165" stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <line x1="150" y1="201" x2="250" y2="201" stroke="var(--color-border-strong)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        </g>

        <g className="match-badge">
          <circle cx="200" cy="130" r="28" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="200" cy="130" r="22" fill="none" stroke="url(#match-ring)" strokeWidth="3" strokeDasharray="138" strokeDashoffset="18" strokeLinecap="round" transform="rotate(-90 200 130)" />
          <text x="200" y="126" textAnchor="middle" fill="var(--color-primary)" fontSize="12" fontWeight="700">87%</text>
          <text x="200" y="140" textAnchor="middle" fill="var(--color-text-muted)" fontSize="7" fontWeight="600">Profile Match</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--skills .skill-group,
        .feature-visual--skills .skill-conns,
        .feature-visual--skills .match-badge {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--skills.is-animated .skill-group--candidate { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .feature-visual--skills.is-animated .skill-group--job { opacity: 1; transform: scale(1); transition-delay: 0.25s; }
        .feature-visual--skills.is-animated .skill-conns { opacity: 1; transform: scale(1); transition-delay: 0.4s; }
        .feature-visual--skills.is-animated .match-badge { opacity: 1; transform: scale(1); transition-delay: 0.55s; }
      `}</style>
    </div>
  );
};
