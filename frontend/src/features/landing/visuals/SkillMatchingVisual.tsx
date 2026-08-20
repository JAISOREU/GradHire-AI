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
        </defs>

        <g className="skill-group skill-group--candidate">
          <rect x="30" y="40" width="150" height="24" rx="6" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="105" y="56" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Your skills</text>

          <rect x="40" y="76" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="95" y="93" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Leadership</text>

          <rect x="40" y="110" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="95" y="127" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Communication</text>

          <rect x="40" y="144" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="95" y="161" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Problem Solving</text>

          <rect x="40" y="178" width="110" height="26" rx="6" fill="url(#skill-chip-candidate)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="95" y="195" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Teamwork</text>
        </g>

        <g className="skill-group skill-group--job">
          <rect x="240" y="40" width="150" height="24" rx="6" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="315" y="56" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Role requirements</text>

          <rect x="250" y="76" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="305" y="93" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="10" fontWeight="700">Leadership</text>

          <rect x="250" y="110" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <text x="305" y="127" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="10" fontWeight="700">Communication</text>

          <rect x="250" y="144" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="305" y="161" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Project Management</text>

          <rect x="250" y="178" width="110" height="26" rx="6" fill="url(#skill-chip-job)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="305" y="195" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="10" fontWeight="600">Customer Service</text>
        </g>

        <g className="skill-conns">
          <path d="M150 89 Q200 89 250 89" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.9" />
          <path d="M150 123 Q200 123 250 123" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.9" />
          <path d="M150 157 Q200 157 250 157" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.9" />
          <path d="M150 191 Q200 191 250 191" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.5" />
        </g>

        <g className="match-badge">
          <circle cx="210" cy="140" r="38" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <circle cx="210" cy="140" r="30" fill="none" stroke="url(#match-ring)" strokeWidth="4" strokeDasharray="150" strokeDashoffset="22" strokeLinecap="round" transform="rotate(-90 210 140)" />
          <text x="210" y="136" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="14" fontWeight="700">75%</text>
          <text x="210" y="152" textAnchor="middle" fill="var(--color-text-secondary, #5c5852)" fontSize="9" fontWeight="600">Profile Match</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--skills .skill-group,
        .feature-visual--skills .skill-conns,
        .feature-visual--skills .match-badge {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
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
