import { useInView } from '../../../core/hooks/useInView';

export const ApplicationTrackingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--tracking ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="track-line" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" />
          </linearGradient>
        </defs>

        <g className="track-header">
          <rect x="20" y="30" width="440" height="36" rx="8" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="45" y="52" textAnchor="start" fill="var(--color-text, #1a1814)" fontSize="12" fontWeight="700">Application Tracking</text>
        </g>

        <g className="track-progress">
          <line x1="44" y1="100" x2="44" y2="248" stroke="url(#track-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
        </g>

        <g className="track-step track-step--0">
          <rect x="20" y="80" width="440" height="36" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <circle cx="44" cy="98" r="10" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" />
          <text x="70" y="96" fill="var(--color-primary, #4f46e5)" fontSize="11" fontWeight="700">Applied</text>
          <text x="70" y="110" fill="var(--color-text-muted, #8c8680)" fontSize="9">Today</text>
          <rect x="408" y="90" width="40" height="18" rx="4" fill="var(--color-primary, #4f46e5)" />
          <text x="428" y="104" textAnchor="middle" fill="var(--color-primary-text, #ffffff)" fontSize="9" fontWeight="700">Sent</text>
        </g>

        <g className="track-step track-step--1">
          <rect x="20" y="128" width="440" height="36" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="44" cy="146" r="10" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <text x="70" y="144" fill="var(--color-text-secondary, #5c5852)" fontSize="11" fontWeight="600">Viewed</text>
          <text x="70" y="158" fill="var(--color-text-muted, #8c8680)" fontSize="9">Yesterday</text>
        </g>

        <g className="track-step track-step--2">
          <rect x="20" y="176" width="440" height="36" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="44" cy="194" r="10" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <text x="70" y="192" fill="var(--color-text-secondary, #5c5852)" fontSize="11" fontWeight="600">Review</text>
          <text x="70" y="206" fill="var(--color-text-muted, #8c8680)" fontSize="9">Pending</text>
        </g>

        <g className="track-step track-step--3">
          <rect x="20" y="224" width="440" height="36" rx="8" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="44" cy="242" r="10" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
          <text x="70" y="240" fill="var(--color-text-secondary, #5c5852)" fontSize="11" fontWeight="600">Interview</text>
          <text x="70" y="254" fill="var(--color-text-muted, #8c8680)" fontSize="9">Upcoming</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--tracking .track-header,
        .feature-visual--tracking .track-step,
        .feature-visual--tracking .track-progress {
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--tracking.is-animated .track-header { opacity: 1; transform: translateX(0); transition-delay: 0.1s; }
        .feature-visual--tracking.is-animated .track-step--0 { opacity: 1; transform: translateX(0); transition-delay: 0.2s; }
        .feature-visual--tracking.is-animated .track-step--1 { opacity: 1; transform: translateX(0); transition-delay: 0.3s; }
        .feature-visual--tracking.is-animated .track-step--2 { opacity: 1; transform: translateX(0); transition-delay: 0.4s; }
        .feature-visual--tracking.is-animated .track-step--3 { opacity: 1; transform: translateX(0); transition-delay: 0.5s; }
        .feature-visual--tracking.is-animated .track-progress { opacity: 1; transform: translateX(0); transition-delay: 0.6s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--tracking * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
