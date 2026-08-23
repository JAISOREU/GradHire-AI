import { useInView } from '../../../core/hooks/useInView';

export const MoveForwardVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--forward ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="fwd-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-text)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <linearGradient id="fwd-connector" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-text)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <linearGradient id="fwd-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
        </defs>

        <g className="fwd-step fwd-step--1">
          <rect x="36" y="48" width="92" height="52" rx="10" fill="var(--color-surface)" stroke="var(--color-text)" strokeWidth="1.5" />
          <circle cx="82" cy="74" r="11" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-text)" strokeWidth="1.5" />
          <text x="82" y="96" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">Applied</text>
          <text x="82" y="110" textAnchor="middle" fill="var(--color-text)" fontSize="8">Today</text>
        </g>

        <g className="fwd-line fwd-line--1">
          <line x1="128" y1="74" x2="164" y2="74" stroke="url(#fwd-line)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
          <path d="M 164 74 L 158 69 M 164 74 L 158 79" stroke="url(#fwd-line)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--2">
          <rect x="164" y="48" width="92" height="52" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="210" cy="74" r="11" fill="var(--color-surface)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <text x="210" y="96" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">Reviewed</text>
          <text x="210" y="110" textAnchor="middle" fill="var(--color-text)" fontSize="8">Yesterday</text>
        </g>

        <g className="fwd-line fwd-line--2">
          <line x1="256" y1="74" x2="290" y2="74" stroke="url(#fwd-line)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
          <path d="M 290 74 L 284 69 M 290 74 L 284 79" stroke="url(#fwd-line)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--3">
          <rect x="280" y="48" width="84" height="52" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="322" cy="74" r="11" fill="var(--color-surface)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <text x="322" y="96" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">Interview</text>
          <text x="322" y="110" textAnchor="middle" fill="var(--color-text)" fontSize="8">Upcoming</text>
        </g>

        <g className="fwd-line fwd-line--3">
          <line x1="322" y1="100" x2="322" y2="136" stroke="url(#fwd-connector)" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
        </g>

        <g className="fwd-next">
          <rect x="256" y="136" width="130" height="36" rx="10" fill="url(#fwd-card)" stroke="var(--color-text)" strokeWidth="1.5" />
          <circle cx="284" cy="154" r="7" fill="var(--color-success)" />
          <text x="328" y="158" textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="700">Next step</text>
        </g>

        <g className="fwd-status">
          <rect x="82" y="200" width="256" height="28" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="108" cy="214" r="3.5" fill="var(--color-success)" />
          <text x="118" y="218" fill="var(--color-text)" fontSize="10" fontWeight="600">Application in progress</text>
          <rect x="278" y="206" width="44" height="16" rx="4" fill="var(--color-text)" />
          <text x="300" y="218" textAnchor="middle" fill="var(--color-surface)" fontSize="9" fontWeight="700">Active</text>
        </g>
      </svg>

      <style>{`
        .step-visual--forward .fwd-step,
        .step-visual--forward .fwd-line,
        .step-visual--forward .fwd-next,
        .step-visual--forward .fwd-status {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
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
