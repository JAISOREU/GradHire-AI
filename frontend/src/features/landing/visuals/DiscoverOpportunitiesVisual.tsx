import { useInView } from '../../../core/hooks/useInView';

export const DiscoverOpportunitiesVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--discover ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="disc-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <linearGradient id="disc-card" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
        </defs>

        <g className="disc-panel">
          <rect x="40" y="22" width="340" height="246" rx="14" fill="url(#disc-panel)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
        </g>

        <g className="disc-search">
          <rect x="58" y="40" width="304" height="30" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="76" cy="55" r="5" stroke="var(--color-text)" strokeWidth="1.5" fill="none" />
          <line x1="79" y1="58" x2="84" y2="63" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" />
           <text x="96" y="59" fill="var(--color-text)" fontSize="10">Search opportunities...</text>
        </g>

        <g className="disc-filter">
          <rect x="58" y="82" width="58" height="22" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-text)" strokeWidth="1" />
          <text x="87" y="97" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Remote</text>
          <rect x="122" y="82" width="58" height="22" rx="6" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <text x="151" y="97" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600">Full-time</text>
          <rect x="186" y="82" width="58" height="22" rx="6" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <text x="215" y="97" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600">Internship</text>
        </g>

        <g className="disc-card disc-card--1">
          <rect x="58" y="116" width="304" height="38" rx="9" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="80" cy="135" r="7" fill="var(--color-border, #e8e2d8)" />
           <text x="98" y="131" fill="var(--color-text)" fontSize="10" fontWeight="600">Technology Company</text>
           <text x="98" y="144" fill="var(--color-text)" fontSize="9">Remote · Full-time</text>
          <rect x="326" y="128" width="22" height="13" rx="4" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-text)" strokeWidth="1" />
          <text x="337" y="138" textAnchor="middle" fill="var(--color-text)" fontSize="8" fontWeight="700">95%</text>
        </g>

        <g className="disc-card disc-card--2">
          <rect x="58" y="160" width="304" height="38" rx="9" fill="url(#disc-card)" stroke="var(--color-text)" strokeWidth="1.5" />
          <circle cx="80" cy="179" r="7" fill="var(--color-text)" />
          <text x="98" y="175" fill="var(--color-text)" fontSize="10" fontWeight="700">Financial Services</text>
          <text x="98" y="188" fill="var(--color-text)" fontSize="9">Hybrid · Full-time</text>
          <rect x="326" y="172" width="22" height="13" rx="4" fill="var(--color-text)" />
          <text x="337" y="182" textAnchor="middle" fill="var(--color-primary-text, #ffffff)" fontSize="8" fontWeight="700">92%</text>
        </g>

        <g className="disc-card disc-card--3">
          <rect x="58" y="204" width="304" height="38" rx="9" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="80" cy="223" r="7" fill="var(--color-border, #e8e2d8)" />
          <text x="98" y="219" fill="var(--color-text)" fontSize="10" fontWeight="600">Design Studio</text>
          <text x="230" y="219" fill="var(--color-text)" fontSize="9">On-site · Contract</text>
        </g>
      </svg>

      <style>{`
        .step-visual--discover .disc-panel,
        .step-visual--discover .disc-search,
        .step-visual--discover .disc-filter,
        .step-visual--discover .disc-card {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--discover.is-animated .disc-panel { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
        .step-visual--discover.is-animated .disc-search { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .step-visual--discover.is-animated .disc-filter { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
        .step-visual--discover.is-animated .disc-card--1 { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
        .step-visual--discover.is-animated .disc-card--2 { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }
        .step-visual--discover.is-animated .disc-card--3 { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }

        @media (prefers-reduced-motion: reduce) {
          .step-visual--discover * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
