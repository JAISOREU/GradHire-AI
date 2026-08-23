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
        <svg viewBox="0 0 800 560" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="hero-glow-ai" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.25" />
              <stop offset="60%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hero-glow-secondary" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="stream-left" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-warning, #d97706)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="var(--color-warning, #d97706)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="stream-right" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-success, #059669)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-success, #059669)" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="stream-center" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-success, #059669)" stopOpacity="0.25" />
            </linearGradient>

            <linearGradient id="ai-engine-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="profile-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--color-warning, #d97706)" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="match-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
              <stop offset="50%" stopColor="var(--color-warning-soft, #fffbeb)" />
              <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
            </linearGradient>

            <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--color-primary, #4f46e5)" floodOpacity="0.08" />
            </filter>
            <filter id="hero-shadow-strong" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="var(--color-primary, #4f46e5)" floodOpacity="0.12" />
            </filter>

            <clipPath id="profile-clip">
              <circle cx="200" cy="340" r="52" />
            </clipPath>
            <clipPath id="jobs-clip">
              <circle cx="600" cy="340" r="52" />
            </clipPath>
            <clipPath id="engine-clip">
              <circle cx="400" cy="100" r="78" />
            </clipPath>
          </defs>

          <circle cx="400" cy="100" r="180" fill="url(#hero-glow-ai)" opacity="0.5" className="hero-visual__glow" />
          <circle cx="400" cy="100" r="110" fill="url(#hero-glow-secondary)" opacity="0.3" className="hero-visual__glow" />

          <g className="hero-visual__node hero-visual__node--profile">
            <circle cx="200" cy="340" r="62" fill="var(--color-surface, #ffffff)" stroke="var(--color-warning, #d97706)" strokeWidth="1.5" filter="url(#hero-shadow)" />
            <circle cx="200" cy="340" r="58" fill="url(#profile-grad)" className="hero-visual__profile-bg" />

            <g clipPath="url(#profile-clip)">
              <circle cx="200" cy="340" r="52" fill="var(--color-surface, #ffffff)" />
              <circle cx="200" cy="340" r="20" fill="var(--color-warning-soft, #fffbeb)" className="hero-visual__profile-avatar" />
              <circle cx="200" cy="340" r="8" fill="var(--color-warning, #d97706)" className="hero-visual__profile-core" />

              <g className="hero-visual__profile-orbit">
                <g transform="translate(200, 314)">
                  <rect x="-15" y="-6" width="30" height="12" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
                  <text x="0" y="2.5" textAnchor="middle" fill="var(--color-text)" fontSize="7.5" fontWeight="600" className="hero-visual__invert-text">React</text>
                </g>
                <g transform="translate(232, 340)">
                  <rect x="-15" y="-6" width="30" height="12" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-info, #2563eb)" strokeWidth="1" />
                  <text x="0" y="2.5" textAnchor="middle" fill="var(--color-text)" fontSize="7.5" fontWeight="600" className="hero-visual__invert-text">Python</text>
                </g>
                <g transform="translate(200, 366)">
                  <rect x="-15" y="-6" width="30" height="12" rx="6" fill="var(--color-success-soft, #ecfdf5)" stroke="var(--color-success, #059669)" strokeWidth="1" />
                  <text x="0" y="2.5" textAnchor="middle" fill="var(--color-text)" fontSize="7.5" fontWeight="600" className="hero-visual__invert-text">SQL</text>
                </g>
                <g transform="translate(168, 340)">
                  <rect x="-15" y="-6" width="30" height="12" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" />
                  <text x="0" y="2.5" textAnchor="middle" fill="var(--color-text)" fontSize="7.5" fontWeight="600" className="hero-visual__invert-text">Design</text>
                </g>
              </g>
            </g>

            <circle cx="200" cy="340" r="62" fill="none" stroke="var(--color-warning, #d97706)" strokeWidth="1" strokeDasharray="6 4" className="hero-visual__profile-ring" />
            <text x="200" y="405" textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="600" className="hero-visual__invert-text">Your Profile</text>
          </g>

          <g className="hero-visual__node hero-visual__node--engine">
            <circle cx="400" cy="100" r="95" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="8 6" opacity="0.25" className="hero-visual__engine-ring" />

            <circle cx="400" cy="100" r="84" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2.5" filter="url(#hero-shadow-strong)" />
            <circle cx="400" cy="100" r="79" fill="url(#ai-engine-grad)" className="hero-visual__engine-bg" />

            <g clipPath="url(#engine-clip)">
              <circle cx="400" cy="100" r="78" fill="var(--color-surface, #ffffff)" />
              <line x1="400" y1="100" x2="356" y2="64" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.45" />
              <line x1="400" y1="100" x2="444" y2="64" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.45" />
              <line x1="400" y1="100" x2="356" y2="136" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.45" />
              <line x1="400" y1="100" x2="444" y2="136" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.45" />
              <line x1="356" y1="64" x2="444" y2="64" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.3" />
              <line x1="356" y1="136" x2="444" y2="136" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.3" />
              <line x1="356" y1="64" x2="356" y2="136" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.3" />
              <line x1="444" y1="64" x2="444" y2="136" stroke="var(--color-info, #2563eb)" strokeWidth="1" opacity="0.3" />

              <circle cx="400" cy="100" r="8" fill="var(--color-primary, #4f46e5)" className="hero-visual__engine-core" />
              <circle cx="356" cy="64" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--1" />
              <circle cx="444" cy="64" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--2" />
              <circle cx="356" cy="136" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--3" />
              <circle cx="444" cy="136" r="4" fill="var(--color-info, #2563eb)" className="hero-visual__engine-node hero-visual__engine-node--4" />
              <circle cx="400" cy="50" r="3" fill="var(--color-primary, #4f46e5)" opacity="0.45" className="hero-visual__engine-node hero-visual__engine-node--5" />
              <circle cx="400" cy="150" r="3" fill="var(--color-primary, #4f46e5)" opacity="0.45" className="hero-visual__engine-node hero-visual__engine-node--6" />
            </g>

            <circle cx="400" cy="100" r="84" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" opacity="0.18" className="hero-visual__engine-pulse" />

            <text x="400" y="60" textAnchor="middle" fill="var(--color-text)" fontSize="14" fontWeight="700" className="hero-visual__invert-text">Gradture AI</text>
            <text x="400" y="150" textAnchor="middle" fill="var(--color-text-secondary, var(--color-text))" fontSize="9" fontWeight="500" className="hero-visual__invert-text">Matching Engine</text>
          </g>

          <g className="hero-visual__node hero-visual__node--jobs">
            <circle cx="600" cy="340" r="62" fill="var(--color-surface, #ffffff)" stroke="var(--color-success, #059669)" strokeWidth="1.5" filter="url(#hero-shadow)" />
            <circle cx="600" cy="340" r="58" fill="url(#profile-grad)" className="hero-visual__jobs-bg" />

            <g clipPath="url(#jobs-clip)">
              <circle cx="600" cy="340" r="52" fill="var(--color-surface, #ffffff)" />
              <rect x="564" y="318" width="72" height="18" rx="3.5" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" className="hero-visual__job-card" />
              <circle cx="572" cy="327" r="5" fill="var(--color-primary-soft, #eef2ff)" />
              <text x="572" y="329.5" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="6" fontWeight="700">A</text>
              <text x="586" y="325" fill="var(--color-text)" fontSize="6" fontWeight="600" className="hero-visual__invert-text">Frontend Dev</text>
              <text x="586" y="333" fill="var(--color-text-secondary, var(--color-text))" fontSize="5" className="hero-visual__invert-text">Acme Corp</text>
              <circle cx="624" cy="327" r="6.5" fill="var(--color-success-soft, #ecfdf5)" />
              <text x="624" y="329.5" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="6" fontWeight="700">94%</text>

              <rect x="564" y="344" width="72" height="18" rx="3.5" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" className="hero-visual__job-card" />
              <circle cx="572" cy="353" r="5" fill="var(--color-info-soft, #eff6ff)" />
              <text x="572" y="355.5" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="6" fontWeight="700">G</text>
              <text x="586" y="351" fill="var(--color-text)" fontSize="6" fontWeight="600" className="hero-visual__invert-text">UI Designer</text>
              <text x="586" y="359" fill="var(--color-text-secondary, var(--color-text))" fontSize="5" className="hero-visual__invert-text">Globex</text>
              <circle cx="624" cy="353" r="6.5" fill="var(--color-success-soft, #ecfdf5)" />
              <text x="624" y="355.5" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="6" fontWeight="700">87%</text>
            </g>

            <circle cx="600" cy="340" r="62" fill="none" stroke="var(--color-success, #059669)" strokeWidth="1" strokeDasharray="6 4" className="hero-visual__jobs-ring" />
            <text x="600" y="405" textAnchor="middle" fill="var(--color-text)" fontSize="11" fontWeight="600" className="hero-visual__invert-text">Top Matches</text>
          </g>

          <g className="hero-visual__node hero-visual__node--match">
            <circle cx="400" cy="340" r="56" fill="url(#match-grad)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2.5" filter="url(#hero-shadow-strong)" />
            <circle cx="400" cy="340" r="45" fill="none" stroke="var(--color-primary, #4f46e5)" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="4 3" />
            <text x="400" y="335" textAnchor="middle" fill="var(--color-text)" fontSize="32" fontWeight="700" className="hero-visual__invert-text">96%</text>
            <text x="400" y="352" textAnchor="middle" fill="var(--color-text-secondary, var(--color-text))" fontSize="8.5" fontWeight="600" className="hero-visual__invert-text">AI-Powered Match</text>
            <circle cx="400" cy="340" r="56" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" opacity="0.25" className="hero-visual__pulse" />
          </g>

          <g className="hero-visual__connections">
            <path d="M262 295 Q340 230 360 175" stroke="url(#stream-left)" strokeWidth="2.2" strokeDasharray="6 4" fill="none" opacity="0.7" className="hero-visual__stream" />
            <circle r="2.2" fill="var(--color-warning, #d97706)" opacity="0.85">
              <animateMotion dur="2.2s" repeatCount="indefinite" path="M262 295 Q340 230 360 175" />
            </circle>

            <path d="M440 165 Q520 240 558 295" stroke="url(#stream-right)" strokeWidth="2.2" strokeDasharray="6 4" fill="none" opacity="0.7" className="hero-visual__stream" />
            <circle r="2.2" fill="var(--color-success, #059669)" opacity="0.85">
              <animateMotion dur="2.2s" repeatCount="indefinite" path="M440 165 Q520 240 558 295" />
            </circle>

            <path d="M400 180 L400 284" stroke="url(#stream-center)" strokeWidth="2.2" fill="none" opacity="0.65" className="hero-visual__stream hero-visual__stream--center" />
            <circle r="1.8" fill="var(--color-primary, #4f46e5)" opacity="0.85">
              <animateMotion dur="1.5s" repeatCount="indefinite" path="M400 180 L400 284" />
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

          .hero-visual__glow {
            opacity: 0;
            transform: scale(0.85);
            transition: opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1), transform 1.4s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .scroll-reveal--visible .hero-visual__glow {
            opacity: 1;
            transform: scale(1);
          }

          .hero-visual__node {
            opacity: 0;
            transform: translateY(16px) scale(0.92);
            transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .scroll-reveal--visible .hero-visual__node--profile { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.05s; }
          .scroll-reveal--visible .hero-visual__node--engine { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.2s; }
          .scroll-reveal--visible .hero-visual__node--jobs { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.4s; }
          .scroll-reveal--visible .hero-visual__node--match { opacity: 1; transform: translateY(0) scale(1); transition-delay: 0.55s; }

          .hero-visual__connections path {
            stroke-dasharray: 240;
            stroke-dashoffset: 240;
            transition: stroke-dashoffset 1.4s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .scroll-reveal--visible .hero-visual__connections path {
            stroke-dashoffset: 0;
          }

          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(1) { transition-delay: 0.15s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(2) { transition-delay: 0.25s; }
          .scroll-reveal--visible .hero-visual__connections path:nth-of-type(3) { transition-delay: 0.35s; }

          .hero-visual__stream--center {
            stroke-dasharray: 120;
            stroke-dashoffset: 120;
            transition: stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1);
          }

          .hero-visual__pulse {
            animation: hero-pulse 3.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }

          @keyframes hero-pulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.18); opacity: 0; }
          }

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
            transform-origin: 200px 340px;
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
            transform-origin: 400px 100px;
          }

          @keyframes engine-pulse {
            0%, 100% { transform: scale(1); opacity: 0.25; }
            50% { transform: scale(1.06); opacity: 0.08; }
          }

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
            .hero-visual__node--profile { transform: scale(0.85); }
            .hero-visual__node--engine { transform: scale(0.85); }
            .hero-visual__node--jobs { transform: scale(0.85); }
            .hero-visual__node--match { transform: scale(0.85); }
          }
        `}</style>
      </div>
    </ScrollReveal>
  );
};
