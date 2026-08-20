import { useInView } from '../../../core/hooks/useInView';

export const PrivacyFirstVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--privacy ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="shield-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shield-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
          <linearGradient id="lock-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" />
          </linearGradient>
        </defs>

        <circle cx="210" cy="140" r="90" fill="url(#shield-glow)" opacity="0.6" className="priv-glow" />

        <g className="priv-shield">
          <rect x="160" y="80" width="100" height="120" rx="20" fill="url(#shield-bg)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" />
          <path d="M210 100 L245 120 L245 165 Q245 185 210 195 Q175 185 175 165 L175 120 Z" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <rect x="198" y="145" width="24" height="20" rx="4" fill="url(#lock-shine)" />
          <path d="M206 145 L206 138 Q206 130 210 130 Q214 130 214 138 L214 145" stroke="var(--color-primary, #4f46e5)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="210" cy="155" r="3" fill="var(--color-surface, #ffffff)" />
          <text x="210" y="230" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="11" fontWeight="700">Encrypted &amp; Secure</text>
        </g>

        <g className="priv-ring priv-ring--1">
          <circle cx="210" cy="140" r="70" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.2" strokeDasharray="4 6" />
        </g>

        <g className="priv-ring priv-ring--2">
          <circle cx="210" cy="140" r="100" fill="none" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.12" strokeDasharray="6 8" />
        </g>

        <g className="priv-badge priv-badge--1">
          <rect x="60" y="60" width="70" height="24" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="78" cy="72" r="3" fill="var(--color-success, #059669)" />
          <text x="88" y="76" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Encrypted</text>
        </g>

        <g className="priv-badge priv-badge--2">
          <rect x="290" y="60" width="70" height="24" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="308" cy="72" r="3" fill="var(--color-success, #059669)" />
          <text x="318" y="76" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Access Control</text>
        </g>

        <g className="priv-badge priv-badge--3">
          <rect x="60" y="200" width="70" height="24" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="78" cy="212" r="3" fill="var(--color-success, #059669)" />
          <text x="88" y="216" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Private</text>
        </g>

        <g className="priv-badge priv-badge--4">
          <rect x="290" y="200" width="70" height="24" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="308" cy="212" r="3" fill="var(--color-success, #059669)" />
          <text x="318" y="216" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Minimal Exposure</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--privacy .priv-glow,
        .feature-visual--privacy .priv-shield,
        .feature-visual--privacy .priv-ring,
        .feature-visual--privacy .priv-badge {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--privacy.is-animated .priv-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .feature-visual--privacy.is-animated .priv-shield { opacity: 1; transform: scale(1); transition-delay: 0.15s; }
        .feature-visual--privacy.is-animated .priv-ring--1 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .feature-visual--privacy.is-animated .priv-ring--2 { opacity: 1; transform: scale(1); transition-delay: 0.45s; }
        .feature-visual--privacy.is-animated .priv-badge--1 { opacity: 1; transform: scale(1); transition-delay: 0.55s; }
        .feature-visual--privacy.is-animated .priv-badge--2 { opacity: 1; transform: scale(1); transition-delay: 0.65s; }
        .feature-visual--privacy.is-animated .priv-badge--3 { opacity: 1; transform: scale(1); transition-delay: 0.75s; }
        .feature-visual--privacy.is-animated .priv-badge--4 { opacity: 1; transform: scale(1); transition-delay: 0.85s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--privacy * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
