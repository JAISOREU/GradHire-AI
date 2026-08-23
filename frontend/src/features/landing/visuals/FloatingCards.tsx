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

export const FloatingCards = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`floating-cards ${inView ? 'floating-cards--animated' : ''}`} aria-hidden="true">
      <div className="floating-card floating-card--1">
        <div className="floating-card__title">Software Engineer</div>
        <div className="floating-card__meta">Remote - Full-time</div>
      </div>
      <div className="floating-card floating-card--2">
        <div className="floating-card__title">Data Analyst</div>
        <div className="floating-card__meta">Hybrid - Manila</div>
      </div>
      <div className="floating-card floating-card--3">
        <div className="floating-card__title">Frontend Developer</div>
        <div className="floating-card__meta">Remote - Philippines</div>
      </div>
      <div className="floating-card floating-card--4">
        <div className="floating-card__title">Product Designer</div>
        <div className="floating-card__meta">Hybrid - Singapore</div>
      </div>

      <style>{`
        .floating-cards {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .floating-card {
          position: absolute;
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .floating-cards--animated .floating-card {
          opacity: 0.95;
          transform: translateY(0);
        }

        .floating-card--1 {
          top: 12%;
          left: 2%;
          transition-delay: 0.2s;
        }

        .floating-card--2 {
          top: 48%;
          right: 2%;
          transition-delay: 0.4s;
        }

        .floating-card--3 {
          bottom: 12%;
          left: 8%;
          transition-delay: 0.6s;
        }

        .floating-card--4 {
          top: 28%;
          right: 4%;
          transition-delay: 0.8s;
        }

        .floating-card__title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
        }

        .floating-card__meta {
          font-size: var(--text-xs);
          color: var(--color-text);
          margin-top: var(--space-1);
          white-space: nowrap;
        }

        .floating-card::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(79, 70, 229, 0.06), transparent 60%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .floating-card:hover::before {
          opacity: 1;
        }

        @media (max-width: 1024px) {
          .floating-cards {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .floating-card {
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
            opacity: 0.95;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

