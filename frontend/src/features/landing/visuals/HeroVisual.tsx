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

export const HeroVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`hero-visual ${inView ? 'hero-visual--animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 560 420" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hero-glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-conn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="hero-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--color-primary)" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Ambient glows */}
        <circle cx="280" cy="210" r="180" fill="url(#hero-glow-1)" opacity="0.5" className="hero-visual__glow" />
        <circle cx="280" cy="210" r="140" fill="url(#hero-glow-2)" opacity="0.4" className="hero-visual__glow" />

        {/* Profile node */}
        <g className="hero-visual__node hero-visual__node--profile">
          <circle cx="120" cy="140" r="48" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="120" cy="120" r="14" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M104 138 Q120 148 136 138" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <rect x="100" y="155" width="40" height="6" rx="3" fill="var(--color-border)" />
          <rect x="108" y="166" width="24" height="4" rx="2" fill="var(--color-border)" opacity="0.6" />
          <text x="120" y="188" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="9" fontWeight="600">Profile</text>
        </g>

        {/* Skills node */}
        <g className="hero-visual__node hero-visual__node--skills">
          <circle cx="280" cy="80" r="40" fill="var(--color-surface)" stroke="var(--color-info)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <rect x="256" y="68" width="48" height="6" rx="3" fill="var(--color-primary)" />
          <rect x="260" y="78" width="40" height="4" rx="2" fill="var(--color-border)" />
          <rect x="260" y="86" width="32" height="4" rx="2" fill="var(--color-border)" opacity="0.6" />
          <rect x="264" y="94" width="24" height="4" rx="2" fill="var(--color-info)" opacity="0.8" />
          <text x="280" y="112" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="9" fontWeight="600">Skills</text>
        </g>

        {/* Job node */}
        <g className="hero-visual__node hero-visual__node--job">
          <circle cx="440" cy="140" r="48" fill="var(--color-surface)" stroke="var(--color-success)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <rect x="418" y="120" width="44" height="6" rx="3" fill="var(--color-success)" />
          <rect x="422" y="130" width="36" height="4" rx="2" fill="var(--color-border)" />
          <rect x="422" y="138" width="28" height="4" rx="2" fill="var(--color-border)" opacity="0.6" />
          <circle cx="426" cy="152" r="3" fill="var(--color-success)" opacity="0.8" />
          <text x="440" y="188" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="9" fontWeight="600">Opportunity</text>
        </g>

        {/* Match node */}
        <g className="hero-visual__node hero-visual__node--match">
          <circle cx="280" cy="280" r="56" fill="url(#hero-card)" stroke="var(--color-primary)" strokeWidth="2" filter="url(#hero-shadow)" />
          <circle cx="280" cy="280" r="42" fill="none" stroke="var(--color-primary)" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
          <text x="280" y="276" textAnchor="middle" fill="var(--color-primary)" fontSize="16" fontWeight="700">96%</text>
          <text x="280" y="292" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="600">Match</text>
        </g>

        {/* Connection lines */}
        <g className="hero-visual__connections">
          <path d="M164 140 Q200 100 244 92" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
          <path d="M316 100 Q360 120 396 136" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
          <path d="M160 180 Q200 240 240 260" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
          <path d="M400 180 Q360 240 320 260" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
        </g>

        {/* Floating accent elements */}
        <circle cx="200" cy="220" r="3" fill="var(--color-primary)" opacity="0.4" className="hero-visual__float" />
        <circle cx="360" cy="200" r="2.5" fill="var(--color-info)" opacity="0.4" className="hero-visual__float" />
        <circle cx="180" cy="340" r="2" fill="var(--color-success)" opacity="0.3" className="hero-visual__float" />
        <circle cx="380" cy="340" r="2.5" fill="var(--color-primary)" opacity="0.3" className="hero-visual__float" />
      </svg>

      <style>{`
        .hero-visual {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }

        .hero-visual svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .hero-visual__glow {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 1.2s ease, transform 1.2s ease;
        }

        .hero-visual--animated .hero-visual__glow {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__node {
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hero-visual__node--profile { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.1s; }
        .hero-visual--animated .hero-visual__node--skills { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.25s; }
        .hero-visual--animated .hero-visual__node--job { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.4s; }
        .hero-visual--animated .hero-visual__node--match { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.55s; }

        .hero-visual__connections path {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hero-visual__connections path {
          stroke-dashoffset: 0;
        }

        .hero-visual--animated .hero-visual__connections path:nth-child(1) { transition-delay: 0.3s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(2) { transition-delay: 0.5s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(3) { transition-delay: 0.7s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(4) { transition-delay: 0.9s; }

        .hero-visual__float {
          animation: hero-float 6s ease-in-out infinite;
        }

        .hero-visual__float:nth-child(2) { animation-delay: 1.5s; }
        .hero-visual__float:nth-child(3) { animation-delay: 3s; }
        .hero-visual__float:nth-child(4) { animation-delay: 4.5s; }

        @keyframes hero-float {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-8px); opacity: 0.6; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-visual__node,
          .hero-visual__glow,
          .hero-visual__connections path {
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
          .hero-visual__float {
            animation: none;
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};
