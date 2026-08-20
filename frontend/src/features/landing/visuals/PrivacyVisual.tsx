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
          <rect x="155" y="75" width="110" height="130" rx="22" fill="url(#shield-bg)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" />
          <path d="M210 95 L250 118 L250 170 Q250 192 210 205 Q170 192 170 170 L170 118 Z" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <rect x="190" y="148" width="40" height="30" rx="6" fill="url(#lock-shine)" />
          <path d="M200 148 L200 134 Q200 122 210 122 Q220 122 220 134 L220 148" stroke="var(--color-primary, #4f46e5)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <circle cx="210" cy="164" r="4" fill="var(--color-surface, #ffffff)" />
          <text x="210" y="232" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="11" fontWeight="700">Encrypted &amp; Secure</text>
        </g>

        <g className="priv-ring priv-ring--1">
          <circle cx="210" cy="140" r="72" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.2" strokeDasharray="4 6" />
        </g>

        <g className="priv-ring priv-ring--2">
          <circle cx="210" cy="140" r="100" fill="none" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.12" strokeDasharray="6 8" />
        </g>

        <g className="priv-badge priv-badge--1">
          <rect x="55" y="55" width="80" height="26" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="74" cy="68" r="3" fill="var(--color-success, #059669)" />
          <text x="86" y="72" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Encrypted</text>
        </g>

        <g className="priv-badge priv-badge--2">
          <rect x="285" y="55" width="80" height="26" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="304" cy="68" r="3" fill="var(--color-success, #059669)" />
          <text x="316" y="72" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Access Control</text>
        </g>

        <g className="priv-badge priv-badge--3">
          <rect x="55" y="210" width="80" height="26" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="74" cy="222" r="3" fill="var(--color-success, #059669)" />
          <text x="86" y="226" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Private</text>
        </g>

        <g className="priv-badge priv-badge--4">
          <rect x="285" y="210" width="80" height="26" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="304" cy="222" r="3" fill="var(--color-success, #059669)" />
          <text x="316" y="226" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Minimal Exposure</text>
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
