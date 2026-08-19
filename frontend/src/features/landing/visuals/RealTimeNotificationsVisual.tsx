import { useInView } from '../../../core/hooks/useInView';

export const RealTimeNotificationsVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--notifications ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="notif-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <radialGradient id="notif-live" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="notif-panel">
          <rect x="50" y="30" width="320" height="220" rx="14" fill="url(#notif-panel)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="50" y="30" width="320" height="40" rx="14" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="50" y="56" width="320" height="14" fill="var(--color-surface-muted)" stroke="none" />
          <text x="70" y="58" textAnchor="start" fill="var(--color-text)" fontSize="12" fontWeight="700">Notifications</text>
          <circle cx="340" cy="50" r="5" fill="var(--color-success)" />
          <circle cx="340" cy="50" r="9" fill="url(#notif-live)" opacity="0.6" />
          <text x="352" y="54" textAnchor="start" fill="var(--color-success)" fontSize="9" fontWeight="700">LIVE</text>
        </g>

        <g className="notif-row notif-row--1">
          <rect x="65" y="86" width="290" height="40" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="84" cy="106" r="4" fill="var(--color-primary)" />
          <text x="98" y="103" textAnchor="start" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Application viewed</text>
          <text x="98" y="115" textAnchor="start" fill="var(--color-text-muted)" fontSize="9">Software Engineer · 2m ago</text>
        </g>

        <g className="notif-row notif-row--2">
          <rect x="65" y="138" width="290" height="40" rx="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <circle cx="84" cy="158" r="4" fill="var(--color-primary)" />
          <text x="98" y="155" textAnchor="start" fill="var(--color-primary)" fontSize="10" fontWeight="700">New opportunity matched</text>
          <text x="98" y="167" textAnchor="start" fill="var(--color-text-muted)" fontSize="9">92% profile match · Now</text>
        </g>

        <g className="notif-row notif-row--3">
          <rect x="65" y="190" width="290" height="40" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="84" cy="210" r="4" fill="var(--color-info)" />
          <text x="98" y="207" textAnchor="start" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Interview invitation</text>
          <text x="98" y="219" textAnchor="start" fill="var(--color-text-muted)" fontSize="9">Tomorrow · 10:00 AM</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--notifications .notif-panel,
        .feature-visual--notifications .notif-row {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--notifications.is-animated .notif-panel { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .feature-visual--notifications.is-animated .notif-row--1 { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .feature-visual--notifications.is-animated .notif-row--2 { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
        .feature-visual--notifications.is-animated .notif-row--3 { opacity: 1; transform: translateY(0); transition-delay: 0.6s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--notifications * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
