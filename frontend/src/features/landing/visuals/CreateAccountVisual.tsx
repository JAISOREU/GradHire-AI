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

export const CreateAccountVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`step-visual step-visual--account ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="account-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <linearGradient id="account-btn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
          <radialGradient id="account-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="140" r="100" fill="url(#account-glow)" opacity="0.5" className="acc-glow" />

        <g className="acc-panel">
          <rect x="80" y="40" width="240" height="180" rx="14" fill="url(#account-panel)" stroke="var(--color-border-strong)" strokeWidth="1" />
        </g>

        <g className="acc-avatar">
          <circle cx="200" cy="84" r="22" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="200" cy="80" r="7" fill="var(--color-text-secondary)" />
          <path d="M184 94 Q200 104 216 94" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        <g className="acc-field acc-field--1">
          <rect x="100" y="120" width="200" height="28" rx="7" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="116" y="138" fill="var(--color-text-muted)" fontSize="10">your@email.com</text>
        </g>

        <g className="acc-field acc-field--2">
          <rect x="100" y="160" width="200" height="28" rx="7" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="116" y="178" fill="var(--color-text-muted)" fontSize="10">••••••••</text>
        </g>

        <g className="acc-btn">
          <rect x="100" y="200" width="200" height="12" rx="6" fill="url(#account-btn)" />
          <text x="200" y="210" textAnchor="middle" fill="var(--color-primary-text)" fontSize="10" fontWeight="700">Create account</text>
        </g>

        <g className="acc-check">
          <circle cx="320" cy="60" r="16" fill="var(--color-success-soft)" stroke="var(--color-success)" strokeWidth="1.5" />
          <path d="M 312 60 L 317 65 L 328 54" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>

      <style>{`
        .step-visual--account .acc-glow,
        .step-visual--account .acc-panel,
        .step-visual--account .acc-avatar,
        .step-visual--account .acc-field,
        .step-visual--account .acc-btn,
        .step-visual--account .acc-check {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--account.is-animated .acc-glow { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--account.is-animated .acc-panel { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .step-visual--account.is-animated .acc-avatar { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .step-visual--account.is-animated .acc-field--1 { opacity: 1; transform: scale(1); transition-delay: 0.35s; }
        .step-visual--account.is-animated .acc-field--2 { opacity: 1; transform: scale(1); transition-delay: 0.5s; }
        .step-visual--account.is-animated .acc-btn { opacity: 1; transform: scale(1); transition-delay: 0.65s; }
        .step-visual--account.is-animated .acc-check { opacity: 1; transform: scale(1); transition-delay: 0.8s; }
      `}</style>
    </div>
  );
};
