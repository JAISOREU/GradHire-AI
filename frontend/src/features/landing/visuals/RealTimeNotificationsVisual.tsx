import { useInView } from '../../../core/hooks/useInView';

export const RealTimeNotificationsVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--notifications ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="panel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <radialGradient id="live-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-success, #059669)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-success, #059669)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="notif-panel">
          <rect x="40" y="25" width="340" height="230" rx="14" fill="url(#panel-grad)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="40" y="25" width="340" height="44" rx="14" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="40" y="53" width="340" height="16" fill="var(--color-surface-muted, #fefcf8)" stroke="none" />
          <text x="65" y="55" textAnchor="start" fill="var(--color-text, #1a1814)" fontSize="13" fontWeight="700">Notifications</text>
          <circle cx="348" cy="47" r="6" fill="var(--color-success, #059669)" />
          <circle cx="348" cy="47" r="10" fill="url(#live-glow)" opacity="0.6" />
          <text x="362" y="51" textAnchor="start" fill="var(--color-success, #059669)" fontSize="10" fontWeight="700">LIVE</text>
        </g>

        <g className="notif-row notif-row--1">
          <rect x="58" y="84" width="304" height="44" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="84" cy="106" r="5" fill="var(--color-primary, #4f46e5)" />
          <text x="100" y="103" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="11" fontWeight="600">Application viewed</text>
          <text x="100" y="117" textAnchor="start" fill="var(--color-text-muted, #8c8680)" fontSize="10">Project Coordinator · 2m ago</text>
        </g>

        <g className="notif-row notif-row--2">
          <rect x="58" y="138" width="304" height="44" rx="8" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
          <circle cx="84" cy="160" r="5" fill="var(--color-primary, #4f46e5)" />
          <text x="100" y="157" textAnchor="start" fill="var(--color-primary, #4f46e5)" fontSize="11" fontWeight="700">New opportunity matched</text>
          <text x="100" y="171" textAnchor="start" fill="var(--color-text-muted, #8c8680)" fontSize="10">94% profile match · Now</text>
        </g>

        <g className="notif-row notif-row--3">
          <rect x="58" y="192" width="304" height="44" rx="8" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />
          <circle cx="84" cy="214" r="5" fill="var(--color-info, #2563eb)" />
          <text x="100" y="211" textAnchor="start" fill="var(--color-text-secondary, #5c5852)" fontSize="11" fontWeight="600">Interview invitation</text>
          <text x="100" y="225" textAnchor="start" fill="var(--color-text-muted, #8c8680)" fontSize="10">Tomorrow · 10:00 AM</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--notifications .notif-panel,
        .feature-visual--notifications .notif-row {
          opacity: 0;
          transform: translateY(12px);
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
