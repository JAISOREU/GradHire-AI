import { useInView } from '../../../core/hooks/useInView';

export const BuildProfileVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--profile ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="prof-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
          <linearGradient id="prof-chip" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
        </defs>

        <g className="prof-card">
          <rect x="130" y="40" width="160" height="180" rx="14" fill="url(#prof-card)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <circle cx="210" cy="80" r="20" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="210" y="118" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">Profile Ready 78%</text>
          <rect x="150" y="130" width="120" height="5" rx="3" fill="var(--color-border, #e8e2d8)" opacity="0.5" />
          <rect x="150" y="148" width="80" height="5" rx="3" fill="var(--color-primary)" opacity="0.8" />
          <rect x="150" y="166" width="120" height="5" rx="3" fill="var(--color-border, #e8e2d8)" opacity="0.5" />
          <rect x="150" y="184" width="90" height="5" rx="3" fill="var(--color-border, #e8e2d8)" opacity="0.4" />
        </g>

        <g className="prof-skill prof-skill--1">
          <rect x="30" y="50" width="80" height="26" rx="7" fill="url(#prof-chip)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="70" y="66" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">React</text>
        </g>

        <g className="prof-skill prof-skill--2">
          <rect x="310" y="50" width="80" height="26" rx="7" fill="url(#prof-chip)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="350" y="66" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">Python</text>
        </g>

        <g className="prof-skill prof-skill--3">
          <rect x="30" y="200" width="80" height="26" rx="7" fill="url(#prof-chip)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="70" y="216" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">SQL</text>
        </g>

        <g className="prof-skill prof-skill--4">
          <rect x="310" y="200" width="80" height="26" rx="7" fill="url(#prof-chip)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="350" y="216" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600">TypeScript</text>
        </g>

        <g className="prof-skill prof-skill--5">
          <rect x="140" y="240" width="70" height="24" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="175" y="256" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Education</text>
        </g>

        <g className="prof-skill prof-skill--6">
          <rect x="220" y="240" width="70" height="24" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
          <text x="255" y="256" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Resume</text>
        </g>

        <g className="prof-conns">
          <line x1="110" y1="63" x2="130" y2="90" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="310" y1="63" x2="290" y2="90" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="110" y1="213" x2="130" y2="180" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="310" y1="213" x2="290" y2="180" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />
          <line x1="210" y1="120" x2="210" y2="140" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
        </g>
      </svg>

      <style>{`
        .step-visual--profile .prof-card,
        .step-visual--profile .prof-skill,
        .step-visual--profile .prof-conns {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
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
