import { useInView } from '../../../core/hooks/useInView';

export const SkillMatchingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--skills ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="skill-chip-candidate" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <linearGradient id="skill-chip-job" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
          <linearGradient id="match-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" />
          </linearGradient>
          <radialGradient id="match-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="140" r="90" fill="url(#match-glow)" opacity="0.6" className="skill-glow" />

        <g className="skill-group skill-group--candidate">
          <rect x="20" y="30" width="140" height="22" rx="6" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="90" y="46" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Your skills</text>

          <rect x="30" y="64" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="85" y="81" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Leadership</text>
          <circle cx="132" cy="77" r="6" fill="var(--color-success, #059669)" />
          <path d="M128 77 L131 80 L136 74" stroke="var(--color-surface, #ffffff)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          <rect x="30" y="98" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="85" y="115" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Communication</text>
          <circle cx="132" cy="111" r="6" fill="var(--color-success, #059669)" />
          <path d="M128 111 L131 114 L136 108" stroke="var(--color-surface, #ffffff)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          <rect x="30" y="132" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="85" y="149" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Project Mgmt</text>
          <circle cx="132" cy="145" r="6" fill="var(--color-success, #059669)" />
          <path d="M128 145 L131 148 L136 142" stroke="var(--color-surface, #ffffff)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          <rect x="30" y="166" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="85" y="183" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Teamwork</text>
          <circle cx="132" cy="179" r="6" fill="var(--color-border, #e8e2d8)" />
        </g>

        <g className="skill-group skill-group--job">
          <rect x="260" y="30" width="140" height="22" rx="6" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="330" y="46" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Role requirements</text>

          <rect x="270" y="64" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="325" y="81" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="10" fontWeight="700">Leadership</text>
          <circle cx="372" cy="77" r="6" fill="var(--color-success, #059669)" />
          <path d="M368 77 L371 80 L376 74" stroke="var(--color-surface, #ffffff)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          <rect x="270" y="98" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="325" y="115" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="10" fontWeight="700">Communication</text>
          <circle cx="372" cy="111" r="6" fill="var(--color-success, #059669)" />
          <path d="M368 111 L371 114 L376 108" stroke="var(--color-surface, #ffffff)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          <rect x="270" y="132" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="325" y="149" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Problem Solving</text>
          <circle cx="372" cy="145" r="6" fill="var(--color-border, #e8e2d8)" />

          <rect x="270" y="166" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="325" y="183" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Customer Service</text>
          <circle cx="372" cy="179" r="6" fill="var(--color-border, #e8e2d8)" />
        </g>

        <g className="skill-conns">
          <path d="M140 77 L270 77" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.9" />
          <path d="M140 111 L270 111" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.9" />
          <path d="M140 145 L270 145" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.9" />
          <path d="M140 179 L270 179" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.5" />
        </g>

        <g className="match-badge">
          <circle cx="210" cy="140" r="44" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="210" cy="140" r="36" fill="none" stroke="url(#match-ring)" strokeWidth="4" strokeDasharray="180" strokeDashoffset="28" strokeLinecap="round" transform="rotate(-90 210 140)" />
          <text x="210" y="136" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="16" fontWeight="700">75%</text>
          <text x="210" y="152" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Profile Match</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--skills .skill-group,
        .feature-visual--skills .skill-conns,
        .feature-visual--skills .match-badge,
        .feature-visual--skills .skill-glow {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--skills.is-animated .skill-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .feature-visual--skills.is-animated .skill-group--candidate { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .feature-visual--skills.is-animated .skill-group--job { opacity: 1; transform: scale(1); transition-delay: 0.25s; }
        .feature-visual--skills.is-animated .skill-conns { opacity: 1; transform: scale(1); transition-delay: 0.4s; }
        .feature-visual--skills.is-animated .match-badge { opacity: 1; transform: scale(1); transition-delay: 0.55s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--skills * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
