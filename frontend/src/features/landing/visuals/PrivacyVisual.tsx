import { useEffect, useRef, useState } from 'react';

const useInView = (options?: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry] ) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.2, ...options });
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

export const PrivacyFirstVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--privacy ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="shield-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="data-chip" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
        </defs>

        <g className="priv-data priv-data--1">
          <rect x="50" y="60" width="80" height="26" rx="6" fill="url(#data-chip)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="90" y="77" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Profile</text>
        </g>

        <g className="priv-data priv-data--2">
          <rect x="270" y="60" width="80" height="26" rx="6" fill="url(#data-chip)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="310" y="77" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Resume</text>
        </g>

        <g className="priv-data priv-data--3">
          <rect x="50" y="180" width="80" height="26" rx="6" fill="url(#data-chip)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="90" y="197" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Messages</text>
        </g>

        <g className="priv-data priv-data--4">
          <rect x="270" y="180" width="80" height="26" rx="6" fill="url(#data-chip)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="310" y="197" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Applications</text>
        </g>

        <g className="priv-shield">
          <circle cx="200" cy="130" r="44" fill="url(#shield-glow)" opacity="0.5" />
          <circle cx="200" cy="130" r="36" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.2" />
          <rect x="162" y="96" width="76" height="68" rx="16" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <path d="M 186 118 L 200 108 L 214 118 L 214 142 L 186 142 Z" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <circle cx="200" cy="128" r="5" fill="var(--color-primary)" />
          <text x="200" y="160" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">Protected</text>
        </g>

        <g className="priv-ring priv-ring--1">
          <circle cx="200" cy="130" r="48" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.15" strokeDasharray="4 6" />
        </g>

        <g className="priv-ring priv-ring--2">
          <circle cx="200" cy="130" r="54" fill="none" stroke="var(--color-info)" strokeWidth="1" opacity="0.1" strokeDasharray="2 8" />
        </g>
      </svg>

      <style>{`
        .feature-visual--privacy .priv-data,
        .feature-visual--privacy .priv-shield,
        .feature-visual--privacy .priv-ring {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--privacy.is-animated .priv-data--1 { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .feature-visual--privacy.is-animated .priv-data--2 { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .feature-visual--privacy.is-animated .priv-data--3 { opacity: 1; transform: scale(1); transition-delay: 0.3s; }
        .feature-visual--privacy.is-animated .priv-data--4 { opacity: 1; transform: scale(1); transition-delay: 0.4s; }
        .feature-visual--privacy.is-animated .priv-shield { opacity: 1; transform: scale(1); transition-delay: 0.55s; }
        .feature-visual--privacy.is-animated .priv-ring--1 { opacity: 1; transform: scale(1); transition-delay: 0.7s; }
        .feature-visual--privacy.is-animated .priv-ring--2 { opacity: 1; transform: scale(1); transition-delay: 0.85s; }
      `}</style>
    </div>
  );
};
