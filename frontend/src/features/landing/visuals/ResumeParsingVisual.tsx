import { useInView } from '../../../core/hooks/useInView';

export const ResumeParsingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--resume ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="resume-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="resume-card" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        <g className="resume-doc">
          <rect x="40" y="40" width="140" height="200" rx="10" fill="url(#resume-card)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <circle cx="70" cy="70" r="12" fill="var(--color-border)" opacity="0.5" />
          <rect x="56" y="90" width="88" height="6" rx="3" fill="var(--color-border)" />
          <rect x="56" y="104" width="60" height="6" rx="3" fill="var(--color-border)" opacity="0.7" />
          <rect x="56" y="124" width="88" height="6" rx="3" fill="var(--color-primary-soft)" />
          <rect x="56" y="138" width="70" height="6" rx="3" fill="var(--color-border)" />
          <rect x="56" y="152" width="80" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
          <rect x="56" y="172" width="88" height="6" rx="3" fill="var(--color-border)" />
          <rect x="56" y="186" width="60" height="6" rx="3" fill="var(--color-border)" opacity="0.7" />
          <rect x="56" y="206" width="70" height="6" rx="3" fill="var(--color-border)" />
        </g>

        <g className="resume-scan">
          <rect x="40" y="40" width="140" height="200" rx="10" fill="url(#resume-scan)" />
          <rect x="40" y="40" width="140" height="2" rx="1" fill="var(--color-primary)" opacity="0.6" className="resume-scan-line" />
        </g>

        <g className="resume-skills">
          <rect x="210" y="60" width="130" height="18" rx="5" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="275" y="73" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">React</text>
          <rect x="210" y="86" width="130" height="18" rx="5" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="275" y="99" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Python</text>
          <rect x="210" y="112" width="130" height="18" rx="5" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="275" y="125" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">SQL</text>
          <rect x="210" y="138" width="130" height="18" rx="5" fill="var(--color-info-soft)" stroke="var(--color-info)" strokeWidth="1" />
          <text x="275" y="151" textAnchor="middle" fill="var(--color-info)" fontSize="9" fontWeight="700">TypeScript</text>
        </g>

        <g className="resume-profile">
          <rect x="210" y="180" width="130" height="60" rx="10" fill="url(#resume-card)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="226" y="196" width="108" height="6" rx="3" fill="var(--color-primary)" />
          <rect x="226" y="210" width="80" height="6" rx="3" fill="var(--color-border)" />
          <rect x="226" y="224" width="60" height="6" rx="3" fill="var(--color-success)" opacity="0.7" />
        </g>

        <g className="resume-arrow">
          <path d="M180 130 L210 130" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="210,130 204,126 204,134" fill="var(--color-primary)" />
        </g>
      </svg>

      <style>{`
        .feature-visual--resume .resume-doc,
        .feature-visual--resume .resume-scan,
        .feature-visual--resume .resume-skills,
        .feature-visual--resume .resume-profile,
        .feature-visual--resume .resume-arrow {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--resume.is-animated .resume-doc { opacity: 1; transform: translateY(0); transition-delay: 0.1s; }
        .feature-visual--resume.is-animated .resume-scan { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
        .feature-visual--resume.is-animated .resume-skills { opacity: 1; transform: translateY(0); transition-delay: 0.5s; }
        .feature-visual--resume.is-animated .resume-arrow { opacity: 1; transform: translateY(0); transition-delay: 0.7s; }
        .feature-visual--resume.is-animated .resume-profile { opacity: 1; transform: translateY(0); transition-delay: 0.9s; }

        .resume-scan-line {
          animation: resume-scan 2.5s ease-in-out infinite;
        }

        @keyframes resume-scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          50% { transform: translateY(196px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--resume * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
