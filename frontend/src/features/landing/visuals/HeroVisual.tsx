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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => el.removeEventListener('mousemove', handleMouseMove);
  }, [ref]);

  const visualStyle = {
    '--mouse-x': `${mousePos.x * 6}px`,
    '--mouse-y': `${mousePos.y * 6}px`,
    transform: `translate(${mousePos.x * 4}px, ${mousePos.y * 4}px)`,
    transition: 'transform 0.15s ease-out',
  } as React.CSSProperties;

  return (
    <div ref={ref} className={`hero-visual ${inView ? 'hero-visual--animated' : ''}`} style={visualStyle} aria-hidden="true">
      <div className="hero-visual__canvas">
        <svg viewBox="0 0 1000 700" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="hv-glow-1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hv-glow-2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="hv-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="hv-card" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-surface-muted)" />
              <stop offset="100%" stopColor="var(--color-surface)" />
            </linearGradient>
            <filter id="hv-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--color-primary)" floodOpacity="0.1" />
            </filter>
            <linearGradient id="hv-btn" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-info)" />
            </linearGradient>
          </defs>

          {/* Ambient glows */}
          <circle cx="500" cy="350" r="320" fill="url(#hv-glow-1)" className="hv-glow" />
          <circle cx="500" cy="350" r="240" fill="url(#hv-glow-2)" className="hv-glow" />

          {/* Connection lines */}
          <g className="hv-lines">
            <path d="M200 280 Q320 180 340 160" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
            <path d="M340 160 Q420 140 460 160" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
            <path d="M540 160 Q580 140 660 160" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
            <path d="M660 160 Q780 180 800 280" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
            <path d="M340 160 Q400 300 340 340" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
            <path d="M660 160 Q600 300 660 340" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
            <path d="M340 340 Q420 420 460 500" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
            <path d="M660 340 Q580 420 540 500" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" />
          </g>

          {/* Profile node */}
          <g className="hv-node hv-node--profile">
            <circle cx="200" cy="280" r="72" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" filter="url(#hv-shadow)" />
            <circle cx="200" cy="248" r="18" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
            <path d="M176 296 Q200 310 224 296" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" fill="none" />
            <rect x="168" y="318" width="64" height="8" rx="4" fill="var(--color-border)" />
            <rect x="176" y="332" width="48" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
            <text x="200" y="362" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12" fontWeight="600">Profile</text>
          </g>

          {/* Skills node */}
          <g className="hv-node hv-node--skills">
            <circle cx="400" cy="140" r="64" fill="var(--color-surface)" stroke="var(--color-info)" strokeWidth="1.5" filter="url(#hv-shadow)" />
            <rect x="366" y="118" width="68" height="8" rx="4" fill="var(--color-primary)" />
            <rect x="372" y="132" width="56" height="6" rx="3" fill="var(--color-border)" />
            <rect x="372" y="144" width="44" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
            <rect x="378" y="156" width="36" height="6" rx="3" fill="var(--color-info)" opacity="0.8" />
            <text x="400" y="182" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">React</text>
            <text x="400" y="194" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Python · SQL</text>
            <text x="400" y="206" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="11" fontWeight="600">Skills</text>
          </g>

          {/* AI Matching engine */}
          <g className="hv-node hv-node--ai">
            <circle cx="500" cy="340" r="70" fill="url(#hv-card)" stroke="var(--color-primary)" strokeWidth="2" filter="url(#hv-shadow)" />
            <circle cx="500" cy="340" r="50" fill="none" stroke="var(--color-primary)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="500" cy="340" r="24" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1.5" />
            <text x="500" y="344" textAnchor="middle" fill="var(--color-primary)" fontSize="10" fontWeight="700">AI</text>
            <text x="500" y="388" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="11" fontWeight="600">Matching</text>
          </g>

          {/* Opportunities node */}
          <g className="hv-node hv-node--opportunities">
            <circle cx="800" cy="280" r="72" fill="var(--color-surface)" stroke="var(--color-success)" strokeWidth="1.5" filter="url(#hv-shadow)" />
            <rect x="768" y="256" width="64" height="8" rx="4" fill="var(--color-success)" />
            <rect x="774" y="270" width="52" height="6" rx="3" fill="var(--color-border)" />
            <rect x="774" y="282" width="40" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
            <circle cx="778" cy="298" r="3.5" fill="var(--color-success)" opacity="0.8" />
            <text x="800" y="324" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">Software Engineer</text>
            <text x="800" y="336" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Data Analyst · Designer</text>
            <text x="800" y="356" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12" fontWeight="600">Opportunity</text>
          </g>

          {/* Match result */}
          <g className="hv-node hv-node--match">
            <circle cx="500" cy="500" r="76" fill="url(#hv-card)" stroke="var(--color-primary)" strokeWidth="2" filter="url(#hv-shadow)" />
            <circle cx="500" cy="500" r="56" fill="none" stroke="var(--color-primary)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 3" />
            <text x="500" y="492" textAnchor="middle" fill="var(--color-primary)" fontSize="26" fontWeight="800">92%</text>
            <text x="500" y="516" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="12" fontWeight="600">Match</text>
            <circle cx="500" cy="500" r="76" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.2" className="hv-pulse" />
          </g>

          {/* Apply button */}
          <g className="hv-node hv-node--apply">
            <rect x="430" y="610" width="140" height="36" rx="18" fill="url(#hv-btn)" filter="url(#hv-shadow)" />
            <text x="500" y="633" textAnchor="middle" fill="var(--color-primary-text)" fontSize="12" fontWeight="700">Apply Now</text>
          </g>

          {/* Particles */}
          <g className="hv-particles">
            <circle cx="300" cy="300" r="2.5" fill="var(--color-primary)" className="hv-particle hv-particle--1" />
            <circle cx="400" cy="260" r="2" fill="var(--color-info)" className="hv-particle hv-particle--2" />
            <circle cx="600" cy="280" r="2.5" fill="var(--color-primary)" className="hv-particle hv-particle--3" />
            <circle cx="700" cy="320" r="2" fill="var(--color-info)" className="hv-particle hv-particle--4" />
            <circle cx="450" cy="440" r="2" fill="var(--color-success)" className="hv-particle hv-particle--5" />
          </g>

          {/* Floating accents */}
          <circle cx="280" cy="420" r="3.5" fill="var(--color-primary)" opacity="0.3" className="hv-float hv-float--1" />
          <circle cx="720" cy="400" r="3" fill="var(--color-info)" opacity="0.3" className="hv-float hv-float--2" />
          <circle cx="260" cy="560" r="2.5" fill="var(--color-success)" opacity="0.2" className="hv-float hv-float--3" />
          <circle cx="740" cy="560" r="3" fill="var(--color-primary)" opacity="0.2" className="hv-float hv-float--4" />
          <circle cx="500" cy="120" r="2" fill="var(--color-info)" opacity="0.2" className="hv-float hv-float--5" />
        </svg>

        {/* HTML floating cards - positioned relative to canvas */}
        <div className="hero-visual__cards">
          <div className="hero-card hero-card--1">
            <div className="hero-card__title">Software Engineer</div>
            <div className="hero-card__meta">Remote · Full-time</div>
            <div className="hero-card__match">95%</div>
          </div>
          <div className="hero-card hero-card--2">
            <div className="hero-card__title">Data Analyst</div>
            <div className="hero-card__meta">Hybrid · Full-time</div>
            <div className="hero-card__match">92%</div>
          </div>
          <div className="hero-card hero-card--3">
            <div className="hero-card__title">Product Designer</div>
            <div className="hero-card__meta">On-site · Contract</div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-visual {
          position: relative;
          width: 100%;
          max-width: 100%;
        }

        .hero-visual__canvas {
          position: relative;
          width: 100%;
          min-height: 600px;
        }

        .hero-visual__canvas svg {
          width: 100%;
          height: auto;
          min-height: 600px;
          display: block;
        }

        .hero-visual__cards {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: visible;
        }

        .hero-card {
          position: absolute;
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .hero-visual--animated .hero-card {
          opacity: 0.95;
          transform: translateY(0);
        }

        .hero-card--1 {
          top: 18%;
          right: 4%;
          transition-delay: 0.3s;
        }

        .hero-card--2 {
          top: 42%;
          right: 2%;
          transition-delay: 0.5s;
        }

        .hero-card--3 {
          bottom: 16%;
          right: 6%;
          transition-delay: 0.7s;
        }

        .hero-card__title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
          white-space: nowrap;
        }

        .hero-card__meta {
          font-size: var(--text-xs);
          color: var(--color-text-tertiary);
          margin-top: var(--space-1);
          white-space: nowrap;
        }

        .hero-card__match {
          position: absolute;
          top: var(--space-2);
          right: var(--space-2);
          padding: var(--space-1) var(--space-2);
          background: var(--color-primary-soft);
          color: var(--color-primary);
          font-size: var(--text-xs);
          font-weight: 700;
          border-radius: var(--radius-md);
        }

        .hv-glow {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 1.4s ease, transform 1.4s ease;
        }

        .hero-visual--animated .hv-glow {
          opacity: 1;
          transform: scale(1);
        }

        .hv-node {
          opacity: 0;
          transform: translateY(16px) scale(0.92);
          transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hv-node--profile { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.15s; }
        .hero-visual--animated .hv-node--skills { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.3s; }
        .hero-visual--animated .hv-node--ai { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.45s; }
        .hero-visual--animated .hv-node--opportunities { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.6s; }
        .hero-visual--animated .hv-node--match { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.75s; }
        .hero-visual--animated .hv-node--apply { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.9s; }

        .hv-lines path {
          stroke-dasharray: 8 6;
          stroke-dashoffset: 14;
          animation: hv-flow 3s linear infinite;
        }

        @keyframes hv-flow {
          to { stroke-dashoffset: 0; }
        }

        .hv-pulse {
          animation: hv-pulse 3.5s ease-in-out infinite;
          transform-origin: 500px 500px;
        }

        @keyframes hv-pulse {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.1); opacity: 0; }
        }

        .hv-float {
          animation: hv-float 7s ease-in-out infinite;
        }

        .hv-float--1 { animation-delay: 0s; }
        .hv-float--2 { animation-delay: 2s; }
        .hv-float--3 { animation-delay: 4s; }
        .hv-float--4 { animation-delay: 5.5s; }
        .hv-float--5 { animation-delay: 1s; }

        @keyframes hv-float {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(-6px); opacity: 0.4; }
        }

        .hv-particle {
          opacity: 0;
          animation: hv-travel 5s ease-in-out infinite;
        }

        .hv-particle--1 { animation-delay: 0s; }
        .hv-particle--2 { animation-delay: 1.2s; }
        .hv-particle--3 { animation-delay: 2.4s; }
        .hv-particle--4 { animation-delay: 3.6s; }
        .hv-particle--5 { animation-delay: 4.2s; }

        @keyframes hv-travel {
          0% { opacity: 0; transform: translate(0, 0); }
          12% { opacity: 0.6; }
          88% { opacity: 0.6; }
          100% { opacity: 0; transform: translate(35px, -25px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hv-node,
          .hv-glow {
            transition-duration: 0.01ms !important;
            transition-delay: 0ms !important;
          }
          .hv-float,
          .hv-pulse,
          .hv-particle,
          .hv-lines path {
            animation: none !important;
            opacity: 0.3 !important;
            transform: none !important;
          }
        }

        @media (max-width: 640px) {
          .hero-visual__cards {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
