import { useInView } from '../../../core/hooks/useInView';

export const CreateAccountVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--account ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="account-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <linearGradient id="account-btn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <radialGradient id="account-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="150" r="140" fill="url(#account-glow)" opacity="0.5" className="acc-glow" />

        <g className="acc-panel">
          <rect x="80" y="40" width="260" height="220" rx="16" fill="url(#account-panel)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="80" y="40" width="260" height="48" rx="16" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="80" y="68" width="260" height="20" fill="var(--color-surface-muted)" stroke="none" />
          <text x="210" y="70" textAnchor="middle" fill="var(--color-text)" fontSize="14" fontWeight="700">Create your account</text>
        </g>

        <g className="acc-avatar">
          <circle cx="210" cy="110" r="18" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="210" cy="106" r="6" fill="var(--color-text-secondary)" />
          <path d="M196 118 Q210 126 224 118" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        <g className="acc-field acc-field--1">
          <rect x="100" y="110" width="220" height="32" rx="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="118" y="130" fill="var(--color-text-muted)" fontSize="10">you@example.com</text>
        </g>

        <g className="acc-field acc-field--2">
          <rect x="100" y="152" width="220" height="32" rx="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="118" y="172" fill="var(--color-text-muted)" fontSize="10">••••••••</text>
        </g>

        <g className="acc-field acc-field--3">
          <rect x="100" y="194" width="220" height="32" rx="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="118" y="214" fill="var(--color-text-muted)" fontSize="10">Your name (optional)</text>
        </g>

        <g className="acc-btn">
          <rect x="100" y="238" width="220" height="14" rx="7" fill="url(#account-btn)" />
          <text x="210" y="250" textAnchor="middle" fill="var(--color-primary-text)" fontSize="11" fontWeight="700">Create account</text>
        </g>

        <g className="acc-check">
          <circle cx="320" cy="60" r="18" fill="var(--color-success-soft)" stroke="var(--color-success)" strokeWidth="1.5" />
          <path d="M 310 60 L 315 65 L 330 50" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>

      <style>{`
        .step-visual--account .acc-glow,
        .step-visual--account .acc-panel,
        .step-visual--account .acc-avatar,
        .step-visual--account .acc-field,
        .step-visual--account .acc-btn,
        .step-visual--account .acc-check {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--account.is-animated .acc-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--account.is-animated .acc-panel { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .step-visual--account.is-animated .acc-avatar { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .step-visual--account.is-animated .acc-field--1 { opacity: 1; transform: scale(1); transition-delay: 0.35s; }
        .step-visual--account.is-animated .acc-field--2 { opacity: 1; transform: scale(1); transition-delay: 0.5s; }
        .step-visual--account.is-animated .acc-field--3 { opacity: 1; transform: scale(1); transition-delay: 0.6s; }
        .step-visual--account.is-animated .acc-btn { opacity: 1; transform: scale(1); transition-delay: 0.75s; }
        .step-visual--account.is-animated .acc-check { opacity: 1; transform: scale(1); transition-delay: 0.9s; }

        @media (prefers-reduced-motion: reduce) {
          .step-visual--account * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
