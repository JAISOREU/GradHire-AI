import { useEffect, useRef, useState } from 'react';
import { ScrollReveal } from '../../../animations';
import { MOTION } from '../../../animations/motion-tokens';

export const HeroVisual = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const animate = () => {
      const lerp = 0.08;
      const dx = targetRef.current.x - currentRef.current.x;
      const dy = targetRef.current.y - currentRef.current.y;
      currentRef.current.x += dx * lerp;
      currentRef.current.y += dy * lerp;
      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        setMousePos({ ...currentRef.current });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const visualStyle: React.CSSProperties = {
    transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)`,
    transition: 'transform 0.15s ease-out',
  };

  return (
    <ScrollReveal
      options={{
        threshold: 0.2,
        once: true,
        duration: MOTION.duration.slowest,
        distance: MOTION.distance.lg,
        blur: MOTION.blur.md,
        scale: 1,
        direction: 'up',
      }}
      className="hero-visual-wrapper"
    >
      <div
        className="hero-visual"
        style={visualStyle}
        aria-hidden="true"
      >
        <svg viewBox="-60 -120 800 700" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* Glows */}
            <radialGradient id="hero-glow-ai" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.35" />
              <stop offset="60%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hero-glow-secondary" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0" />
            </radialGradient>

            {/* Connection streams */}
            <linearGradient id="stream-left" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="var(--color-warning, #d97706)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="var(--color-warning, #d97706)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="stream-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-success, #059669)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-success, #059669)" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="stream-center" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.65" />
              <stop offset="100%" stopColor="var(--color-success, #059669)" stopOpacity="0.35" />
            </linearGradient>

            {/* Node gradients */}
            <linearGradient id="ai-engine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="profile-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--color-warning, #d97706)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="match-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
              <stop offset="50%" stopColor="var(--color-warning-soft, #fffbeb)" />
              <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
            </linearGradient>

            {/* Shadows */}
            <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--color-primary, #4f46e5)" floodOpacity="0.12" />
            </filter>
            <filter id="hero-shadow-strong" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="16" floodColor="var(--color-primary, #4f46e5)" floodOpacity="0.2" />
            </filter>

            {/* Clips */}
            <clipPath id="profile-clip">
              <circle cx="180" cy="280" r="60" />
            </clipPath>
            <clipPath id="jobs-clip">
              <circle cx="620" cy="300" r="56" />
            </clipPath>
            <clipPath id="engine-clip">
              <circle cx="400" cy="120" r="96" />
            </clipPath>
          </defs>

          {/* Background glows */}
          <circle cx="400" cy="120" r="260" fill="url(#hero-glow-ai)" opacity="0.7" className="hero-visual__glow" />
          <circle cx="400" cy="120" r="180" fill="url(#hero-glow-secondary)" opacity="0.4" className="hero-visual__glow" />

          {/* ===== LEFT: Profile Node ===== */}
          <g className="hero-visual__node hero-visual__node--profile">
            <circle cx="180" cy="280" r="70" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" filter="url(#hero-shadow)" />
            <circle cx="180" cy="280" r="66" fill="url(#profile-grad)" className="hero-visual__profile-bg" />

            <g clipPath="url(#profile-clip)">
              <circle cx="180" cy="280" r="60" fill="var(--color-surface, #ffffff)" />
              <circle cx="180" cy="280" r="24" fill="var(--color-primary-soft, #eef2ff)" className="hero-visual__profile-avatar" />
              <circle cx="180" cy="280" r="10" fill="var(--color-primary, #4f46e5)" className="hero-visual__profile-core" />

              {/* Orbiting skill chips */}
              <g className="hero-visual__profile-orbit">
                <g transform="translate(180, 250)">
                  <rect x="-18" y="-8" width="36" height="16" rx="8" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600">React</text>
                </g>
                <g transform="translate(220, 280)">
                  <rect x="-18" y="-8" width="36" height="16" rx="8" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600">Python</text>
                </g>
                <g transform="translate(180, 310)">
                  <rect x="-18" y="-8" width="36" height="16" rx="8" fill="var(--color-success-soft, #ecfdf5)" stroke="var(--color-success, #059669)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600">SQL</text>
                </g>
                <g transform="translate(140, 280)">
                  <rect x="-18" y="-8" width="36" height="16" rx="8" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
                  <text x="0" y="3" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600">Design</text>
                </g>
              </g>
            </g>

            <circle cx="180" cy="280" r="70" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="6 4" className="hero-visual__profile-ring" />
            <text x="180" y="358" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">Your Profile</text>
          </g>

          {/* ===== CENTER: AI Engine ===== */}
          <g className="hero-visual__node hero-visual__node--engine">
            <circle cx="400" cy="120" r="125" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="8 6" opacity="0.35" className="hero-visual__engine-ring" />

            <circle cx="400" cy="120" r="110" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2.5" filter="url(#hero-shadow-strong)" />
            <circle cx="400" cy="120" r="104" fill="url(#ai-engine-grad)" className="hero-visual__engine-bg" />

            <g clipPath="url(#engine-clip)">
              <circle cx="400" cy="120" r="96" fill="var(--color-surface, #ffffff)" />
              <line x1="400" y1="120" x2="348" y2="80" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.2" opacity="0.55" />
              <line x1="400" y1="120" x2="452" y2="80" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.2" opacity="0.55" />
              <line x1="400" y1="120" x2="348" y2="160" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.2" opacity="0.55" />
              <line x1="400" y1="120" x2="452" y2="160" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.2" opacity="0.55" />
              <line x1="348" y1="80" x2="452" y2="80" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.4" />
              <line x1="348" y1="160" x2="452" y2="160" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.4" />
              <line x1="348" y1="80" x2="348" y2="160" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.4" />
              <line x1="452" y1="80" x2="452" y2="160" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.4" />

              <circle cx="400" cy="120" r="10" fill="var(--color-primary, #4f46e5)" className="hero-visual__engine-core" />
              <circle cx="348" cy="80" r="5" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--1" />
              <circle cx="452" cy="80" r="5" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--2" />
              <circle cx="348" cy="160" r="5" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--3" />
              <circle cx="452" cy="160" r="5" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--4" />
              <circle cx="400" cy="60" r="4" fill="var(--color-primary, #4f46e5)" opacity="0.55" className="hero-visual__engine-node hero-visual__engine-node--5" />
              <circle cx="400" cy="180" r="4" fill="var(--color-primary, #4f46e5)" opacity="0.55" className="hero-visual__engine-node hero-visual__engine-node--6" />
            </g>

            <circle cx="400" cy="120" r="110" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" opacity="0.25" className="hero-visual__engine-pulse" />

            <text x="400" y="75" textAnchor="middle" fill="var(--color-text)" fontSize="16" fontWeight="700">Gradture AI</text>
            <text x="400" y="180" textAnchor="middle" fill="var(--color-text-secondary, var(--color-text))" fontSize="10" fontWeight="500">Matching Engine</text>
          </g>

          {/* ===== RIGHT: Matched Jobs ===== */}
          <g className="hero-visual__node hero-visual__node--jobs">
            <circle cx="620" cy="300" r="70" fill="var(--color-surface, #ffffff)" stroke="var(--color-success, #059669)" strokeWidth="1.5" filter="url(#hero-shadow)" />
            <circle cx="620" cy="300" r="66" fill="url(#profile-grad)" className="hero-visual__jobs-bg" />

            <g clipPath="url(#jobs-clip)">
              <circle cx="620" cy="300" r="56" fill="var(--color-surface, #ffffff)" />
              {/* Mini job card 1 */}
              <rect x="580" y="275" width="80" height="22" rx="4" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" className="hero-visual__job-card" />
              <circle cx="588" cy="286" r="6" fill="var(--color-primary-soft, #eef2ff)" />
              <text x="588" y="289" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="7" fontWeight="700">A</text>
              <text x="605" y="282" fill="var(--color-text)" fontSize="7" fontWeight="600">Frontend Dev</text>
              <text x="605" y="292" fill="var(--color-text-secondary, var(--color-text))" fontSize="6">Acme Corp</text>
              <circle cx="648" cy="286" r="8" fill="var(--color-success-soft, #ecfdf5)" />
              <text x="648" y="289" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="7" fontWeight="700">94%</text>

              {/* Mini job card 2 */}
              <rect x="580" y="305" width="80" height="22" rx="4" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" className="hero-visual__job-card" />
              <circle cx="588" cy="316" r="6" fill="var(--color-info-soft, #eff6ff)" />
              <text x="588" y="319" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="7" fontWeight="700">G</text>
              <text x="605" y="312" fill="var(--color-text)" fontSize="7" fontWeight="600">UI Designer</text>
              <text x="605" y="322" fill="var(--color-text-secondary, var(--color-text))" fontSize="6">Globex</text>
              <circle cx="648" cy="316" r="8" fill="var(--color-success-soft, #ecfdf5)" />
              <text x="648" y="319" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="7" fontWeight="700">87%</text>
            </g>

            <circle cx="620" cy="300" r="70" fill="none" stroke="var(--color-success, #059669)" strokeWidth="1" strokeDasharray="6 4" className="hero-visual__jobs-ring" />
            <text x="620" y="378" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">Top Matches</text>
          </g>

          {/* ===== BOTTOM CENTER: Match Score ===== */}
          <g className="hero-visual__node hero-visual__node--match">
            <circle cx="400" cy="330" r="65" fill="url(#match-grad)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2.5" filter="url(#hero-shadow-strong)" />
            <circle cx="400" cy="330" r="52" fill="none" stroke="var(--color-primary, #4f46e5)" strokeOpacity="0.18" strokeWidth="1" strokeDasharray="4 3" />
            <text x="400" y="324" textAnchor="middle" fill="var(--color-text)" fontSize="40" fontWeight="700">96%</text>
            <text x="400" y="342" textAnchor="middle" fill="var(--color-text-secondary, var(--color-text))" fontSize="10" fontWeight="600">AI-Powered Match</text>
            <circle cx="400" cy="330" r="65" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" opacity="0.35" className="hero-visual__pulse" />
          </g>

          {/* ===== DATA STREAMS ===== */}
          <g className="hero-visual__connections">
            {/* Profile → AI Engine */}
            <path d="M250 260 Q320 240 360 200" stroke="url(#stream-left)" strokeWidth="2.5" strokeDasharray="6 4" fill="none" opacity="0.8" className="hero-visual__stream" />
            <circle r="2.5" fill="var(--color-warning, #d97706)" opacity="0.85">
              <animateMotion dur="2.2s" repeatCount="indefinite" path="M250 260 Q320 240 360 200" />
            </circle>

            <path d="M250 280 Q330 250 360 210" stroke="url(#stream-left)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.65" className="hero-visual__stream" />
            <circle r="2" fill="var(--color-warning, #d97706)" opacity="0.85">
              <animateMotion dur="2.5s" repeatCount="indefinite" path="M250 280 Q330 250 360 210" />
            </circle>

            <path d="M250 300 Q320 270 360 220" stroke="url(#stream-left)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" className="hero-visual__stream" />
            <circle r="2" fill="var(--color-warning, #d97706)" opacity="0.75">
              <animateMotion dur="2.8s" repeatCount="indefinite" path="M250 300 Q320 270 360 220" />
            </circle>

            {/* AI Engine → Jobs */}
            <path d="M440 80 Q500 140 560 270" stroke="url(#stream-right)" strokeWidth="2.5" strokeDasharray="6 4" fill="none" opacity="0.8" className="hero-visual__stream" />
            <circle r="2.5" fill="var(--color-success, #059669)" opacity="0.85">
              <animateMotion dur="2.2s" repeatCount="indefinite" path="M440 80 Q500 140 560 270" />
            </circle>

            <path d="M452 120 Q520 180 560 300" stroke="url(#stream-right)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.65" className="hero-visual__stream" />
            <circle r="2" fill="var(--color-success, #059669)" opacity="0.85">
              <animateMotion dur="2.5s" repeatCount="indefinite" path="M452 120 Q520 180 560 300" />
            </circle>

            <path d="M440 160 Q500 200 560 330" stroke="url(#stream-right)" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.5" className="hero-visual__stream" />
            <circle r="2" fill="var(--color-success, #059669)" opacity="0.75">
              <animateMotion dur="2.8s" repeatCount="indefinite" path="M440 160 Q500 200 560 330" />
            </circle>

            {/* AI Engine → Match */}
            <path d="M400 230 L400 265" stroke="url(#stream-center)" strokeWidth="3" fill="none" opacity="0.75" className="hero-visual__stream hero-visual__stream--center" />
            <circle r="2" fill="var(--color-primary, #4f46e5)" opacity="0.85">
              <animateMotion dur="1.5s" repeatCount="indefinite" path="M400 230 L400 265" />
            </circle>
            <circle r="1.5" fill="var(--color-primary, #4f46e5)" opacity="0.65">
              <animateMotion dur="1.0s" begin="0.75s" repeatCount="indefinite" path="M400 230 L400 265" />
            </circle>
          </g>
        </svg>

        <style>{`
          .hero-visual-wrapper {
            position: relative;
            width: 100%;
            max-width: 100%;
          }

          .hero-visual {
            position: relative;
            width: 100%;
          }

          .hero-visual svg {
            width: 100%;
            height: auto;
            display: block;
          }

          /* Glow */
          .hero-visual__glow {
            opacity: 0;
            transform: scale(0.85);
            transition: opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1), transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .scroll-reveal--visible .hero-visual__glow {
            opacity: 1;
            transform: scale(1);
          }

          /* Nodes */
          .hero-visual__node {
            opacity: 0;
            transform: translateY(16px) scale(0.92);
            transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .scroll-reveal--visible .hero-visual__node--profile { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.05s; }
          .scroll-reveal--visible .hero-visual__node--engine { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.2s; }
          .scroll-reveal--visible .hero-visual__node--jobs { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.4s; }
          .scroll-reveal--visible .hero-visual__node--match { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.55s; }

          /* Connection streams */
          .hero-visual__connections path {
            stroke-dasharray: 240;
            stroke-dashoffset: 240;
            transition: stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .scroll-reveal--visible .hero-visual__connections path {
            stroke-dashoffset: 0;
          }

          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(1) { transition-delay: 0.15s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(2) { transition-delay: 0.2s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(3) { transition-delay: 0.25s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(4) { transition-delay: 0.25s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(5) { transition-delay: 0.3s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(6) { transition-delay: 0.35s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(7) { transition-delay: 0.3s; }

          .hero-visual__stream--center {
            stroke-dasharray: 120;
            stroke-dashoffset: 120;
            transition: stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1);
          }

          /* Pulse */
          .hero-visual__pulse {
            animation: hero-pulse 3.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }

          @keyframes hero-pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.2); opacity: 0; }
          }

          /* Profile animations */
          .hero-visual__profile-bg {
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.9s ease 0.1s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
          }

          .scroll-reveal--visible .hero-visual__profile-bg {
            opacity: 1;
            transform: scale(1);
          }

          .hero-visual__profile-avatar {
            opacity: 0;
            transform: scale(0.5);
            transition: opacity 0.7s ease 0.2s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s;
          }

          .scroll-reveal--visible .hero-visual__profile-avatar {
            opacity: 1;
            transform: scale(1);
          }

          .hero-visual__profile-core {
            opacity: 0;
            transform: scale(0);
            transition: opacity 0.5s ease 0.3s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s;
          }

          .scroll-reveal--visible .hero-visual__profile-core {
            opacity: 1;
            transform: scale(1);
          }

          .hero-visual__profile-orbit {
            opacity: 0;
            transform: rotate(0deg);
            transition: opacity 0.7s ease 0.35s;
          }

          .scroll-reveal--visible .hero-visual__profile-orbit {
            opacity: 1;
            animation: profile-orbit 12s linear infinite;
            transform-origin: 180px 280px;
          }

          .hero-visual__profile-ring {
            opacity: 0;
            stroke-dasharray: 8 4;
            stroke-dashoffset: 100;
            transition: opacity 0.7s ease 0.15s, stroke-dashoffset 1.8s ease 0.15s;
          }

          .scroll-reveal--visible .hero-visual__profile-ring {
            opacity: 0.55;
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
            transition: opacity 0.9s ease 0.15s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
          }

          .scroll-reveal--visible .hero-visual__engine-bg {
            opacity: 1;
            transform: scale(1);
          }

          .hero-visual__engine-core {
            opacity: 0;
            transform: scale(0);
            transition: opacity 0.5s ease 0.3s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s;
          }

          .scroll-reveal--visible .hero-visual__engine-core {
            opacity: 1;
            transform: scale(1);
          }

          .hero-visual__engine-node {
            opacity: 0;
            transform: scale(0);
            transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .scroll-reveal--visible .hero-visual__engine-node {
            opacity: 1;
            transform: scale(1);
          }

          .scroll-reveal--visible .hero-visual__engine-node--1 { transition-delay: 0.35s; }
          .scroll-reveal--visible .hero-visual__engine-node--2 { transition-delay: 0.4s; }
          .scroll-reveal--visible .hero-visual__engine-node--3 { transition-delay: 0.45s; }
          .scroll-reveal--visible .hero-visual__engine-node--4 { transition-delay: 0.5s; }
          .scroll-reveal--visible .hero-visual__engine-node--5 { transition-delay: 0.5s; }
          .scroll-reveal--visible .hero-visual__engine-node--6 { transition-delay: 0.55s; }

          .hero-visual__engine-ring {
            opacity: 0;
            stroke-dasharray: 12 8;
            stroke-dashoffset: 60;
            transition: opacity 0.7s ease 0.25s, stroke-dashoffset 2.2s ease 0.25s;
          }

          .scroll-reveal--visible .hero-visual__engine-ring {
            opacity: 0.45;
            stroke-dashoffset: 0;
          }

          .hero-visual__engine-pulse {
            animation: engine-pulse 4.5s ease-in-out infinite;
            transform-origin: 400px 120px;
          }

          @keyframes engine-pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.08); opacity: 0.1; }
          }

          /* Jobs animations */
          .hero-visual__jobs-bg {
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.9s ease 0.2s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
          }

          .scroll-reveal--visible .hero-visual__jobs-bg {
            opacity: 1;
            transform: scale(1);
          }

          .hero-visual__job-card {
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .scroll-reveal--visible .hero-visual__job-card:nth-of-type(1) { opacity: 1; transform: translateY(0); transition-delay: 0.45s; }
          .scroll-reveal--visible .hero-visual__job-card:nth-of-type(2) { opacity: 1; transform: translateY(0); transition-delay: 0.55s; }

          .hero-visual__jobs-ring {
            opacity: 0;
            stroke-dasharray: 8 6;
            stroke-dashoffset: 80;
            transition: opacity 0.7s ease 0.25s, stroke-dashoffset 2.2s ease 0.25s;
          }

          .scroll-reveal--visible .hero-visual__jobs-ring {
            opacity: 0.45;
            stroke-dashoffset: 0;
          }

          /* Hover micro-interactions */
          .hero-visual:hover .hero-visual__profile-orbit g {
            transform: scale(1.12);
            transform-box: fill-box;
            transform-origin: center;
            transition: transform 0.25s ease;
          }

          .hero-visual:hover .hero-visual__job-card {
            transform: translateY(-2px);
            transition: transform 0.25s ease;
          }

          .hero-visual:hover .hero-visual__engine-core {
            transform: scale(1.2);
            transform-box: fill-box;
            transform-origin: center;
            transition: transform 0.35s ease;
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-visual__node,
            .hero-visual__glow,
            .hero-visual__connections path {
              transition-duration: 0.01ms !important;
              transition-delay: 0ms !important;
            }
            .hero-visual__engine-pulse,
            .hero-visual__profile-orbit,
            .hero-visual__pulse {
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

          @media (max-width: 768px) {
            .hero-visual__node--profile { transform: scale(0.9); }
            .hero-visual__node--engine { transform: scale(0.9); }
            .hero-visual__node--jobs { transform: scale(0.9); }
            .hero-visual__node--match { transform: scale(0.9); }
          }
        `}</style>
      </div>
    </ScrollReveal>
  );
};
