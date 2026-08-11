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
      <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="forward-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <g className="fwd-step fwd-step--1">
          <rect x="40" y="50" width="80" height="50" rx="8" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="80" cy="75" r="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="80" y="102" textAnchor="middle" fill="var(--color-primary)" fontSize="8" fontWeight="700">Applied</text>
        </g>

        <g className="fwd-line fwd-line--1">
          <line x1="120" y1="75" x2="180" y2="75" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
          <path d="M 180 75 L 174 70 M 180 75 L 174 80" stroke="url(#forward-line)" strokeWidth="2" strokeLinecap="round" />
        </g>

        <g className="fwd-step fwd-step--2">
          <rect x="180" y="50" width="80" height="50" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="220" cy="75" r="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="220" y="102" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="8" fontWeight="600">Reviewed</text>
        </g>

        <g className="fwd-line fwd-line--2">
          <line x1="260" y1="75" x2="320" y2="75" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
        </g>

        <g className="fwd-step fwd-step--3">
          <rect x="120" y="130" width="80" height="50" rx="8" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="160" cy="155" r="8" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="160" y="182" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="8" fontWeight="600">Interview</text>
        </g>

        <g className="fwd-line fwd-line--3">
          <line x1="160" y1="130" x2="160" y2="120" stroke="url(#forward-line)" strokeWidth="2" strokeDasharray="4 3" opacity="0.7" />
        </g>

        <g className="fwd-next">
          <rect x="120" y="30" width="80" height="28" rx="6" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="160" y="48" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Next step</text>
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
