import { useInView } from '../../../core/hooks/useInView';

export const AIMatchingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--ai ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="ai-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
          <radialGradient id="ai-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="240" cy="160" r="140" fill="url(#ai-ambient)" opacity="0.6" className="ai-ambient" />

        <g className="ai-core">
          <circle cx="240" cy="160" r="48" fill="url(#ai-core-glow)" opacity="0.6" />
          <circle cx="240" cy="160" r="32" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <circle cx="240" cy="160" r="16" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <circle cx="240" cy="160" r="5" fill="var(--color-primary, #4f46e5)" />
          <circle cx="240" cy="160" r="48" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.35" strokeDasharray="4 3" className="ai-core-ring" />
        </g>

        <g className="ai-skill-chips">
          <rect x="70" y="80" width="80" height="24" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="110" y="96" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">Leadership</text>
          <rect x="70" y="112" width="80" height="24" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="110" y="128" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">Communication</text>
          <rect x="70" y="144" width="80" height="24" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="110" y="160" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="700">Problem Solving</text>

          <rect x="330" y="80" width="80" height="24" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
          <text x="370" y="96" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="9" fontWeight="700">Full-time</text>
          <rect x="330" y="112" width="80" height="24" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
          <text x="370" y="128" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="9" fontWeight="700">Part-time</text>
          <rect x="330" y="144" width="80" height="24" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
          <text x="370" y="160" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="9" fontWeight="700">Remote</text>
        </g>

        <g className="ai-conns">
          <path d="M150 92 L192 140" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M150 124 L192 155" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M150 156 L192 170" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M288 140 L330 92" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M288 155 L330 124" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M288 170 L330 156" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
        </g>

        <g className="ai-you">
          <circle cx="80" cy="238" r="28" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <circle cx="80" cy="230" r="9" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <path d="M66 242 Q80 252 94 242" stroke="var(--color-text-secondary, #5c5852)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <text x="80" y="260" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">You</text>
        </g>

        <g className="ai-match-card">
          <rect x="185" y="220" width="110" height="36" rx="8" fill="url(#badge-grad)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="240" y="242" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="10" fontWeight="700">94% Match</text>
        </g>

        <g className="ai-opp ai-opp--1">
          <circle cx="370" cy="290" r="22" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="354" y="282" width="32" height="5" rx="2.5" fill="var(--color-border, #e8e2d8)" />
          <text x="370" y="312" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Teacher</text>
        </g>

        <g className="ai-opp ai-opp--2">
          <circle cx="400" cy="210" r="22" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="384" y="202" width="32" height="5" rx="2.5" fill="var(--color-border, #e8e2d8)" />
          <text x="400" y="232" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Developer</text>
        </g>

        <g className="ai-opp ai-opp--3">
          <circle cx="440" cy="260" r="22" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="424" y="252" width="32" height="5" rx="2.5" fill="var(--color-border, #e8e2d8)" />
          <text x="440" y="282" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Nurse</text>
        </g>

        <g className="ai-flow-conns">
          <path d="M108 238 L185 238" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="1" />
          <path d="M295 238 L378 210" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="1" />
          <path d="M295 238 L348 290" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="1" />
          <path d="M295 238 L418 260" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="1" />
        </g>
      </svg>

      <style>{`
        .feature-visual--ai .ai-ambient,
        .feature-visual--ai .ai-core,
        .feature-visual--ai .ai-skill-chips,
        .feature-visual--ai .ai-you,
        .feature-visual--ai .ai-opp,
        .feature-visual--ai .ai-conns,
        .feature-visual--ai .ai-match-card,
        .feature-visual--ai .ai-flow-conns {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--ai.is-animated .ai-ambient { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .feature-visual--ai.is-animated .ai-core { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .feature-visual--ai.is-animated .ai-skill-chips { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .feature-visual--ai.is-animated .ai-conns { opacity: 1; transform: scale(1); transition-delay: 0.35s; }
        .feature-visual--ai.is-animated .ai-you { opacity: 1; transform: scale(1); transition-delay: 0.45s; }
        .feature-visual--ai.is-animated .ai-match-card { opacity: 1; transform: scale(1); transition-delay: 0.55s; }
        .feature-visual--ai.is-animated .ai-opp--1 { opacity: 1; transform: scale(1); transition-delay: 0.65s; }
        .feature-visual--ai.is-animated .ai-opp--2 { opacity: 1; transform: scale(1); transition-delay: 0.75s; }
        .feature-visual--ai.is-animated .ai-opp--3 { opacity: 1; transform: scale(1); transition-delay: 0.85s; }
        .feature-visual--ai.is-animated .ai-flow-conns { opacity: 1; transform: scale(1); transition-delay: 0.9s; }

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
