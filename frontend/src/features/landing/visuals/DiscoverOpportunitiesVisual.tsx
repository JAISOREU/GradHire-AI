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

export const DiscoverOpportunitiesVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--discover ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="discover-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        <g className="disc-panel">
          <rect x="30" y="20" width="260" height="180" rx="12" fill="url(#discover-panel)" stroke="var(--color-border-strong)" strokeWidth="1" />
        </g>

        <g className="disc-search">
          <rect x="45" y="36" width="230" height="24" rx="6" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="58" cy="48" r="4" stroke="var(--color-text-muted)" strokeWidth="1.5" fill="none" />
          <line x1="61" y1="51" x2="66" y2="56" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <text x="76" y="52" fill="var(--color-text-muted)" fontSize="8">Search opportunities...</text>
        </g>

        <g className="disc-card disc-card--1">
          <rect x="45" y="74" width="230" height="34" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="58" y="92" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Software Engineer</text>
          <text x="58" y="102" fill="var(--color-text-muted)" fontSize="7">Remote · Full-time</text>
        </g>

        <g className="disc-card disc-card--2">
          <rect x="45" y="120" width="230" height="34" rx="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="58" y="138" fill="var(--color-primary)" fontSize="9" fontWeight="700">Data Analyst</text>
          <text x="58" y="148" fill="var(--color-text-muted)" fontSize="7">Hybrid · Full-time</text>
          <rect x="230" y="128" width="32" height="12" rx="4" fill="var(--color-primary)" />
          <text x="246" y="137" textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700">92%</text>
        </g>

        <g className="disc-card disc-card--3">
          <rect x="45" y="166" width="230" height="24" rx="6" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="58" y="182" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Product Designer</text>
          <text x="160" y="182" fill="var(--color-text-muted)" fontSize="7">On-site · Contract</text>
        </g>
      </svg>

      <style>{`
        .step-visual--discover .disc-panel,
        .step-visual--discover .disc-search,
        .step-visual--discover .disc-card {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--discover.is-animated .disc-panel { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .step-visual--discover.is-animated .disc-search { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .step-visual--discover.is-animated .disc-card--1 { opacity: 1; transform: translateY(0); transition-delay: 0.35s; }
        .step-visual--discover.is-animated .disc-card--2 { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
        .step-visual--discover.is-animated .disc-card--3 { opacity: 1; transform: translateY(0); transition-delay: 0.65s; }
      `}</style>
    </div>
  );
};
