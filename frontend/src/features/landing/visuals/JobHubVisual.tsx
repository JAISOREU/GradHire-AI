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

export const JobHubVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--jobs ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="job-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="job-card-1">
          <rect x="80" y="30" width="240" height="44" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="100" y="44" width="120" height="7" rx="3.5" fill="var(--color-text-secondary)" />
          <rect x="100" y="56" width="80" height="6" rx="3" fill="var(--color-text-muted)" />
        </g>

        <g className="job-card-2">
          <circle cx="80" cy="76" r="22" fill="url(#job-glow)" />
          <rect x="80" y="95" width="240" height="44" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="100" y="109" width="120" height="7" rx="3.5" fill="var(--color-primary)" />
          <rect x="100" y="121" width="80" height="6" rx="3" fill="var(--color-text-muted)" />
        </g>

        <g className="job-card-3">
          <rect x="80" y="160" width="240" height="44" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="100" y="174" width="120" height="7" rx="3.5" fill="var(--color-text-secondary)" />
          <rect x="100" y="186" width="80" height="6" rx="3" fill="var(--color-text-muted)" />
        </g>

        <g className="job-recommended">
          <rect x="280" y="110" width="90" height="32" rx="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="325" y="130" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Recommended</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--jobs .job-card-1,
        .feature-visual--jobs .job-card-2,
        .feature-visual--jobs .job-card-3,
        .feature-visual--jobs .job-recommended {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .feature-visual--jobs.is-animated .job-card-1 { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
        .feature-visual--jobs.is-animated .job-card-2 { opacity: 1; transform: translateY(0); transition-delay: 0.25s; }
        .feature-visual--jobs.is-animated .job-card-3 { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
        .feature-visual--jobs.is-animated .job-recommended { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
      `}</style>
    </div>
  );
};
