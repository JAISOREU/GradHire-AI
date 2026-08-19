import { useInView } from '../../../core/hooks/useInView';

export const ApplicationTrackingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--tracking ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="track-line" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <g className="track-header">
          <rect x="50" y="30" width="320" height="32" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="70" y="50" textAnchor="start" fill="var(--color-text)" fontSize="11" fontWeight="700">Application Tracking</text>
          <circle cx="340" cy="46" r="6" fill="var(--color-success)" />
          <text x="352" y="50" textAnchor="start" fill="var(--color-success)" fontSize="9" fontWeight="700">3 Active</text>
        </g>

        <g className="track-progress">
          <line x1="64" y1="98" x2="64" y2="238" stroke="url(#track-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
        </g>

        <g className="track-step track-step--0">
          <rect x="40" y="74" width="320" height="32" rx="8" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="64" cy="90" r="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="88" y="88" fill="var(--color-primary)" fontSize="10" fontWeight="700">Applied</text>
          <text x="88" y="100" fill="var(--color-text-muted)" fontSize="8">Today</text>
          <rect x="310" y="82" width="36" height="16" rx="4" fill="var(--color-primary)" />
          <text x="328" y="94" textAnchor="middle" fill="var(--color-primary-text)" fontSize="8" fontWeight="700">Sent</text>
        </g>

        <g className="track-step track-step--1">
          <rect x="40" y="118" width="320" height="32" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="64" cy="134" r="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <text x="88" y="132" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Viewed</text>
          <text x="88" y="144" fill="var(--color-text-muted)" fontSize="8">Yesterday</text>
        </g>

        <g className="track-step track-step--2">
          <rect x="40" y="162" width="320" height="32" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="64" cy="178" r="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <text x="88" y="176" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Review</text>
          <text x="88" y="188" fill="var(--color-text-muted)" fontSize="8">Pending</text>
        </g>

        <g className="track-step track-step--3">
          <rect x="40" y="206" width="320" height="32" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="64" cy="222" r="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <text x="88" y="220" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Interview</text>
          <text x="88" y="232" fill="var(--color-text-muted)" fontSize="8">Upcoming</text>
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
