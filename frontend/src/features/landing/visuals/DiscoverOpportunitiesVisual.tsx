import { useInView } from '../../../core/hooks/useInView';

export const DiscoverOpportunitiesVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--discover ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="discover-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <radialGradient id="discover-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="150" r="140" fill="url(#discover-glow)" opacity="0.5" className="disc-glow" />

        <g className="disc-panel">
          <rect x="50" y="30" width="320" height="240" rx="14" fill="url(#discover-panel)" stroke="var(--color-border-strong)" strokeWidth="1" />
        </g>

        <g className="disc-search">
          <rect x="70" y="50" width="280" height="32" rx="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="88" cy="66" r="5" stroke="var(--color-text-muted)" strokeWidth="1.5" fill="none" />
          <line x1="91" y1="69" x2="96" y2="74" stroke="var(--color-text-muted)" strokeWidth="1.5" strokeLinecap="round" />
          <text x="110" y="70" fill="var(--color-text-muted)" fontSize="10">Search opportunities...</text>
        </g>

        <g className="disc-filter">
          <rect x="70" y="92" width="60" height="24" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="100" y="108" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Remote</text>
          <rect x="136" y="92" width="60" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="166" y="108" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Full-time</text>
          <rect x="202" y="92" width="60" height="24" rx="6" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <text x="232" y="108" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Internship</text>
        </g>

        <g className="disc-card disc-card--1">
          <rect x="70" y="128" width="280" height="42" rx="10" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="94" cy="149" r="8" fill="var(--color-border)" />
          <text x="114" y="145" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Software Engineer</text>
          <text x="114" y="159" fill="var(--color-text-muted)" fontSize="9">Remote · Full-time</text>
          <rect x="306" y="141" width="24" height="14" rx="4" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="318" y="151" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontWeight="700">95%</text>
        </g>

        <g className="disc-card disc-card--2">
          <rect x="70" y="180" width="280" height="42" rx="10" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="94" cy="201" r="8" fill="var(--color-primary)" />
          <text x="114" y="197" fill="var(--color-primary)" fontSize="10" fontWeight="700">Data Analyst</text>
          <text x="114" y="211" fill="var(--color-text-muted)" fontSize="9">Hybrid · Full-time</text>
          <rect x="306" y="193" width="24" height="14" rx="4" fill="var(--color-primary)" />
          <text x="318" y="203" textAnchor="middle" fill="var(--color-primary-text)" fontSize="8" fontWeight="700">92%</text>
        </g>

        <g className="disc-card disc-card--3">
          <rect x="70" y="232" width="280" height="28" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="94" cy="246" r="6" fill="var(--color-border)" />
          <text x="114" y="244" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Product Designer</text>
          <text x="240" y="244" fill="var(--color-text-muted)" fontSize="9">On-site · Contract</text>
        </g>
      </svg>

      <style>{`
        .step-visual--discover .disc-glow,
        .step-visual--discover .disc-panel,
        .step-visual--discover .disc-search,
        .step-visual--discover .disc-filter,
        .step-visual--discover .disc-card {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--discover.is-animated .disc-glow { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
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
