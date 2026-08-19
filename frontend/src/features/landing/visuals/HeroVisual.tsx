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
    transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 6}px)`,
    transition: 'transform 0.15s ease-out',
  } as React.CSSProperties;

  return (
    <div ref={ref} className={`hero-visual ${inView ? 'hero-visual--animated' : ''}`} style={visualStyle} aria-hidden="true">
      <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="hv-glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hv-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hv-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="hv-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted)" />
            <stop offset="100%" stopColor="var(--color-surface)" />
          </linearGradient>
          <filter id="hv-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--color-primary)" floodOpacity="0.12" />
          </filter>
          <linearGradient id="hv-btn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        <circle cx="400" cy="300" r="300" fill="url(#hv-glow-1)" className="hv-glow" />
        <circle cx="400" cy="300" r="220" fill="url(#hv-glow-2)" className="hv-glow" />

        <g className="hv-lines">
          <path d="M250 260 Q320 180 340 160" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.6" />
          <path d="M460 160 Q480 180 550 260" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.6" />
          <path d="M340 200 Q360 280 340 340" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.6" />
          <path d="M460 200 Q440 280 460 340" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.6" />
          <path d="M340 420 Q380 460 400 482" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.5" />
          <path d="M460 420 Q420 460 400 482" stroke="url(#hv-line)" strokeWidth="1.5" strokeDasharray="5 4" fill="none" opacity="0.5" />
        </g>

        <g className="hv-node hv-node--profile">
          <circle cx="180" cy="260" r="70" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" filter="url(#hv-shadow)" />
          <circle cx="180" cy="230" r="18" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M156 276 Q180 290 204 276" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="150" y="298" width="60" height="8" rx="4" fill="var(--color-border)" />
          <rect x="158" y="312" width="44" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
          <text x="180" y="340" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12" fontWeight="600">Profile</text>
        </g>

        <g className="hv-node hv-node--skills">
          <circle cx="400" cy="130" r="58" fill="var(--color-surface)" stroke="var(--color-info)" strokeWidth="1.5" filter="url(#hv-shadow)" />
          <rect x="366" y="110" width="68" height="8" rx="4" fill="var(--color-primary)" />
          <rect x="372" y="124" width="56" height="6" rx="3" fill="var(--color-border)" />
          <rect x="372" y="136" width="44" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
          <rect x="378" y="148" width="36" height="6" rx="3" fill="var(--color-info)" opacity="0.8" />
          <text x="400" y="172" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">React</text>
          <text x="400" y="184" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Python · SQL</text>
          <text x="400" y="196" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="11" fontWeight="600">Skills</text>
        </g>

        <g className="hv-node hv-node--opportunities">
          <circle cx="620" cy="260" r="70" fill="var(--color-surface)" stroke="var(--color-success)" strokeWidth="1.5" filter="url(#hv-shadow)" />
          <rect x="588" y="236" width="64" height="8" rx="4" fill="var(--color-success)" />
          <rect x="594" y="250" width="52" height="6" rx="3" fill="var(--color-border)" />
          <rect x="594" y="262" width="40" height="6" rx="3" fill="var(--color-border)" opacity="0.6" />
          <circle cx="598" cy="278" r="3.5" fill="var(--color-success)" opacity="0.8" />
          <text x="620" y="304" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">Software Engineer</text>
          <text x="620" y="316" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="9" fontWeight="500">Data Analyst · Designer</text>
          <text x="620" y="340" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12" fontWeight="600">Opportunity</text>
        </g>

        <g className="hv-node hv-node--match">
          <circle cx="400" cy="380" r="75" fill="url(#hv-card)" stroke="var(--color-primary)" strokeWidth="2" filter="url(#hv-shadow)" />
          <circle cx="400" cy="380" r="55" fill="none" stroke="var(--color-primary)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 3" />
          <text x="400" y="372" textAnchor="middle" fill="var(--color-primary)" fontSize="24" fontWeight="800">92%</text>
          <text x="400" y="394" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="12" fontWeight="600">Match</text>
          <circle cx="400" cy="380" r="75" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.2" className="hv-pulse" />
        </g>

        <g className="hv-node hv-node--apply">
          <rect x="340" y="480" width="120" height="34" rx="17" fill="url(#hv-btn)" filter="url(#hv-shadow)" />
          <text x="400" y="501" textAnchor="middle" fill="var(--color-primary-text)" fontSize="12" fontWeight="700">Apply Now</text>
        </g>

        <g className="hv-scan">
          <rect x="100" y="56" width="600" height="1.5" rx="0.75" fill="url(#hv-line)" className="hv-scan-line" opacity="0.5" />
        </g>

        <g className="hv-particles">
          <circle cx="280" cy="280" r="2.5" fill="var(--color-primary)" className="hv-particle hv-particle--1" />
          <circle cx="340" cy="320" r="2" fill="var(--color-info)" className="hv-particle hv-particle--2" />
          <circle cx="460" cy="300" r="2.5" fill="var(--color-primary)" className="hv-particle hv-particle--3" />
          <circle cx="520" cy="340" r="2" fill="var(--color-info)" className="hv-particle hv-particle--4" />
          <circle cx="360" cy="420" r="2" fill="var(--color-success)" className="hv-particle hv-particle--5" />
        </g>

        <circle cx="260" cy="380" r="3.5" fill="var(--color-primary)" opacity="0.3" className="hv-float hv-float--1" />
        <circle cx="540" cy="360" r="3" fill="var(--color-info)" opacity="0.3" className="hv-float hv-float--2" />
        <circle cx="240" cy="520" r="2.5" fill="var(--color-success)" opacity="0.2" className="hv-float hv-float--3" />
        <circle cx="560" cy="520" r="3" fill="var(--color-primary)" opacity="0.2" className="hv-float hv-float--4" />
        <circle cx="400" cy="150" r="2" fill="var(--color-info)" opacity="0.2" className="hv-float hv-float--5" />
      </svg>

      <style>{`
        .hero-visual {
          position: relative;
          width: 100%;
          max-width: 100%;
        }

        .hero-visual svg {
          width: 100%;
          height: auto;
          display: block;
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
        .hero-visual--animated .hv-node--opportunities { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.45s; }
        .hero-visual--animated .hv-node--match { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.6s; }
        .hero-visual--animated .hv-node--apply { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.75s; }

        .hv-lines path {
          stroke-dasharray: 8 6;
          stroke-dashoffset: 14;
          animation: hv-flow 3s linear infinite;
        }

        @keyframes hv-flow {
          to { stroke-dashoffset: 0; }
        }

        .hv-scan-line {
          animation: hv-scan 6s ease-in-out infinite;
        }

        @keyframes hv-scan {
          0%, 100% { transform: translateY(0); opacity: 0; }
          6% { opacity: 0.4; }
          94% { opacity: 0.4; }
          50% { transform: translateY(480px); }
        }

        .hv-pulse {
          animation: hv-pulse 3.5s ease-in-out infinite;
          transform-origin: 400px 380px;
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
          .hv-scan-line,
          .hv-particle,
          .hv-lines path {
            animation: none !important;
            opacity: 0.3 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};
