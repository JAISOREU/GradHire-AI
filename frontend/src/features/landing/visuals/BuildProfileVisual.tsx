import { useInView } from '../../../core/hooks/useInView';

export const BuildProfileVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--profile ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="profile-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-soft)" />
            <stop offset="100%" stopColor="var(--color-info-soft)" />
          </linearGradient>
          <linearGradient id="chip-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <radialGradient id="profile-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="150" r="140" fill="url(#profile-glow)" opacity="0.6" className="prof-glow" />

        <g className="prof-card">
          <rect x="140" y="50" width="140" height="160" rx="14" fill="url(#profile-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="210" cy="90" r="22" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="210" y="130" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Profile Ready</text>
          <rect x="158" y="142" width="104" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
          <rect x="166" y="154" width="88" height="6" rx="3" fill="var(--color-border)" opacity="0.4" />
          <rect x="158" y="170" width="104" height="6" rx="3" fill="var(--color-primary-soft)" />
          <rect x="166" y="182" width="88" height="6" rx="3" fill="var(--color-border)" opacity="0.5" />
        </g>

        <g className="prof-skill prof-skill--1">
          <rect x="40" y="60" width="80" height="28" rx="7" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="80" y="78" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">React</text>
        </g>

        <g className="prof-skill prof-skill--2">
          <rect x="300" y="60" width="80" height="28" rx="7" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="340" y="78" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Python</text>
        </g>

        <g className="prof-skill prof-skill--3">
          <rect x="40" y="190" width="80" height="28" rx="7" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="80" y="208" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">SQL</text>
        </g>

        <g className="prof-skill prof-skill--4">
          <rect x="300" y="190" width="80" height="28" rx="7" fill="url(#chip-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="340" y="208" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Resume</text>
        </g>

        <g className="prof-skill prof-skill--5">
          <rect x="130" y="240" width="80" height="28" rx="7" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="170" y="256" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">Education</text>
        </g>

        <g className="prof-skill prof-skill--6">
          <rect x="220" y="240" width="80" height="28" rx="7" fill="var(--color-info-soft)" stroke="var(--color-info)" strokeWidth="1" />
          <text x="260" y="256" textAnchor="middle" fill="var(--color-info)" fontSize="10" fontWeight="700">Experience</text>
        </g>

        <g className="prof-conns">
          <line x1="120" y1="74" x2="140" y2="90" stroke="var(--color-primary)" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.6" />
          <line x1="300" y1="74" x2="280" y2="90" stroke="var(--color-primary)" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.6" />
          <line x1="120" y1="204" x2="140" y2="170" stroke="var(--color-primary)" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.6" />
          <line x1="300" y1="204" x2="280" y2="170" stroke="var(--color-primary)" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.6" />
          <line x1="210" y1="130" x2="210" y2="140" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        </g>
      </svg>

      <style>{`
        .step-visual--profile .prof-glow,
        .step-visual--profile .prof-card,
        .step-visual--profile .prof-skill,
        .step-visual--profile .prof-conns {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--profile.is-animated .prof-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--profile.is-animated .prof-card { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .step-visual--profile.is-animated .prof-skill--1 { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .step-visual--profile.is-animated .prof-skill--2 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .step-visual--profile.is-animated .prof-skill--3 { opacity: 1; transform: scale(1); transition-delay: 0.4s; }
        .step-visual--profile.is-animated .prof-skill--4 { opacity: 1; transform: scale(1); transition-delay: 0.5s; }
        .step-visual--profile.is-animated .prof-skill--5 { opacity: 1; transform: scale(1); transition-delay: 0.6s; }
        .step-visual--profile.is-animated .prof-skill--6 { opacity: 1; transform: scale(1); transition-delay: 0.7s; }
        .step-visual--profile.is-animated .prof-conns { opacity: 1; transform: scale(1); transition-delay: 0.8s; }

        @media (prefers-reduced-motion: reduce) {
          .step-visual--profile * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
