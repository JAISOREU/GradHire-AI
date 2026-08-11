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

const STEPS = ['Applied', 'Viewed', 'Review', 'Shortlist', 'Interview', 'Offer', 'Hired'];

export const ApplicationTrackingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--tracking ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="40" y="30" width="10" height="200" rx="5" fill="var(--color-surface-muted)" />

        {STEPS.map((step, i) => {
          const y = 50 + i * 28;
          return (
            <g key={i} className={`track-step-${i}`}>
              <circle cx="45" cy={y} r="6" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1.5" />
              <rect x="70" y={y - 10} width="140" height="18" rx="4" fill="var(--color-surface-muted)" />
              <text x="80" y={y + 3} fill="var(--color-text-muted)" fontSize="9" fontWeight="600">{step}</text>
            </g>
          );
        })}
      </svg>

      <style>{`
        .feature-visual--tracking .track-step-0,
        .feature-visual--tracking .track-step-1,
        .feature-visual--tracking .track-step-2,
        .feature-visual--tracking .track-step-3,
        .feature-visual--tracking .track-step-4,
        .feature-visual--tracking .track-step-5,
        .feature-visual--tracking .track-step-6 {
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .feature-visual--tracking.is-animated .track-step-0 { opacity: 1; transform: translateX(0); transition-delay: 0.1s; }
        .feature-visual--tracking.is-animated .track-step-1 { opacity: 1; transform: translateX(0); transition-delay: 0.2s; }
        .feature-visual--tracking.is-animated .track-step-2 { opacity: 1; transform: translateX(0); transition-delay: 0.3s; }
        .feature-visual--tracking.is-animated .track-step-3 { opacity: 1; transform: translateX(0); transition-delay: 0.4s; }
        .feature-visual--tracking.is-animated .track-step-4 { opacity: 1; transform: translateX(0); transition-delay: 0.5s; }
        .feature-visual--tracking.is-animated .track-step-5 { opacity: 1; transform: translateX(0); transition-delay: 0.6s; }
        .feature-visual--tracking.is-animated .track-step-6 { opacity: 1; transform: translateX(0); transition-delay: 0.7s; }
      `}</style>
    </div>
  );
};
