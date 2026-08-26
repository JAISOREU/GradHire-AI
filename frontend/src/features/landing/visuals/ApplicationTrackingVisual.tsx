import { useInView } from '../../../core/hooks/useInView';

export const ApplicationTrackingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--tracking ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="track-line" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" />
          </linearGradient>
        </defs>

        <g className="track-header">
          <rect x="20" y="26" width="380" height="32" rx="8" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <text x="42" y="46" textAnchor="start" fill="var(--color-text, #1a1814)" fontSize="12" fontWeight="700">Application Tracking</text>
        </g>

        <g className="track-progress">
          <line x1="41" y1="88" x2="41" y2="217" stroke="url(#track-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.5" />
        </g>

        <g className="track-step track-step--0">
          <rect x="20" y="70" width="380" height="32" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="41" cy="86" r="10" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1.5" />
           <text x="65" y="84" fill="var(--color-text)" fontSize="11" fontWeight="700">Applied</text>
           <text x="65" y="96" fill="var(--color-text)" fontSize="9">Today</text>
          <rect x="345" y="79" width="45" height="16" rx="4" fill="var(--color-primary)" />
          <text x="367" y="91" textAnchor="middle" fill="var(--color-primary-text, #ffffff)" fontSize="9" fontWeight="700">Sent</text>
        </g>

        <g className="track-step track-step--1">
          <rect x="20" y="112" width="380" height="32" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="41" cy="128" r="10" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
           <text x="65" y="126" fill="var(--color-text)" fontSize="11" fontWeight="600">Viewed</text>
           <text x="65" y="138" fill="var(--color-text)" fontSize="9">Yesterday</text>
        </g>

        <g className="track-step track-step--2">
          <rect x="20" y="154" width="380" height="32" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="41" cy="170" r="10" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
           <text x="65" y="168" fill="var(--color-text)" fontSize="11" fontWeight="600">Review</text>
           <text x="65" y="180" fill="var(--color-text)" fontSize="9">Pending</text>
        </g>

        <g className="track-step track-step--3">
          <rect x="20" y="196" width="380" height="32" rx="8" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <circle cx="41" cy="212" r="10" fill="var(--color-surface, #ffffff)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1.5" />
           <text x="65" y="210" fill="var(--color-text)" fontSize="11" fontWeight="600">Interview</text>
           <text x="65" y="222" fill="var(--color-text)" fontSize="9">Upcoming</text>
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
