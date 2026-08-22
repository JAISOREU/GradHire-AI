import { useInView } from '../../../core/hooks/useInView';

export const CreateAccountVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--account ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="acc-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <linearGradient id="acc-btn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <g className="acc-panel">
          <rect x="70" y="20" width="280" height="250" rx="16" fill="url(#acc-panel)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="70" y="20" width="280" height="44" rx="16" fill="var(--color-surface-muted)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="70" y="52" width="280" height="12" fill="var(--color-surface-muted)" stroke="none" />
          <text x="210" y="48" textAnchor="middle" fill="var(--color-text)" fontSize="13" fontWeight="700">Create your account</text>
        </g>

        <g className="acc-avatar">
          <circle cx="210" cy="92" r="16" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="210" cy="88" r="5" fill="var(--color-text)" />
          <path d="M198 100 Q210 107 222 100" stroke="var(--color-text)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        <g className="acc-field acc-field--1">
          <rect x="92" y="118" width="236" height="28" rx="7" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="108" y="136" fill="var(--color-text)" fontSize="10">you@example.com</text>
        </g>

        <g className="acc-field acc-field--2">
          <rect x="92" y="154" width="236" height="28" rx="7" fill="var(--color-surface)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="108" y="172" fill="var(--color-text)" fontSize="10">••••••••</text>
        </g>

        <g className="acc-field acc-field--3">
          <rect x="92" y="190" width="236" height="28" rx="7" fill="var(--color-surface)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="108" y="208" fill="var(--color-text)" fontSize="10">Your name (optional)</text>
        </g>

        <g className="acc-btn">
          <rect x="92" y="228" width="236" height="22" rx="7" fill="url(#acc-btn)" />
          <text x="210" y="243" textAnchor="middle" fill="var(--color-primary-text, #ffffff)" fontSize="10" fontWeight="700">Create account</text>
        </g>

        <g className="acc-check">
          <circle cx="330" cy="36" r="14" fill="var(--color-success-soft, #ecfdf5)" stroke="var(--color-text)" strokeWidth="1.5" />
          <path d="M 322 36 L 327 41 L 338 30" stroke="var(--color-text)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="326" y="78" textAnchor="end" fill="var(--color-text)" fontSize="8" fontWeight="700">Account created</text>
        </g>
      </svg>

      <style>{`
        .step-visual--account .acc-panel,
        .step-visual--account .acc-avatar,
        .step-visual--account .acc-field,
        .step-visual--account .acc-btn,
        .step-visual--account .acc-check {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
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
