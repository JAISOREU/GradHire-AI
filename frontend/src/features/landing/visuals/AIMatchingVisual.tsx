import { useInView } from '../../../core/hooks/useInView';

export const AIMatchingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--ai ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="ai-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ai-conn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="ai-chip" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft)" />
            <stop offset="100%" stopColor="var(--color-info-soft)" />
          </linearGradient>
        </defs>

        <circle cx="210" cy="140" r="120" fill="url(#ai-core-glow)" opacity="0.5" className="ai-glow" />

        <g className="ai-skill-chips">
          <rect x="40" y="80" width="56" height="20" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="68" y="94" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">React</text>
          <rect x="40" y="108" width="56" height="20" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="68" y="122" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Python</text>
          <rect x="40" y="136" width="56" height="20" rx="6" fill="var(--color-info-soft)" stroke="var(--color-info)" strokeWidth="1" />
          <text x="68" y="150" textAnchor="middle" fill="var(--color-info)" fontSize="9" fontWeight="700">SQL</text>

          <rect x="40" y="172" width="56" height="20" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="68" y="186" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Remote</text>
          <rect x="40" y="200" width="56" height="20" rx="6" fill="var(--color-info-soft)" stroke="var(--color-info)" strokeWidth="1" />
          <text x="68" y="214" textAnchor="middle" fill="var(--color-info)" fontSize="9" fontWeight="700">Full-time</text>
          <rect x="40" y="228" width="56" height="20" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="68" y="242" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Internship</text>
        </g>

        <g className="ai-core">
          <circle cx="210" cy="140" r="44" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="210" cy="140" r="28" fill="url(#ai-chip)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="210" y="144" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontWeight="700">AI</text>
          <text x="210" y="176" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Matching</text>
        </g>

        <g className="ai-opp">
          <circle cx="340" cy="80" r="22" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="326" y="74" width="28" height="5" rx="2.5" fill="var(--color-border)" />
          <text x="340" y="104" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Engineer</text>
        </g>

        <g className="ai-opp">
          <circle cx="350" cy="140" r="22" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="336" y="134" width="28" height="5" rx="2.5" fill="var(--color-border)" />
          <text x="350" y="164" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Analyst</text>
        </g>

        <g className="ai-opp">
          <circle cx="340" cy="200" r="22" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="326" y="194" width="28" height="5" rx="2.5" fill="var(--color-border)" />
          <text x="340" y="224" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Designer</text>
        </g>

        <g className="ai-match">
          <rect x="290" y="30" width="100" height="30" rx="8" fill="url(#ai-chip)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="340" y="50" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">92% Match</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--ai .ai-glow,
        .feature-visual--ai .ai-skill-chips,
        .feature-visual--ai .ai-core,
        .feature-visual--ai .ai-opp,
        .feature-visual--ai .ai-match {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--ai.is-animated .ai-glow { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .feature-visual--ai.is-animated .ai-skill-chips { opacity: 1; transform: translateY(0); transition-delay: 0.15s; }
        .feature-visual--ai.is-animated .ai-core { opacity: 1; transform: translateY(0); transition-delay: 0.3s; }
        .feature-visual--ai.is-animated .ai-opp { opacity: 1; transform: translateY(0); transition-delay: 0.45s; }
        .feature-visual--ai.is-animated .ai-match { opacity: 1; transform: translateY(0); transition-delay: 0.6s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--ai * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
