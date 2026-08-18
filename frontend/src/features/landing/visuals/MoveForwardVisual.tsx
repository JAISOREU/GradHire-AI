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
      <svg viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="forward-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <linearGradient id="forward-connector" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <g className="fwd-step fwd-step--1">
          <rect x="30" y="50" width="90" height="50" rx="10" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="75" cy="75" r="10" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="75" y="102" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Applied</text>
        </g>

        <g className="fwd-line fwd-line--1">
          <line x1="120" y1="75" x2="170" y2="75" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
          <path d="M 170 75 L 164 70 M 170 75 L 164 80" stroke="url(#forward-line)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--2">
          <rect x="170" y="50" width="90" height="50" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <circle cx="215" cy="75" r="10" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <text x="215" y="102" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Reviewed</text>
        </g>

        <g className="fwd-line fwd-line--2">
          <line x1="260" y1="75" x2="310" y2="75" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
          <path d="M 310 75 L 304 70 M 310 75 L 304 80" stroke="url(#forward-line)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--3">
          <rect x="310" y="50" width="90" height="50" rx="10" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <circle cx="355" cy="75" r="10" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
          <text x="355" y="102" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Interview</text>
        </g>

        <g className="fwd-line fwd-line--3">
          <line x1="355" y1="100" x2="355" y2="130" stroke="url(#forward-connector)" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
        </g>

        <g className="fwd-next">
          <rect x="290" y="130" width="130" height="32" rx="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <text x="355" y="150" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">Next step</text>
        </g>
      </svg>

      <style>{`
        .step-visual--forward .fwd-step,
        .step-visual--forward .fwd-line,
        .step-visual--forward .fwd-next {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--forward.is-animated .fwd-step--1 { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .step-visual--forward.is-animated .fwd-line--1 { opacity: 1; transform: scale(1); transition-delay: 0.25s; }
        .step-visual--forward.is-animated .fwd-step--2 { opacity: 1; transform: scale(1); transition-delay: 0.4s; }
        .step-visual--forward.is-animated .fwd-line--2 { opacity: 1; transform: scale(1); transition-delay: 0.55s; }
        .step-visual--forward.is-animated .fwd-step--3 { opacity: 1; transform: scale(1); transition-delay: 0.7s; }
        .step-visual--forward.is-animated .fwd-line--3 { opacity: 1; transform: scale(1); transition-delay: 0.8s; }
        .step-visual--forward.is-animated .fwd-next { opacity: 1; transform: scale(1); transition-delay: 0.9s; }
      `}</style>
    </div>
  );
};
