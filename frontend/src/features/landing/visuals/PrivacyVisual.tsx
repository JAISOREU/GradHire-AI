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
          <linearGradient id="priv-conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <circle cx="210" cy="140" r="90" fill="url(#shield-glow)" opacity="0.6" className="priv-glow" />

        <g className="priv-shield">
          <rect x="175" y="95" width="70" height="100" rx="16" fill="url(#shield-bg)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" />
          <path d="M210 102 L240 123 L240 158 Q240 175 210 186 Q180 175 180 158 L180 123 Z" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <rect x="195" y="145" width="30" height="25" rx="4" fill="url(#lock-shine)" />
          <path d="M204 144 L204 125 Q210 105 216 125 L216 144" stroke="var(--color-primary, #4f46e5)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="210" cy="155" r="3" fill="var(--color-surface, #ffffff)" />
           <text x="210" y="210" textAnchor="middle" fill="var(--color-text, #1a1814)" fontSize="11" fontWeight="700">Security</text>
           <text x="210" y="220" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600">08</text>
        </g>

        <g className="priv-ring priv-ring--1">
          <circle cx="210" cy="140" r="72" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.2" strokeDasharray="4 6" />
        </g>

        <g className="priv-ring priv-ring--2">
          <circle cx="210" cy="140" r="100" fill="none" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.12" strokeDasharray="6 8" />
        </g>

        <g className="priv-badge priv-badge--1">
          <rect x="45" y="38" width="90" height="28" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="62" cy="52" r="3.5" fill="var(--color-success, #059669)" />
           <text x="80" y="56" textAnchor="start" fill="var(--color-text)" fontSize="10" fontWeight="700">Encrypted</text>
        </g>

        <g className="priv-badge priv-badge--2">
          <rect x="45" y="200" width="90" height="28" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="62" cy="214" r="3.5" fill="var(--color-success, #059669)" />
           <text x="80" y="218" textAnchor="start" fill="var(--color-text)" fontSize="10" fontWeight="700">Private</text>
        </g>

        <g className="priv-badge priv-badge--3">
          <rect x="295" y="38" width="90" height="40" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="312" cy="54" r="3.5" fill="var(--color-success, #059669)" />
           <text x="340" y="52" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">Access</text>
           <text x="340" y="68" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">Control</text>
        </g>

        <g className="priv-badge priv-badge--4">
          <rect x="295" y="200" width="90" height="40" rx="6" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="312" cy="216" r="3.5" fill="var(--color-success, #059669)" />
           <text x="340" y="214" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">Minimal</text>
           <text x="340" y="230" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">Exposure</text>
        </g>

        <g className="priv-conns">
          <path d="M135 52 L175 115" stroke="url(#priv-conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M135 214 L175 165" stroke="url(#priv-conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M295 58 L245 118" stroke="url(#priv-conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M295 220 L245 175" stroke="url(#priv-conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
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
        .feature-visual--privacy.is-animated .priv-badge--4 { opacity: 1; transform: scale(1); transition-delay: 0.85s; }
        .feature-visual--privacy.is-animated .priv-conns { opacity: 1; transform: scale(1); transition-delay: 0.9s; }

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
