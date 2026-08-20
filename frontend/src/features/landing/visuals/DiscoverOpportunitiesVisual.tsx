import { useInView } from '../../../core/hooks/useInView';

export const DiscoverOpportunitiesVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--discover ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="discover-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <radialGradient id="discover-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="150" r="140" fill="url(#discover-glow)" opacity="0.5" className="disc-glow" />

        <g className="disc-panel">
          <rect x="40" y="20" width="340" height="260" rx="16" fill="url(#discover-panel)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
        </g>

        <g className="disc-search">
          <rect x="60" y="42" width="300" height="36" rx="10" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="80" cy="60" r="6" stroke="var(--color-text-muted, #8c8680)" strokeWidth="1.5" fill="none" />
          <line x1="83" y1="63" x2="88" y2="68" stroke="var(--color-text-muted, #8c8680)" strokeWidth="1.5" strokeLinecap="round" />
          <text x="105" y="64" fill="var(--color-text-muted, #8c8680)" fontSize="11">Search opportunities...</text>
        </g>

        <g className="disc-filter">
          <rect x="60" y="90" width="64" height="28" rx="8" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="92" y="108" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="10" fontWeight="700">Remote</text>
          <rect x="130" y="90" width="64" height="28" rx="8" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <text x="162" y="108" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Full-time</text>
          <rect x="200" y="90" width="64" height="28" rx="8" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <text x="232" y="108" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Internship</text>
          <rect x="270" y="90" width="64" height="28" rx="8" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <text x="302" y="108" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Entry-level</text>
        </g>

        <g className="disc-card disc-card--1">
          <rect x="60" y="130" width="300" height="50" rx="12" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="90" cy="155" r="10" fill="var(--color-border, #e8e2d8)" />
          <text x="112" y="150" fill="var(--color-text-secondary, #5c5852)" fontSize="11" fontWeight="600">Program Manager</text>
          <text x="112" y="166" fill="var(--color-text-muted, #8c8680)" fontSize="10">Remote · Full-time</text>
          <rect x="326" y="145" width="28" height="18" rx="5" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="340" y="158" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">95%</text>
        </g>

        <g className="disc-card disc-card--2">
          <rect x="60" y="190" width="300" height="50" rx="12" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <circle cx="90" cy="215" r="10" fill="var(--color-primary, #4f46e5)" />
          <text x="112" y="210" fill="var(--color-primary, #4f46e5)" fontSize="11" fontWeight="700">Marketing Specialist</text>
          <text x="112" y="226" fill="var(--color-text-muted, #8c8680)" fontSize="10">Hybrid · Full-time</text>
          <rect x="326" y="205" width="28" height="18" rx="5" fill="var(--color-primary, #4f46e5)" />
          <text x="340" y="218" textAnchor="middle" fill="var(--color-primary-text, #ffffff)" fontSize="9" fontWeight="700">92%</text>
        </g>

        <g className="disc-card disc-card--3">
          <rect x="60" y="250" width="300" height="50" rx="12" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="90" cy="275" r="10" fill="var(--color-border, #e8e2d8)" />
          <text x="112" y="270" fill="var(--color-text-secondary, #5c5852)" fontSize="11" fontWeight="600">Operations Coordinator</text>
          <text x="260" y="270" fill="var(--color-text-muted, #8c8680)" fontSize="10">On-site · Contract</text>
          <rect x="326" y="265" width="28" height="18" rx="5" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="340" y="278" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="700">88%</text>
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
