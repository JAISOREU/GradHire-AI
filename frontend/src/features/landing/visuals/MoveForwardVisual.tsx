import { useInView } from '../../../core/hooks/useInView';

export const MoveForwardVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--forward ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="forward-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <linearGradient id="forward-connector" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <radialGradient id="forward-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="140" r="140" fill="url(#forward-glow)" opacity="0.5" className="fwd-glow" />

        <g className="fwd-step fwd-step--1">
          <rect x="40" y="50" width="100" height="56" rx="12" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="90" cy="78" r="12" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="90" y="102" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">Applied</text>
          <text x="90" y="116" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">Today</text>
        </g>

        <g className="fwd-line fwd-line--1">
          <line x1="140" y1="78" x2="180" y2="78" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" />
          <path d="M 180 78 L 174 73 M 180 78 L 174 83" stroke="url(#forward-line)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--2">
          <rect x="180" y="50" width="100" height="56" rx="12" fill="var(--color-surface-muted)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="230" cy="78" r="12" fill="var(--color-surface)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <text x="230" y="102" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Reviewed</text>
          <text x="230" y="116" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">Yesterday</text>
        </g>

        <g className="fwd-line fwd-line--2">
          <line x1="280" y1="78" x2="320" y2="78" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" />
          <path d="M 320 78 L 314 73 M 320 78 L 314 83" stroke="url(#forward-line)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--3">
          <rect x="320" y="50" width="100" height="56" rx="12" fill="var(--color-surface-muted)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="370" cy="78" r="12" fill="var(--color-surface)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <text x="370" y="102" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Interview</text>
          <text x="370" y="116" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">Upcoming</text>
        </g>

        <g className="fwd-line fwd-line--3">
          <line x1="370" y1="106" x2="370" y2="140" stroke="url(#forward-connector)" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" />
        </g>

        <g className="fwd-next">
          <rect x="290" y="140" width="160" height="40" rx="12" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="320" cy="160" r="8" fill="var(--color-success)" />
          <text x="370" y="164" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontWeight="700">Next step</text>
        </g>

        <g className="fwd-status">
          <rect x="90" y="200" width="240" height="32" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="118" cy="216" r="4" fill="var(--color-success)" />
          <text x="130" y="220" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Application in progress</text>
          <rect x="270" y="208" width="48" height="16" rx="4" fill="var(--color-primary)" />
          <text x="294" y="220" textAnchor="middle" fill="var(--color-primary-text, #ffffff)" fontSize="9" fontWeight="700">Active</text>
        </g>
      </svg>

      <style>{`
        .step-visual--forward .fwd-glow,
        .step-visual--forward .fwd-step,
        .step-visual--forward .fwd-line,
        .step-visual--forward .fwd-next,
        .step-visual--forward .fwd-status {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--forward.is-animated .fwd-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--forward.is-animated .fwd-step--1 { opacity: 1; transform: scale(1); transition-delay: 0.15s; }
        .step-visual--forward.is-animated .fwd-line--1 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .step-visual--forward.is-animated .fwd-step--2 { opacity: 1; transform: scale(1); transition-delay: 0.45s; }
        .step-visual--forward.is-animated .fwd-line--2 { opacity: 1; transform: scale(1); transition-delay: 0.6s; }
        .step-visual--forward.is-animated .fwd-step--3 { opacity: 1; transform: scale(1); transition-delay: 0.75s; }
        .step-visual--forward.is-animated .fwd-line--3 { opacity: 1; transform: scale(1); transition-delay: 0.9s; }
        .step-visual--forward.is-animated .fwd-next { opacity: 1; transform: scale(1); transition-delay: 1.05s; }
        .step-visual--forward.is-animated .fwd-status { opacity: 1; transform: scale(1); transition-delay: 1.2s; }

        @media (prefers-reduced-motion: reduce) {
          .step-visual--forward * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

