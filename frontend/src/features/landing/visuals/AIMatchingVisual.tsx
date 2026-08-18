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

export const AIMatchingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--ai ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ai-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft)" />
            <stop offset="100%" stopColor="var(--color-info-soft)" />
          </linearGradient>
          <radialGradient id="ai-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="240" cy="160" r="140" fill="url(#ai-ambient)" opacity="0.6" className="ai-ambient" />

        <g className="ai-core">
          <circle cx="240" cy="160" r="48" fill="url(#ai-core-glow)" opacity="0.6" />
          <circle cx="240" cy="160" r="32" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="240" cy="160" r="16" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <circle cx="240" cy="160" r="6" fill="var(--color-primary)" />
          <circle cx="240" cy="160" r="48" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.2" strokeDasharray="4 3" className="ai-core-ring" />
        </g>

        <g className="ai-candidate">
          <circle cx="90" cy="160" r="26" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <circle cx="90" cy="152" r="8" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M78 162 Q90 170 102 162" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <text x="90" y="178" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">You</text>
        </g>

        <g className="ai-opp ai-opp--1">
          <circle cx="380" cy="80" r="26" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="364" y="72" width="32" height="5" rx="2.5" fill="var(--color-border)" />
          <text x="380" y="104" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Engineer</text>
        </g>

        <g className="ai-opp ai-opp--2">
          <circle cx="390" cy="160" r="26" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="374" y="152" width="32" height="5" rx="2.5" fill="var(--color-border)" />
          <text x="390" y="184" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Analyst</text>
        </g>

        <g className="ai-opp ai-opp--3">
          <circle cx="380" cy="240" r="26" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <rect x="364" y="232" width="32" height="5" rx="2.5" fill="var(--color-border)" />
          <text x="380" y="264" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Designer</text>
        </g>

        <g className="ai-conns">
          <path d="M114 148 Q160 120 208 140" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M114 160 Q160 160 208 160" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M114 172 Q160 200 208 180" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M272 140 Q320 120 358 88" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M272 160 Q320 160 358 160" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M272 180 Q320 200 358 232" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.8" />
        </g>

        <g className="ai-match-card">
          <rect x="330" y="40" width="110" height="36" rx="8" fill="url(#badge-grad)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="385" y="62" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">92% Profile Match</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--ai .ai-ambient,
        .feature-visual--ai .ai-core,
        .feature-visual--ai .ai-candidate,
        .feature-visual--ai .ai-opp,
        .feature-visual--ai .ai-conns,
        .feature-visual--ai .ai-match-card {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--ai.is-animated .ai-ambient { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .feature-visual--ai.is-animated .ai-core { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .feature-visual--ai.is-animated .ai-candidate { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .feature-visual--ai.is-animated .ai-conns { opacity: 1; transform: scale(1); transition-delay: 0.35s; }
        .feature-visual--ai.is-animated .ai-opp--1 { opacity: 1; transform: scale(1); transition-delay: 0.45s; }
        .feature-visual--ai.is-animated .ai-opp--2 { opacity: 1; transform: scale(1); transition-delay: 0.55s; }
        .feature-visual--ai.is-animated .ai-opp--3 { opacity: 1; transform: scale(1); transition-delay: 0.65s; }
        .feature-visual--ai.is-animated .ai-match-card { opacity: 1; transform: scale(1); transition-delay: 0.8s; }
      `}</style>
    </div>
  );
};
