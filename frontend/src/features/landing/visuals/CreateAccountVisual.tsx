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
      <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="account-panel" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <linearGradient id="account-btn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <g className="acc-panel">
          <rect x="60" y="30" width="200" height="160" rx="12" fill="url(#account-panel)" stroke="var(--color-border-strong)" strokeWidth="1" />
        </g>

        <g className="acc-avatar">
          <circle cx="160" cy="70" r="18" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="160" cy="66" r="6" fill="var(--color-text-secondary)" />
          <path d="M 148 78 Q 160 86 172 78" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </g>

        <g className="acc-field acc-field--1">
          <rect x="80" y="100" width="160" height="24" rx="6" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="92" y="116" fill="var(--color-text-muted)" fontSize="9">your@email.com</text>
        </g>

        <g className="acc-field acc-field--2">
          <rect x="80" y="136" width="160" height="24" rx="6" fill="var(--color-surface)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="92" y="152" fill="var(--color-text-muted)" fontSize="9">••••••••</text>
        </g>

        <g className="acc-btn">
          <rect x="80" y="172" width="160" height="10" rx="5" fill="url(#account-btn)" />
          <text x="160" y="181" textAnchor="middle" fill="var(--color-primary-text)" fontSize="8" fontWeight="700">Create account</text>
        </g>

        <g className="acc-check">
          <circle cx="270" cy="50" r="14" fill="var(--color-success-soft)" stroke="var(--color-success)" strokeWidth="1.5" />
          <path d="M 264 50 L 268 54 L 276 46" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>

      <style>{`
        .step-visual--account .acc-panel,
        .step-visual--account .acc-avatar,
        .step-visual--account .acc-field,
        .step-visual--account .acc-btn,
        .step-visual--account .acc-check {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .step-visual--account.is-animated .acc-panel { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .step-visual--account.is-animated .acc-avatar { opacity: 1; transform: scale(1); transition-delay: 0.15s; }
        .step-visual--account.is-animated .acc-field--1 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .step-visual--account.is-animated .acc-field--2 { opacity: 1; transform: scale(1); transition-delay: 0.45s; }
        .step-visual--account.is-animated .acc-btn { opacity: 1; transform: scale(1); transition-delay: 0.6s; }
        .step-visual--account.is-animated .acc-check { opacity: 1; transform: scale(1); transition-delay: 0.8s; }
      `}</style>
    </div>
  );
};
