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
          <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <circle cx="210" cy="140" r="90" fill="url(#shield-glow)" opacity="0.6" className="priv-glow" />

        <g className="priv-shield">
          <rect x="165" y="85" width="90" height="110" rx="18" fill="url(#shield-bg)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" />
          <path d="M210 105 L245 125 L245 165 Q245 185 210 198 Q175 185 175 165 L175 125 Z" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <rect x="195" y="150" width="30" height="22" rx="5" fill="url(#lock-shine)" />
          <path d="M202 150 L202 138 Q202 128 210 128 Q218 128 218 138 L218 150" stroke="var(--color-primary, #4f46e5)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="210" cy="162" r="3.5" fill="var(--color-surface, #ffffff)" />
          <text x="210" y="220" textAnchor="middle" fill="var(--color-text, #1a1814)" fontSize="11" fontWeight="700">Security</text>
          <text x="210" y="234" textAnchor="middle" fill="var(--color-text-muted, #8c8680)" fontSize="9" fontWeight="600">08</text>
        </g>

        <g className="priv-ring priv-ring--1">
          <circle cx="210" cy="140" r="72" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.2" strokeDasharray="4 6" />
        </g>

        <g className="priv-ring priv-ring--2">
          <circle cx="210" cy="140" r="100" fill="none" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.12" strokeDasharray="6 8" />
        </g>

        <g className="priv-badge priv-badge--1">
          <rect x="45" y="40" width="120" height="55" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="65" cy="58" r="4" fill="var(--color-success, #059669)" />
          <text x="85" y="56" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="700">Encrypted</text>
          <text x="85" y="72" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="700">and Private</text>
        </g>

        <g className="priv-badge priv-badge--2">
          <rect x="285" y="40" width="90" height="55" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="305" cy="58" r="4" fill="var(--color-success, #059669)" />
          <text x="330" y="56" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="700">Access</text>
          <text x="330" y="72" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="700">Control</text>
        </g>

        <g className="priv-badge priv-badge--3">
          <rect x="165" y="215" width="90" height="55" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="185" cy="233" r="4" fill="var(--color-success, #059669)" />
          <text x="210" y="231" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="700">Minimal</text>
          <text x="210" y="247" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="700">Exposure</text>
        </g>

        <g className="priv-conns">
          <path d="M105 80 L165 100" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M330 80 L255 100" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M210 195 L210 215" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
        </g>
      </svg>

      <style>{`
        .feature-visual--privacy .priv-glow,
        .feature-visual--privacy .priv-shield,
        .feature-visual--privacy .priv-ring,
        .feature-visual--privacy .priv-badge,
        .feature-visual--privacy .priv-conns {
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
        .feature-visual--privacy.is-animated .priv-conns { opacity: 1; transform: scale(1); transition-delay: 0.85s; }

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
