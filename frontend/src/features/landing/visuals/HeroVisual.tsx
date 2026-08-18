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
    '--mouse-x': `${mousePos.x * 10}px`,
    '--mouse-y': `${mousePos.y * 10}px`,
    transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
    transition: 'transform 0.2s ease-out',
  } as React.CSSProperties;

  return (
    <div ref={ref} className={`hero-visual ${inView ? 'hero-visual--animated' : ''}`} style={visualStyle} aria-hidden="true">
      <svg viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hero-glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-conn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="hero-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="var(--color-primary)" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Ambient glows */}
        <circle cx="320" cy="240" r="220" fill="url(#hero-glow-1)" opacity="0.5" className="hero-visual__glow" />
        <circle cx="320" cy="240" r="160" fill="url(#hero-glow-2)" opacity="0.4" className="hero-visual__glow" />

        {/* Profile node */}
        <g className="hero-visual__node hero-visual__node--profile">
          <circle cx="140" cy="160" r="56" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="140" cy="136" r="16" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M120 156 Q140 168 160 156" stroke="var(--color-text-secondary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <rect x="116" y="176" width="48" height="7" rx="3.5" fill="var(--color-border)" />
          <rect x="124" y="188" width="32" height="5" rx="2.5" fill="var(--color-border)" opacity="0.6" />
          <text x="140" y="214" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="10" fontWeight="600">Profile</text>
        </g>

        {/* Skills node */}
        <g className="hero-visual__node hero-visual__node--skills">
          <circle cx="320" cy="100" r="48" fill="var(--color-surface)" stroke="var(--color-info)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <rect x="292" y="84" width="56" height="7" rx="3.5" fill="var(--color-primary)" />
          <rect x="296" y="96" width="48" height="5" rx="2.5" fill="var(--color-border)" />
          <rect x="296" y="104" width="40" height="5" rx="2.5" fill="var(--color-border)" opacity="0.6" />
          <rect x="300" y="112" width="32" height="5" rx="2.5" fill="var(--color-info)" opacity="0.8" />
          <text x="320" y="134" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="10" fontWeight="600">Skills</text>
        </g>

        {/* Job node */}
        <g className="hero-visual__node hero-visual__node--job">
          <circle cx="500" cy="160" r="56" fill="var(--color-surface)" stroke="var(--color-success)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <rect x="476" y="140" width="48" height="7" rx="3.5" fill="var(--color-success)" />
          <rect x="480" y="152" width="40" height="5" rx="2.5" fill="var(--color-border)" />
          <rect x="480" y="160" width="32" height="5" rx="2.5" fill="var(--color-border)" opacity="0.6" />
          <circle cx="484" cy="174" r="3" fill="var(--color-success)" opacity="0.8" />
          <text x="500" y="214" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="10" fontWeight="600">Opportunity</text>
        </g>

        {/* Match node */}
        <g className="hero-visual__node hero-visual__node--match">
          <circle cx="320" cy="320" r="64" fill="url(#hero-card)" stroke="var(--color-primary)" strokeWidth="2" filter="url(#hero-shadow)" />
          <circle cx="320" cy="320" r="48" fill="none" stroke="var(--color-primary)" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
          <text x="320" y="314" textAnchor="middle" fill="var(--color-primary)" fontSize="18" fontWeight="700">96%</text>
          <text x="320" y="334" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10" fontWeight="600">Match</text>
          <circle cx="320" cy="320" r="64" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.3" className="hero-visual__pulse" />
        </g>

        {/* Scanning line */}
        <g className="hero-visual__scan" opacity="0.4">
          <rect x="60" y="40" width="520" height="2" rx="1" fill="url(#hero-conn)" className="hero-visual__scan-line" />
        </g>

        {/* Connection lines */}
        <g className="hero-visual__connections">
          <path d="M192 156 Q240 120 280 108" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
          <path d="M368 108 Q420 120 460 148" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
          <path d="M184 200 Q240 260 280 280" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
          <path d="M456 200 Q420 260 380 280" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
        </g>

        {/* Traveling light particles */}
        <g className="hero-visual__particles">
          <circle cx="200" cy="200" r="2.5" fill="var(--color-primary)" className="hero-visual__particle hero-visual__particle--1" />
          <circle cx="260" cy="220" r="2" fill="var(--color-info)" className="hero-visual__particle hero-visual__particle--2" />
          <circle cx="360" cy="180" r="2.5" fill="var(--color-primary)" className="hero-visual__particle hero-visual__particle--3" />
          <circle cx="420" cy="240" r="2" fill="var(--color-info)" className="hero-visual__particle hero-visual__particle--4" />
        </g>

        {/* Floating accent elements */}
        <circle cx="220" cy="260" r="3" fill="var(--color-primary)" opacity="0.4" className="hero-visual__float" />
        <circle cx="420" cy="240" r="2.5" fill="var(--color-info)" opacity="0.4" className="hero-visual__float" />
        <circle cx="200" cy="380" r="2" fill="var(--color-success)" opacity="0.3" className="hero-visual__float" />
        <circle cx="440" cy="380" r="2.5" fill="var(--color-primary)" opacity="0.3" className="hero-visual__float" />
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

        .hero-visual__pulse {
          animation: hero-pulse 3s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes hero-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0; }
        }

        .hero-visual__scan-line {
          animation: hero-scan 4s ease-in-out infinite;
        }

        @keyframes hero-scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          50% { transform: translateY(360px); }
        }

        .hero-visual__particle {
          opacity: 0;
          animation: particle-travel 3s ease-in-out infinite;
        }

        .hero-visual__particle--1 { animation-delay: 0s; }
        .hero-visual__particle--2 { animation-delay: 0.8s; }
        .hero-visual__particle--3 { animation-delay: 1.6s; }
        .hero-visual__particle--4 { animation-delay: 2.4s; }

        @keyframes particle-travel {
          0% { opacity: 0; transform: translate(0, 0); }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { opacity: 0; transform: translate(40px, -30px); }
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
          .hero-visual__pulse {
            animation: none;
            opacity: 0.3;
          }
          .hero-visual__scan-line {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
