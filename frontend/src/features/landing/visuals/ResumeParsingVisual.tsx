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
          <rect x="40" y="30" width="170" height="220" rx="12" fill="url(#resume-gradient)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="75" cy="65" r="14" fill="var(--color-border, #e8e2d8)" opacity="0.5" />
          <rect x="58" y="90" width="100" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="58" y="106" width="70" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" opacity="0.7" />
          <rect x="58" y="130" width="100" height="7" rx="3.5" fill="var(--color-primary-soft, #eef2ff)" />
          <rect x="58" y="146" width="80" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="58" y="162" width="90" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" opacity="0.6" />
          <rect x="58" y="186" width="100" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="58" y="202" width="70" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" opacity="0.7" />
          <rect x="58" y="226" width="80" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
        </g>

        <g className="resume-scan">
          <rect x="40" y="30" width="170" height="220" rx="12" fill="url(#scan-gradient)" />
          <rect x="40" y="30" width="170" height="2" rx="1" fill="var(--color-primary, #4f46e5)" opacity="0.6" className="resume-scan-line" />
        </g>

        <g className="resume-skill-tags">
          <rect x="240" y="50" width="140" height="22" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="310" y="65" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">Leadership</text>
          <rect x="240" y="80" width="140" height="22" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="310" y="95" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">Communication</text>
          <rect x="240" y="110" width="140" height="22" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="310" y="125" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">Problem Solving</text>
          <rect x="240" y="140" width="140" height="22" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
          <text x="310" y="155" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="9" fontWeight="700">Teamwork</text>
        </g>

        <g className="resume-arrow">
          <path d="M 210 130 L 240 130" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="240,130 234,126 234,134" fill="var(--color-primary, #4f46e5)" />
        </g>

        <g className="resume-profile">
          <rect x="240" y="180" width="140" height="70" rx="12" fill="url(#resume-gradient)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <rect x="256" y="198" width="108" height="7" rx="3.5" fill="var(--color-primary, #4f46e5)" />
          <rect x="256" y="214" width="80" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="256" y="230" width="60" height="7" rx="3.5" fill="var(--color-success, #059669)" opacity="0.7" />
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
          50% { transform: translateY(220px); }
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
