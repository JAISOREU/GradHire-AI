import { useEffect, useState } from 'react';
import { useInView } from '../../../core/hooks/useInView';

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

  const visualStyle: React.CSSProperties = {
    transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)`,
    transition: 'transform 0.2s ease-out',
  };

  return (
    <div
      ref={ref}
      className={`hero-visual ${inView ? 'hero-visual--animated' : ''}`}
      style={visualStyle}
      aria-hidden="true"
    >
      <svg viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          {/* Focused glow behind AI engine */}
          <radialGradient id="hero-glow-ai" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.35" />
            <stop offset="50%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow-secondary" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0" />
          </radialGradient>

          {/* Connection streams */}
          <linearGradient id="stream-left" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="stream-right" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-success, #059669)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-success, #059669)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="stream-center" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--color-success, #059669)" stopOpacity="0.3" />
          </linearGradient>

          {/* Node gradients */}
          <linearGradient id="ai-engine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="profile-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="job-card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface, #ffffff)" />
            <stop offset="100%" stopColor="var(--color-surface-muted, #fefcf8)" />
          </linearGradient>
          <linearGradient id="match-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-success-soft, #ecfdf5)" />
            <stop offset="100%" stopColor="var(--color-primary-soft, #eef2ff)" />
          </linearGradient>

          {/* Shadows */}
          <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--color-primary, #4f46e5)" floodOpacity="0.15" />
          </filter>
          <filter id="hero-shadow-strong" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="var(--color-primary, #4f46e5)" floodOpacity="0.25" />
          </filter>

          {/* Clips */}
          <clipPath id="profile-clip">
            <circle cx="170" cy="340" r="56" />
          </clipPath>
          <clipPath id="engine-clip">
            <circle cx="400" cy="130" r="78" />
          </clipPath>
        </defs>

        {/* Background glows - focused on AI engine */}
        <circle cx="400" cy="130" r="200" fill="url(#hero-glow-ai)" opacity="0.6" className="hero-visual__glow" />
        <circle cx="400" cy="130" r="140" fill="url(#hero-glow-secondary)" opacity="0.4" className="hero-visual__glow" />

        {/* ===== LEFT: Profile Node ===== */}
        <g className="hero-visual__node hero-visual__node--profile">
          <circle cx="170" cy="340" r="70" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="170" cy="340" r="66" fill="url(#profile-grad)" className="hero-visual__profile-bg" />

          <g clipPath="url(#profile-clip)">
            <circle cx="170" cy="340" r="56" fill="var(--color-surface, #ffffff)" />
            <circle cx="170" cy="340" r="24" fill="var(--color-primary-soft, #eef2ff)" className="hero-visual__profile-avatar" />
            <circle cx="170" cy="340" r="10" fill="var(--color-primary, #4f46e5)" className="hero-visual__profile-core" />

            {/* Orbiting skill chips */}
            <g className="hero-visual__profile-orbit">
              <g transform="translate(170, 310)">
                <rect x="-16" y="-7" width="32" height="14" rx="7" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="7" fontWeight="600">React</text>
              </g>
              <g transform="translate(210, 340)">
                <rect x="-16" y="-7" width="32" height="14" rx="7" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="7" fontWeight="600">Python</text>
              </g>
              <g transform="translate(170, 370)">
                <rect x="-16" y="-7" width="32" height="14" rx="7" fill="var(--color-success-soft, #ecfdf5)" stroke="var(--color-success, #059669)" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="7" fontWeight="600">SQL</text>
              </g>
              <g transform="translate(130, 340)">
                <rect x="-16" y="-7" width="32" height="14" rx="7" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
                <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="7" fontWeight="600">Design</text>
              </g>
            </g>
          </g>

          <circle cx="170" cy="340" r="70" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="6 4" className="hero-visual__profile-ring" />
          <text x="170" y="410" textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="600">Your Profile</text>
        </g>

        {/* ===== CENTER: AI Engine ===== */}
        <g className="hero-visual__node hero-visual__node--engine">
          {/* Outer glow ring */}
          <circle cx="400" cy="130" r="95" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="8 6" opacity="0.3" className="hero-visual__engine-ring" />

          {/* Main engine body */}
          <circle cx="400" cy="130" r="88" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" filter="url(#hero-shadow-strong)" />
          <circle cx="400" cy="130" r="82" fill="url(#ai-engine-grad)" className="hero-visual__engine-bg" />

          {/* Neural network pattern */}
          <g clipPath="url(#engine-clip)">
            <circle cx="400" cy="130" r="78" fill="var(--color-surface, #ffffff)" />
            {/* Connection lines */}
            <line x1="400" y1="130" x2="360" y2="100" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.3" />
            <line x1="400" y1="130" x2="440" y2="100" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.3" />
            <line x1="400" y1="130" x2="360" y2="160" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.3" />
            <line x1="400" y1="130" x2="440" y2="160" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.3" />
            <line x1="360" y1="100" x2="440" y2="100" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.2" />
            <line x1="360" y1="160" x2="440" y2="160" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.2" />
            <line x1="360" y1="100" x2="360" y2="160" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.2" />
            <line x1="440" y1="100" x2="440" y2="160" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.2" />

            {/* Network nodes */}
            <circle cx="400" cy="130" r="8" fill="var(--color-primary, #4f46e5)" className="hero-visual__engine-core" />
            <circle cx="360" cy="100" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node" />
            <circle cx="440" cy="100" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node" />
            <circle cx="360" cy="160" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node" />
            <circle cx="440" cy="160" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node" />
            <circle cx="400" cy="85" r="3" fill="var(--color-primary, #4f46e5)" opacity="0.6" className="hero-visual__engine-node" />
            <circle cx="400" cy="175" r="3" fill="var(--color-primary, #4f46e5)" opacity="0.6" className="hero-visual__engine-node" />
          </g>

          {/* Pulsing ring */}
          <circle cx="400" cy="130" r="88" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" opacity="0.3" className="hero-visual__engine-pulse" />

          <text x="400" y="95" textAnchor="middle" fill="var(--color-text)" fontSize="13" fontWeight="700">Gradture AI</text>
          <text x="400" y="175" textAnchor="middle" fill="var(--color-text-secondary, var(--color-text))" fontSize="9" fontWeight="500">Matching Engine</text>
        </g>

        {/* ===== RIGHT: Matched Jobs ===== */}
        <g className="hero-visual__node hero-visual__node--jobs">
          <circle cx="630" cy="340" r="70" fill="var(--color-surface, #ffffff)" stroke="var(--color-success, #059669)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="630" cy="340" r="66" fill="url(#profile-grad)" className="hero-visual__jobs-bg" />

          <g clipPath="url(#profile-clip)">
            <circle cx="630" cy="340" r="56" fill="var(--color-surface, #ffffff)" />
            {/* Mini job card 1 */}
            <rect x="590" y="315" width="80" height="22" rx="4" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" className="hero-visual__job-card" />
            <circle cx="600" cy="326" r="5" fill="var(--color-primary-soft, #eef2ff)" />
            <text x="615" y="322" fill="var(--color-text)" fontSize="7" fontWeight="600">Frontend Dev</text>
            <text x="615" y="332" fill="var(--color-text-secondary, var(--color-text))" fontSize="6">Acme Corp</text>
            <circle cx="658" cy="326" r="8" fill="var(--color-success-soft, #ecfdf5)" />
            <text x="658" y="329" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="7" fontWeight="700">94%</text>

            {/* Mini job card 2 */}
            <rect x="590" y="345" width="80" height="22" rx="4" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" className="hero-visual__job-card" />
            <circle cx="600" cy="356" r="5" fill="var(--color-info-soft, #eff6ff)" />
            <text x="615" y="352" fill="var(--color-text)" fontSize="7" fontWeight="600">UI Designer</text>
            <text x="615" y="362" fill="var(--color-text-secondary, var(--color-text))" fontSize="6">Globex</text>
            <circle cx="658" cy="356" r="8" fill="var(--color-success-soft, #ecfdf5)" />
            <text x="658" y="359" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="7" fontWeight="700">87%</text>
          </g>

          <circle cx="630" cy="340" r="70" fill="none" stroke="var(--color-success, #059669)" strokeWidth="1" strokeDasharray="6 4" className="hero-visual__jobs-ring" />
          <text x="630" y="410" textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="600">Top Matches</text>
        </g>

        {/* ===== BOTTOM: Match Score ===== */}
        <g className="hero-visual__node hero-visual__node--match">
          <circle cx="400" cy="500" r="76" fill="url(#match-grad)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" filter="url(#hero-shadow)" />
          <circle cx="400" cy="500" r="60" fill="none" stroke="var(--color-primary, #4f46e5)" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />
          <text x="400" y="494" textAnchor="middle" fill="var(--color-text)" fontSize="40" fontWeight="700">96%</text>
          <text x="400" y="512" textAnchor="middle" fill="var(--color-text-secondary, var(--color-text))" fontSize="10" fontWeight="600">AI-Powered Match</text>
          <circle cx="400" cy="500" r="76" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" opacity="0.3" className="hero-visual__pulse" />
        </g>

        {/* ===== DATA STREAMS ===== */}
        <g className="hero-visual__connections">
          {/* Profile → AI Engine (3 streams) */}
          <path d="M240 310 Q320 200 340 160" stroke="url(#stream-left)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.6" className="hero-visual__stream" />
          <path d="M240 340 Q320 240 340 190" stroke="url(#stream-left)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.5" className="hero-visual__stream" />
          <path d="M240 370 Q320 280 340 220" stroke="url(#stream-left)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.4" className="hero-visual__stream" />

          {/* AI Engine → Jobs (3 streams) */}
          <path d="M460 160 Q480 200 560 310" stroke="url(#stream-right)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.6" className="hero-visual__stream" />
          <path d="M460 190 Q480 240 560 340" stroke="url(#stream-right)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.5" className="hero-visual__stream" />
          <path d="M460 220 Q480 280 560 370" stroke="url(#stream-right)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.4" className="hero-visual__stream" />

          {/* AI Engine → Match (center stream) */}
          <path d="M400 218 L400 424" stroke="url(#stream-center)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.5" className="hero-visual__stream" />
        </g>

        {/* Traveling data particles */}
        <g className="hero-visual__particles">
          <circle cx="280" cy="240" r="2.5" fill="var(--color-primary, #4f46e5)" className="hero-visual__particle hero-visual__particle--1" />
          <circle cx="320" cy="280" r="2" fill="var(--color-info, #2563eb)" className="hero-visual__particle hero-visual__particle--2" />
          <circle cx="480" cy="280" r="2" fill="var(--color-success, #059669)" className="hero-visual__particle hero-visual__particle--3" />
          <circle cx="520" cy="240" r="2.5" fill="var(--color-primary, #4f46e5)" className="hero-visual__particle hero-visual__particle--4" />
          <circle cx="400" cy="320" r="2" fill="var(--color-info, #2563eb)" className="hero-visual__particle hero-visual__particle--5" />
        </g>

        {/* Floating accent elements */}
        <circle cx="260" cy="420" r="3" fill="var(--color-primary, #4f46e5)" opacity="0.3" className="hero-visual__float" />
        <circle cx="540" cy="420" r="3" fill="var(--color-success, #059669)" opacity="0.3" className="hero-visual__float" />
        <circle cx="400" cy="200" r="2.5" fill="var(--color-info, #2563eb)" opacity="0.4" className="hero-visual__float" />
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

        /* Glow */
        .hero-visual__glow {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 1.2s ease, transform 1.2s ease;
        }

        .hero-visual--animated .hero-visual__glow {
          opacity: 1;
          transform: scale(1);
        }

        /* Nodes */
        .hero-visual__node {
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hero-visual__node--profile { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.1s; }
        .hero-visual--animated .hero-visual__node--engine { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.35s; }
        .hero-visual--animated .hero-visual__node--jobs { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.5s; }
        .hero-visual--animated .hero-visual__node--match { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.65s; }

        /* Connection streams */
        .hero-visual__connections path {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hero-visual__connections path {
          stroke-dashoffset: 0;
        }

        .hero-visual--animated .hero-visual__connections path:nth-child(1) { transition-delay: 0.4s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(2) { transition-delay: 0.5s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(3) { transition-delay: 0.6s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(4) { transition-delay: 0.5s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(5) { transition-delay: 0.6s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(6) { transition-delay: 0.7s; }
        .hero-visual--animated .hero-visual__connections path:nth-child(7) { transition-delay: 0.7s; }

        /* Floating elements */
        .hero-visual__float {
          animation: hero-float 6s ease-in-out infinite;
        }

        .hero-visual__float:nth-child(2) { animation-delay: 2s; }
        .hero-visual__float:nth-child(3) { animation-delay: 4s; }

        @keyframes hero-float {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-8px); opacity: 0.5; }
        }

        /* Pulse */
        .hero-visual__pulse {
          animation: hero-pulse 3s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes hero-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.12); opacity: 0; }
        }

        /* Particles */
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
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { opacity: 0; transform: translate(40px, -30px); }
        }

        /* Profile animations */
        .hero-visual__profile-bg {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.8s ease 0.15s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
        }

        .hero-visual--animated .hero-visual__profile-bg {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__profile-avatar {
          opacity: 0;
          transform: scale(0.5);
          transition: opacity 0.6s ease 0.3s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s;
        }

        .hero-visual--animated .hero-visual__profile-avatar {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__profile-core {
          opacity: 0;
          transform: scale(0);
          transition: opacity 0.4s ease 0.45s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.45s;
        }

        .hero-visual--animated .hero-visual__profile-core {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__profile-orbit {
          opacity: 0;
          transform: rotate(0deg);
          transition: opacity 0.6s ease 0.5s;
        }

        .hero-visual--animated .hero-visual__profile-orbit {
          opacity: 1;
          animation: profile-orbit 10s linear infinite;
          transform-origin: 170px 340px;
        }

        .hero-visual__profile-ring {
          opacity: 0;
          stroke-dasharray: 8 4;
          stroke-dashoffset: 100;
          transition: opacity 0.6s ease 0.2s, stroke-dashoffset 1.5s ease 0.2s;
        }

        .hero-visual--animated .hero-visual__profile-ring {
          opacity: 0.6;
          stroke-dashoffset: 0;
        }

        @keyframes profile-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* AI Engine animations */
        .hero-visual__engine-bg {
          opacity: 0;
          transform: scale(0.85);
          transition: opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
        }

        .hero-visual--animated .hero-visual__engine-bg {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__engine-core {
          opacity: 0;
          transform: scale(0);
          transition: opacity 0.4s ease 0.4s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s;
        }

        .hero-visual--animated .hero-visual__engine-core {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__engine-node {
          opacity: 0;
          transform: scale(0);
          transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero-visual--animated .hero-visual__engine-node {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual--animated .hero-visual__engine-node:nth-child(1) { transition-delay: 0.5s; }
        .hero-visual--animated .hero-visual__engine-node:nth-child(2) { transition-delay: 0.55s; }
        .hero-visual--animated .hero-visual__engine-node:nth-child(3) { transition-delay: 0.6s; }
        .hero-visual--animated .hero-visual__engine-node:nth-child(4) { transition-delay: 0.65s; }
        .hero-visual--animated .hero-visual__engine-node:nth-child(5) { transition-delay: 0.7s; }
        .hero-visual--animated .hero-visual__engine-node:nth-child(6) { transition-delay: 0.75s; }

        .hero-visual__engine-ring {
          opacity: 0;
          stroke-dasharray: 12 8;
          stroke-dashoffset: 60;
          transition: opacity 0.6s ease 0.3s, stroke-dashoffset 2s ease 0.3s;
        }

        .hero-visual--animated .hero-visual__engine-ring {
          opacity: 0.5;
          stroke-dashoffset: 0;
        }

        .hero-visual__engine-pulse {
          animation: engine-pulse 4s ease-in-out infinite;
          transform-origin: 400px 130px;
        }

        @keyframes engine-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.08); opacity: 0.1; }
        }

        /* Jobs animations */
        .hero-visual__jobs-bg {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.8s ease 0.25s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.25s;
        }

        .hero-visual--animated .hero-visual__jobs-bg {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__job-card {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hero-visual__job-card:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0.6s; }
        .hero-visual--animated .hero-visual__job-card:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.75s; }

        .hero-visual__jobs-ring {
          opacity: 0;
          stroke-dasharray: 8 6;
          stroke-dashoffset: 80;
          transition: opacity 0.6s ease 0.3s, stroke-dashoffset 2s ease 0.3s;
        }

        .hero-visual--animated .hero-visual__jobs-ring {
          opacity: 0.5;
          stroke-dashoffset: 0;
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
          .hero-visual__engine-pulse {
            animation: none;
          }
          .hero-visual__profile-orbit {
            animation: none;
          }
          .hero-visual__profile-avatar,
          .hero-visual__profile-core,
          .hero-visual__engine-core,
          .hero-visual__engine-node,
          .hero-visual__job-card {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};
