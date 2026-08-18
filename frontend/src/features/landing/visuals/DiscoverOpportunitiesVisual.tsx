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
      <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="discover-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <radialGradient id="discover-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="140" r="120" fill="url(#discover-glow)" opacity="0.5" className="disc-glow" />

        <g className="disc-panel">
          <rect x="40" y="30" width="320" height="220" rx="14" fill="url(#discover-panel)" stroke="var(--color-border-strong)" strokeWidth="1" />
        </g>

        <g className="disc-search">
          <rect x="60" y="50" width="280" height="28" rx="7" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="76" cy="64" r="4" stroke="var(--color-text-muted)" strokeWidth="1.5" fill="none" />
          <line x1="79" y1="67" x2="84" y2="72" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <text x="96" y="68" fill="var(--color-text-muted)" fontSize="9">Search opportunities...</text>
        </g>

        <g className="disc-card disc-card--1">
          <rect x="60" y="94" width="280" height="38" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="80" cy="113" r="6" fill="var(--color-border)" />
          <text x="96" y="110" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Software Engineer</text>
          <text x="96" y="122" fill="var(--color-text-muted)" fontSize="8">Remote · Full-time</text>
        </g>

        <g className="disc-card disc-card--2">
          <rect x="60" y="144" width="280" height="38" rx="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <circle cx="80" cy="163" r="6" fill="var(--color-primary)" />
          <text x="96" y="160" fill="var(--color-primary)" fontSize="10" fontWeight="700">Data Analyst</text>
          <text x="96" y="172" fill="var(--color-text-muted)" fontSize="8">Hybrid · Full-time</text>
          <rect x="284" y="152" width="36" height="14" rx="4" fill="var(--color-primary)" />
          <text x="302" y="162" textAnchor="middle" fill="var(--color-primary-text)" fontSize="8" fontWeight="700">92%</text>
        </g>

        <g className="disc-card disc-card--3">
          <rect x="60" y="194" width="280" height="32" rx="6" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="80" cy="210" r="5" fill="var(--color-border)" />
          <text x="96" y="208" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Product Designer</text>
          <text x="200" y="208" fill="var(--color-text-muted)" fontSize="8">On-site · Contract</text>
        </g>
      </svg>

      <style>{`
        .step-visual--discover .disc-glow,
        .step-visual--discover .disc-panel,
        .step-visual--discover .disc-search,
        .step-visual--discover .disc-card {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--discover.is-animated .disc-glow { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .step-visual--discover.is-animated .disc-panel { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
        .step-visual--discover.is-animated .disc-search { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .step-visual--discover.is-animated .disc-card--1 { opacity: 1; transform: translateY(0); transition-delay: 0.35s; }
        .step-visual--discover.is-animated .disc-card--2 { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
        .step-visual--discover.is-animated .disc-card--3 { opacity: 1; transform: translateY(0); transition-delay: 0.65s; }
      `}</style>
    </div>
  );
};
