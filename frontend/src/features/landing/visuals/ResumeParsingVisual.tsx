import { useInView } from '../../../core/hooks/useInView';

export const ResumeParsingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--resume ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="scan-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="resume-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <linearGradient id="skill-tag" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
        </defs>

        <g className="resume-document">
          <rect x="50" y="40" width="150" height="200" rx="10" fill="url(#resume-gradient)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="80" cy="70" r="12" fill="var(--color-border, #e8e2d8)" opacity="0.5" />
          <rect x="66" y="90" width="88" height="6" rx="3" fill="var(--color-border, #e8e2d8)" />
          <rect x="66" y="104" width="60" height="6" rx="3" fill="var(--color-border, #e8e2d8)" opacity="0.7" />
          <rect x="66" y="124" width="88" height="6" rx="3" fill="var(--color-primary-soft, #eef2ff)" />
          <rect x="66" y="138" width="70" height="6" rx="3" fill="var(--color-border, #e8e2d8)" />
          <rect x="66" y="152" width="80" height="6" rx="3" fill="var(--color-border, #e8e2d8)" opacity="0.6" />
          <rect x="66" y="172" width="88" height="6" rx="3" fill="var(--color-border, #e8e2d8)" />
          <rect x="66" y="186" width="60" height="6" rx="3" fill="var(--color-border, #e8e2d8)" opacity="0.7" />
          <rect x="66" y="206" width="70" height="6" rx="3" fill="var(--color-border, #e8e2d8)" />
        </g>

        <g className="resume-scan">
          <rect x="50" y="40" width="150" height="200" rx="10" fill="url(#scan-gradient)" />
          <rect x="50" y="40" width="150" height="2" rx="1" fill="var(--color-primary, #4f46e5)" opacity="0.6" className="resume-scan-line" />
        </g>

        <g className="resume-skill-tags">
          <rect x="230" y="60" width="140" height="20" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="300" y="74" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">React</text>
          <rect x="230" y="88" width="140" height="20" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="300" y="102" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">Python</text>
          <rect x="230" y="116" width="140" height="20" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="300" y="130" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">SQL</text>
          <rect x="230" y="144" width="140" height="20" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
          <text x="300" y="158" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="9" fontWeight="700">TypeScript</text>
        </g>

        <g className="resume-arrow">
          <path d="M 200 130 L 230 130" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="230,130 224,126 224,134" fill="var(--color-primary, #4f46e5)" />
        </g>

        <g className="resume-profile">
          <rect x="230" y="180" width="140" height="60" rx="10" fill="url(#resume-gradient)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <rect x="246" y="196" width="108" height="6" rx="3" fill="var(--color-primary, #4f46e5)" />
          <rect x="246" y="210" width="80" height="6" rx="3" fill="var(--color-border, #e8e2d8)" />
          <rect x="246" y="224" width="60" height="6" rx="3" fill="var(--color-success, #059669)" opacity="0.7" />
        </g>
      </svg>

      <style>{`
        .feature-visual--resume .resume-document { opacity: 0; transform: translateX(-10px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .feature-visual--resume .resume-scan { opacity: 0; transition: opacity 0.6s ease; }
        .feature-visual--resume .resume-skill-tags { opacity: 0; transform: translateX(10px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .feature-visual--resume .resume-arrow { opacity: 0; transition: opacity 0.6s ease; }
        .feature-visual--resume .resume-profile { opacity: 0; transform: translateX(10px); transition: opacity 0.6s ease, transform 0.6s ease; }

        .feature-visual--resume.is-animated .resume-document { opacity: 1; transform: translateX(0); transition-delay: 0.1s; }
        .feature-visual--resume.is-animated .resume-scan { opacity: 1; transition-delay: 0.3s; }
        .feature-visual--resume.is-animated .resume-skill-tags { opacity: 1; transform: translateX(0); transition-delay: 0.5s; }
        .feature-visual--resume.is-animated .resume-arrow { opacity: 1; transition-delay: 0.7s; }
        .feature-visual--resume.is-animated .resume-profile { opacity: 1; transform: translateX(0); transition-delay: 0.9s; }

        .resume-scan-line {
          animation: resume-scan 2.5s ease-in-out infinite;
          transform-origin: center;
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

