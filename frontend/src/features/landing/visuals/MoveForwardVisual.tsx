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

export const MoveForwardVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--forward ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="forward-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <linearGradient id="forward-connector" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <radialGradient id="forward-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="130" r="140" fill="url(#forward-glow)" opacity="0.5" className="fwd-glow" />

        <g className="fwd-step fwd-step--1">
          <rect x="30" y="50" width="100" height="56" rx="12" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="80" cy="78" r="12" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="80" y="102" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">Applied</text>
          <text x="80" y="116" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">Today</text>
        </g>

        <g className="fwd-line fwd-line--1">
          <line x1="130" y1="78" x2="170" y2="78" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" />
          <path d="M 170 78 L 164 73 M 170 78 L 164 83" stroke="url(#forward-line)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--2">
          <rect x="170" y="50" width="100" height="56" rx="12" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <circle cx="220" cy="78" r="12" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <text x="220" y="102" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Reviewed</text>
          <text x="220" y="116" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">Yesterday</text>
        </g>

        <g className="fwd-line fwd-line--2">
          <line x1="270" y1="78" x2="310" y2="78" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" />
          <path d="M 310 78 L 304 73 M 310 78 L 304 83" stroke="url(#forward-line)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--3">
          <rect x="310" y="50" width="100" height="56" rx="12" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <circle cx="360" cy="78" r="12" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <text x="360" y="102" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Interview</text>
          <text x="360" y="116" textAnchor="middle" fill="var(--color-text-muted)" fontSize="8">Upcoming</text>
        </g>

        <g className="fwd-line fwd-line--3">
          <line x1="360" y1="106" x2="360" y2="140" stroke="url(#forward-connector)" strokeWidth="2" strokeDasharray="5 3" opacity="0.7" />
        </g>

        <g className="fwd-next">
          <rect x="280" y="140" width="160" height="40" rx="12" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="310" cy="160" r="8" fill="var(--color-success)" />
          <text x="360" y="164" textAnchor="middle" fill="var(--color-primary)" fontSize="11" fontWeight="700">Next step</text>
        </g>

        <g className="fwd-status">
          <rect x="80" y="200" width="240" height="32" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="108" cy="216" r="4" fill="var(--color-success)" />
          <text x="120" y="220" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Application in progress</text>
          <rect x="260" y="208" width="48" height="16" rx="4" fill="var(--color-primary)" />
          <text x="284" y="220" textAnchor="middle" fill="var(--color-primary-text)" fontSize="9" fontWeight="700">Active</text>
        </g>
      </svg>

      <style>{`
        .step-visual--forward .fwd-glow,
        .step-visual--forward .fwd-step,
        .step-visual--forward .fwd-line,
        .step-visual--forward .fwd-next,
        .step-visual--forward .fwd-status {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--forward.is-animated .fwd-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--forward.is-animated .fwd-step--1 { opacity: 1; transform: scale(1); transition-delay: 0.15s; }
        .step-visual--forward.is-animated .fwd-line--1 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .step-visual--forward.is-animated .fwd-step--2 { opacity: 1; transform: scale(1); transition-delay: 0.45s; }
        .step-visual--forward.is-animated .fwd-line--2 { opacity: 1; transform: scale(1); transition-delay: 0.6s; }
        .step-visual--forward.is-animated .fwd-step--3 { opacity: 1; transform: scale(1); transition-delay: 0.75s; }
        .step-visual--forward.is-animated .fwd-line--3 { opacity: 1; transform: scale(1); transition-delay: 0.9s; }
        .step-visual--forward.is-animated .fwd-next { opacity: 1; transform: scale(1); transition-delay: 1.05s; }
        .step-visual--forward.is-animated .fwd-status { opacity: 1; transform: scale(1); transition-delay: 1.2s; }
      `}</style>
    </div>
  );
};
