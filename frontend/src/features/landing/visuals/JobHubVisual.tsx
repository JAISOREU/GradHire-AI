import { useInView } from '../../../core/hooks/useInView';

export const JobHubVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--jobs ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="job-search-bg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        <g className="job-search">
          <rect x="40" y="30" width="340" height="32" rx="8" fill="url(#job-search-bg)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="60" cy="46" r="5" stroke="var(--color-text-muted)" strokeWidth="1.5" fill="none" />
          <line x1="63" y1="49" x2="68" y2="54" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <text x="78" y="50" fill="var(--color-text-muted)" fontSize="10">Search opportunities...</text>
          <rect x="330" y="36" width="32" height="20" rx="4" fill="var(--color-primary)" />
          <text x="346" y="50" textAnchor="middle" fill="var(--color-primary-text)" fontSize="9" fontWeight="700">Go</text>
        </g>

        <g className="job-filter">
          <rect x="40" y="74" width="60" height="24" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="70" y="90" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Remote</text>
          <rect x="106" y="74" width="60" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="136" y="90" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Full-time</text>
          <rect x="172" y="74" width="60" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="202" y="90" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Internship</text>
        </g>

        <g className="job-card job-card--1">
          <rect x="40" y="112" width="340" height="40" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="64" cy="132" r="8" fill="var(--color-border)" />
          <text x="84" y="128" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Software Engineer</text>
          <text x="84" y="142" fill="var(--color-text-muted)" fontSize="8">Remote · Full-time</text>
          <rect x="326" y="124" width="36" height="16" rx="4" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="344" y="136" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontWeight="700">95%</text>
        </g>

        <g className="job-card job-card--2">
          <rect x="40" y="162" width="340" height="40" rx="10" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="64" cy="182" r="8" fill="var(--color-primary)" />
          <text x="84" y="178" fill="var(--color-primary)" fontSize="10" fontWeight="700">Data Analyst</text>
          <text x="84" y="192" fill="var(--color-text-muted)" fontSize="8">Hybrid · Full-time</text>
          <rect x="326" y="174" width="36" height="16" rx="4" fill="var(--color-primary)" />
          <text x="344" y="186" textAnchor="middle" fill="var(--color-primary-text)" fontSize="8" fontWeight="700">92%</text>
        </g>

        <g className="job-card job-card--3">
          <rect x="40" y="212" width="340" height="36" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="64" cy="230" r="7" fill="var(--color-border)" />
          <text x="84" y="226" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Product Designer</text>
          <text x="84" y="238" fill="var(--color-text-muted)" fontSize="8">On-site · Contract</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--jobs .job-search,
        .feature-visual--jobs .job-filter,
        .feature-visual--jobs .job-card {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--jobs.is-animated .job-search { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
        .feature-visual--jobs.is-animated .job-filter { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .feature-visual--jobs.is-animated .job-card--1 { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
        .feature-visual--jobs.is-animated .job-card--2 { opacity: 1; transform: translateY(0); transition-delay: 0.45s; }
        .feature-visual--jobs.is-animated .job-card--3 { opacity: 1; transform: translateY(0); transition-delay: 0.6s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--jobs * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
