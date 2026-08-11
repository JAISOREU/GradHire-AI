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
      <svg viewBox="0 0 400 260" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </defs>

        <g className="ai-core">
          <circle cx="200" cy="130" r="40" fill="url(#ai-core-glow)" opacity="0.6" />
          <circle cx="200" cy="130" r="26" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="200" cy="130" r="14" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <circle cx="200" cy="130" r="5" fill="var(--color-primary)" />
        </g>

        <g className="ai-candidate">
          <circle cx="70" cy="130" r="22" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="70" y="134" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">You</text>
        </g>

        <g className="ai-opp ai-opp--1">
          <circle cx="320" cy="70" r="22" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="320" y="74" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Engineer</text>
        </g>

        <g className="ai-opp ai-opp--2">
          <circle cx="330" cy="130" r="22" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="330" y="134" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Analyst</text>
        </g>

        <g className="ai-opp ai-opp--3">
          <circle cx="320" cy="190" r="22" fill="var(--color-surface-muted)" stroke="var(--color-border-strong)" strokeWidth="1" />
          <text x="320" y="194" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Designer</text>
        </g>

        <g className="ai-conns">
          <path d="M 92 118 Q 140 100 174 112" stroke="url(#conn-grad)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M 92 130 Q 140 130 174 130" stroke="url(#conn-grad)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M 92 142 Q 140 160 174 148" stroke="url(#conn-grad)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M 226 112 Q 280 90 298 78" stroke="url(#conn-grad)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M 226 130 Q 280 130 308 130" stroke="url(#conn-grad)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.8" />
          <path d="M 226 148 Q 280 170 298 182" stroke="url(#conn-grad)" strokeWidth="1.2" strokeDasharray="4 3" fill="none" opacity="0.8" />
        </g>

        <g className="ai-match-card">
          <rect x="290" y="30" width="100" height="32" rx="8" fill="url(#badge-grad)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="340" y="50" textAnchor="middle" fill="var(--color-primary)" fontSize="9" fontWeight="700">92% Profile Match</text>
        </g>
      </svg>

      <style>{`
        .feature-visual--ai .ai-core,
        .feature-visual--ai .ai-candidate,
        .feature-visual--ai .ai-opp,
        .feature-visual--ai .ai-conns,
        .feature-visual--ai .ai-match-card {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--ai.is-animated .ai-core { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
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
