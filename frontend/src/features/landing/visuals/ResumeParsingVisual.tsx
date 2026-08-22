import { useInView } from '../../../core/hooks/useInView';

export const ResumeParsingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--resume ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="scan-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="resume-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="90%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <linearGradient id="skill-tag" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
        </defs>

        <g className="resume-document">
          <rect x="56" y="47" width="178" height="205" rx="12" fill="url(#resume-gradient)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="105" cy="70" r="20" fill="var(--color-border, #e8e2d8)" opacity="0.5" />
          <rect x="81" y="93" width="120" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="81" y="108" width="98" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" opacity="0.7" />
          <rect x="81" y="131" width="140" height="7" rx="3.5" fill="var(--color-primary-soft, #eef2ff)" />
          <rect x="81" y="146" width="112" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="81" y="160" width="126" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" opacity="0.6" />
          <rect x="81" y="183" width="140" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="81" y="198" width="98" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" opacity="0.7" />
          <rect x="81" y="220" width="112" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
        </g>

        <g className="resume-scan">
          <rect x="56" y="47" width="178" height="205" rx="12" fill="url(#scan-gradient)" />
          <rect x="56" y="47" width="178" height="2" rx="1" fill="var(--color-primary)" opacity="0.6" className="resume-scan-line" />
        </g>

        <g className="resume-skill-tags">
          <rect x="260" y="57" width="112" height="21" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="315" y="70" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Leadership</text>
          <rect x="260" y="84" width="112" height="21" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="315" y="98" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Communication</text>
          <rect x="260" y="112" width="112" height="21" rx="6" fill="url(#skill-tag)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="315" y="126" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Problem Solving</text>
          <rect x="260" y="140" width="112" height="21" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="315" y="154" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Teamwork</text>
        </g>

        <g className="resume-arrow">
          <path d="M235 121 L260 121" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="3 3" />
          <polygon points="251,130 251,113 260,122" fill="var(--color-primary)" />
        </g>

        <g className="resume-profile">
          <rect x="258" y="177" width="112" height="65" rx="12" fill="url(#resume-gradient)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <rect x="268" y="194" width="88" height="7" rx="3.5" fill="var(--color-primary)" />
          <rect x="268" y="209" width="64" height="7" rx="3.5" fill="var(--color-border, #e8e2d8)" />
          <rect x="268" y="224" width="48" height="7" rx="3.5" fill="var(--color-success, #059669)" opacity="0.7" />
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
          50% { transform: translateY(205px); }
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
