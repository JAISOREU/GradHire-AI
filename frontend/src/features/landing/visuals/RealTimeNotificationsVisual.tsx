import { useEffect, useRef, useState } from 'react';

const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.2, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

export const RealTimeNotificationsVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--notifications ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="panel-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <radialGradient id="live-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="notif-panel">
          <rect x="40" y="30" width="320" height="200" rx="14" fill="url(#panel-grad)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="40" y="30" width="320" height="36" rx="14" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="40" y="54" width="320" height="12" fill="var(--color-surface-muted)" stroke="none" />
          <text x="60" y="54" textAnchor="start" fill="var(--color-text)" fontSize="11" fontWeight="700">Notifications</text>
          <circle cx="320" cy="46" r="4" fill="var(--color-success)" />
          <circle cx="320" cy="46" r="8" fill="url(#live-glow)" opacity="0.6" />
          <text x="330" y="50" textAnchor="start" fill="var(--color-success)" fontSize="8" fontWeight="700">LIVE</text>
        </g>

        <g className="notif-row notif-row--1">
          <rect x="55" y="78" width="290" height="36" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="72" cy="96" r="3" fill="var(--color-primary)" />
          <text x="85" y="94" textAnchor="start" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Application viewed</text>
          <text x="85" y="106" textAnchor="start" fill="var(--color-text-muted)" fontSize="8">Software Engineer · 2m ago</text>
        </g>

        <g className="notif-row notif-row--2">
          <rect x="55" y="126" width="290" height="36" rx="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <circle cx="72" cy="144" r="3" fill="var(--color-primary)" />
          <text x="85" y="142" textAnchor="start" fill="var(--color-primary)" fontSize="9" fontWeight="700">New opportunity matched</text>
          <text x="85" y="154" textAnchor="start" fill="var(--color-text-muted)" fontSize="8">92% profile match · Now</text>
        </g>

        <g className="notif-row notif-row--3">
          <rect x="55" y="174" width="290" height="36" rx="8" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1" />
          <circle cx="72" cy="192" r="3" fill="var(--color-info)" />
          <text x="85" y="190" textAnchor="start" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Interview invitation</text>
          <text x="85" y="202" textAnchor="start" fill="var(--color-text-muted)" fontSize="8">Tomorrow · 10:00 AM</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--notifications .notif-panel,
        .feature-visual--notifications .notif-row {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--notifications.is-animated .notif-panel { opacity: 1; transform: translateY(0); transition-delay: 0.05s; }
        .feature-visual--notifications.is-animated .notif-row--1 { opacity: 1; transform: translateY(0); transition-delay: 0.2s; }
        .feature-visual--notifications.is-animated .notif-row--2 { opacity: 1; transform: translateY(0); transition-delay: 0.4s; }
        .feature-visual--notifications.is-animated .notif-row--3 { opacity: 1; transform: translateY(0); transition-delay: 0.6s; }
      `}</style>
    </div>
  );
};
