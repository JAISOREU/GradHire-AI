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
      <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <linearGradient id="hero-btn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" />
            <stop offset="100%" stopColor="var(--color-info)" />
          </linearGradient>
        </defs>

        {/* Ambient glows */}
        <circle cx="400" cy="300" r="280" fill="url(#hero-glow-1)" opacity="0.5" className="hero-visual__glow" />
        <circle cx="400" cy="300" r="200" fill="url(#hero-glow-2)" opacity="0.4" className="hero-visual__glow" />

        {/* Profile node */}
        <g className="hero-visual__node hero-visual__node--profile">
          <circle cx="200" cy="220" r="70" fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="200" cy="190" r="20" fill="var(--color-primary-soft)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M174 236 Q200 252 226 236" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="168" y="262" width="64" height="9" rx="4.5" fill="var(--color-border)" />
          <rect x="178" y="278" width="44" height="7" rx="3.5" fill="var(--color-border)" opacity="0.6" />
          <text x="200" y="310" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12" fontWeight="600">Profile</text>
        </g>

        {/* Skills node */}
        <g className="hero-visual__node hero-visual__node--skills">
          <circle cx="400" cy="140" r="60" fill="var(--color-surface)" stroke="var(--color-info)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <rect x="364" y="120" width="72" height="9" rx="4.5" fill="var(--color-primary)" />
          <rect x="370" y="136" width="60" height="7" rx="3.5" fill="var(--color-border)" />
          <rect x="370" y="148" width="50" height="7" rx="3.5" fill="var(--color-border)" opacity="0.6" />
          <rect x="376" y="160" width="38" height="7" rx="3.5" fill="var(--color-info)" opacity="0.8" />
          <text x="400" y="188" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12" fontWeight="600">Skills</text>
        </g>

        {/* Job node */}
        <g className="hero-visual__node hero-visual__node--job">
          <circle cx="620" cy="220" r="70" fill="var(--color-surface)" stroke="var(--color-success)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <rect x="588" y="196" width="64" height="9" rx="4.5" fill="var(--color-success)" />
          <rect x="594" y="212" width="52" height="7" rx="3.5" fill="var(--color-border)" />
          <rect x="594" y="224" width="40" height="7" rx="3.5" fill="var(--color-border)" opacity="0.6" />
          <circle cx="598" cy="242" r="4" fill="var(--color-success)" opacity="0.8" />
          <text x="620" y="310" textAnchor="middle" fill="var(--color-text-tertiary)" fontSize="12" fontWeight="600">Opportunity</text>
        </g>

        {/* Match node */}
        <g className="hero-visual__node hero-visual__node--match">
          <circle cx="400" cy="420" r="80" fill="url(#hero-card)" stroke="var(--color-primary)" strokeWidth="2" filter="url(#hero-shadow)" />
          <circle cx="400" cy="420" r="60" fill="none" stroke="var(--color-primary)" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
          <text x="400" y="412" textAnchor="middle" fill="var(--color-primary)" fontSize="24" fontWeight="700">96%</text>
          <text x="400" y="436" textAnchor="middle" fill="var(--color-text-secondary)" fontSize="12" fontWeight="600">Match</text>
          <circle cx="400" cy="420" r="80" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.3" className="hero-visual__pulse" />
        </g>

        {/* Application button */}
        <g className="hero-visual__node hero-visual__node--apply">
          <rect x="340" y="340" width="120" height="36" rx="18" fill="url(#hero-btn)" filter="url(#hero-shadow)" />
          <text x="400" y="363" textAnchor="middle" fill="var(--color-primary-text)" fontSize="12" fontWeight="700">Apply Now</text>
        </g>

        {/* Scanning line */}
        <g className="hero-visual__scan" opacity="0.4">
          <rect x="80" y="60" width="640" height="3" rx="1.5" fill="url(#hero-conn)" className="hero-visual__scan-line" />
        </g>

        {/* Connection lines */}
        <g className="hero-visual__connections">
          <path d="M268 200 Q320 160 348 160" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
          <path d="M452 160 Q500 160 548 200" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
          <path d="M268 240 Q320 300 348 380" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
          <path d="M548 240 Q500 300 460 380" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
          <path d="M460 460 Q480 480 500 460" stroke="url(#hero-conn)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.5" />
        </g>

        {/* Traveling light particles */}
        <g className="hero-visual__particles">
          <circle cx="280" cy="280" r="3" fill="var(--color-primary)" className="hero-visual__particle hero-visual__particle--1" />
          <circle cx="340" cy="300" r="2.5" fill="var(--color-info)" className="hero-visual__particle hero-visual__particle--2" />
          <circle cx="460" cy="260" r="3" fill="var(--color-primary)" className="hero-visual__particle hero-visual__particle--3" />
          <circle cx="520" cy="320" r="2.5" fill="var(--color-info)" className="hero-visual__particle hero-visual__particle--4" />
          <circle cx="380" cy="360" r="2" fill="var(--color-success)" className="hero-visual__particle hero-visual__particle--5" />
        </g>

        {/* Floating accent elements */}
        <circle cx="280" cy="360" r="4" fill="var(--color-primary)" opacity="0.4" className="hero-visual__float" />
        <circle cx="520" cy="340" r="3.5" fill="var(--color-info)" opacity="0.4" className="hero-visual__float" />
        <circle cx="260" cy="500" r="3" fill="var(--color-success)" opacity="0.3" className="hero-visual__float" />
        <circle cx="540" cy="500" r="3.5" fill="var(--color-primary)" opacity="0.3" className="hero-visual__float" />
        <circle cx="400" cy="160" r="2.5" fill="var(--color-info)" opacity="0.3" className="hero-visual__float" />
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
        .hero-visual--animated .hero-visual__node--apply { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.7s; }

        .hero-visual__connections path {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hero-visual__connections path {
          stroke-dashoffset: 0;
        }

        .hero-visual--animated .hero-visual__connections path:nth-child(1) { transition-delay: 0.3s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(2) { transition-delay: 0.5s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(3) { transition-delay: 0.7s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(4) { transition-delay: 0.9s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(5) { transition-delay: 1.1s; }

        .hero-visual__float {
          animation: hero-float 6s ease-in-out infinite;
        }

        .hero-visual__float:nth-child(2) { animation-delay: 1.5s; }
        .hero-visual__float:nth-child(3) { animation-delay: 3s; }
        .hero-visual__float:nth-child(4) { animation-delay: 4.5s; }
        .hero-visual__float:nth-child(5) { animation-delay: 2s; }

        @keyframes hero-float {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-10px); opacity: 0.6; }
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
          50% { transform: translateY(480px); }
        }

        .hero-visual__particle {
          opacity: 0;
          animation: particle-travel 3s ease-in-out infinite;
        }

        .hero-visual__particle--1 { animation-delay: 0s; }
        .hero-visual__particle--2 { animation-delay: 0.8s; }
        .hero-visual__particle--3 { animation-delay: 1.6s; }
        .hero-visual__particle--4 { animation-delay: 2.4s; }
        .hero-visual__particle--5 { animation-delay: 3.2s; }

        @keyframes particle-travel {
          0% { opacity: 0; transform: translate(0, 0); }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { opacity: 0; transform: translate(50px, -40px); }
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
