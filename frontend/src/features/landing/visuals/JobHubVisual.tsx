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
      <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="job-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="job-search" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        <circle cx="200" cy="140" r="120" fill="url(#job-glow)" opacity="0.5" className="job-ambient" />

        <g className="job-search">
          <rect x="40" y="30" width="320" height="32" rx="8" fill="url(#job-search)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="60" cy="46" r="5" stroke="var(--color-text-muted)" strokeWidth="1.5" fill="none" />
          <line x1="64" y1="50" x2="70" y2="56" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <text x="82" y="50" fill="var(--color-text-muted)" fontSize="10">Search opportunities...</text>
          <rect x="310" y="36" width="36" height="20" rx="4" fill="var(--color-primary)" />
          <text x="328" y="50" textAnchor="middle" fill="var(--color-primary-text)" fontSize="9" fontWeight="700">Go</text>
        </g>

        <g className="job-filter">
          <rect x="40" y="74" width="56" height="24" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="68" y="90" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Remote</text>
          <rect x="102" y="74" width="56" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="130" y="90" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Full-time</text>
          <rect x="164" y="74" width="56" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="192" y="90" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Internship</text>
        </g>

        <g className="job-card-1">
          <rect x="40" y="114" width="320" height="40" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="64" cy="134" r="8" fill="var(--color-border)" />
          <text x="84" y="130" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Software Engineer</text>
          <text x="84" y="144" fill="var(--color-text-muted)" fontSize="8">Google · Remote</text>
          <rect x="310" y="126" width="36" height="16" rx="4" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="328" y="138" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontWeight="700">95%</text>
        </g>

        <g className="job-card-2">
          <rect x="40" y="164" width="320" height="40" rx="10" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="64" cy="184" r="8" fill="var(--color-primary)" />
          <text x="84" y="180" fill="var(--color-primary)" fontSize="10" fontWeight="700">Data Analyst</text>
          <text x="84" y="194" fill="var(--color-text-muted)" fontSize="8">Meta · Hybrid</text>
          <rect x="310" y="176" width="36" height="16" rx="4" fill="var(--color-primary)" />
          <text x="328" y="188" textAnchor="middle" fill="var(--color-primary-text)" fontSize="8" fontWeight="700">92%</text>
        </g>

        <g className="job-card-3">
          <rect x="40" y="214" width="320" height="36" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="64" cy="232" r="7" fill="var(--color-border)" />
          <text x="84" y="228" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Product Designer</text>
          <text x="84" y="240" fill="var(--color-text-muted)" fontSize="8">Stripe · On-site</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--jobs .job-ambient,
        .feature-visual--jobs .job-search,
        .feature-visual--jobs .job-filter,
        .feature-visual--jobs .job-card-1,
        .feature-visual--jobs .job-card-2,
        .feature-visual--jobs .job-card-3 {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--jobs.is-animated .job-ambient { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .feature-visual--jobs.is-animated .job-search { opacity: 1; transform: translateY(0); transition-delay: 0.15s; }
        .feature-visual--jobs.is-animated .job-filter { opacity: 1; transform: translateY(0); transition-delay: 0.25s; }
        .feature-visual--jobs.is-animated .job-card-1 { opacity: 1; transform: translateY(0); transition-delay: 0.35s; }
        .feature-visual--jobs.is-animated .job-card-2 { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
        .feature-visual--jobs.is-animated .job-card-3 { opacity: 1; transform: translateY(0); transition-delay: 0.65s; }
      `}</style>
    </div>
  );
};
