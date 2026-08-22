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
          <radialGradient id="hero-glow-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-glow-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-conn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="hero-card" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-surface-muted, #fefcf8)" />
            <stop offset="100%" stopColor="var(--color-surface, #ffffff)" />
          </linearGradient>
          <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="var(--color-primary, #4f46e5)" floodOpacity="0.2" />
          </filter>
          <linearGradient id="hero-btn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" />
          </linearGradient>
          <linearGradient id="profile-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="skills-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="opportunity-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-success, #059669)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.15" />
          </linearGradient>
          <clipPath id="profile-clip">
            <circle cx="160" cy="200" r="60" />
          </clipPath>
          <clipPath id="skills-clip">
            <circle cx="400" cy="120" r="52" />
          </clipPath>
          <clipPath id="opportunity-clip">
            <circle cx="640" cy="200" r="60" />
          </clipPath>
        </defs>

        {/* Ambient glows */}
        <circle cx="400" cy="300" r="280" fill="url(#hero-glow-1)" opacity="0.5" className="hero-visual__glow" />
        <circle cx="400" cy="300" r="200" fill="url(#hero-glow-2)" opacity="0.4" className="hero-visual__glow" />

        {/* Profile node */}
        <g className="hero-visual__node hero-visual__node--profile">
          <circle cx="160" cy="200" r="72" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="160" cy="200" r="68" fill="url(#profile-grad)" className="hero-visual__profile-bg" />
          <g clipPath="url(#profile-clip)">
            <circle cx="160" cy="200" r="60" fill="var(--color-surface, #ffffff)" />
            <circle cx="160" cy="200" r="28" fill="var(--color-primary-soft, #eef2ff)" className="hero-visual__profile-avatar" />
            <circle cx="160" cy="200" r="12" fill="var(--color-primary, #4f46e5)" className="hero-visual__profile-core" />
            <g className="hero-visual__profile-orbit">
              <circle cx="160" cy="168" r="4" fill="var(--color-info, #2563eb)" />
              <circle cx="192" cy="200" r="3" fill="var(--color-primary, #4f46e5)" />
              <circle cx="160" cy="232" r="3.5" fill="var(--color-success, #059669)" />
              <circle cx="128" cy="200" r="4" fill="var(--color-primary, #4f46e5)" />
            </g>
          </g>
          <circle cx="160" cy="200" r="72" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" strokeDasharray="6 4" className="hero-visual__profile-ring" />
          <text x="160" y="264" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">Profile</text>
        </g>

        {/* Skills node */}
        <g className="hero-visual__node hero-visual__node--skills">
          <circle cx="400" cy="120" r="64" fill="var(--color-surface, #ffffff)" stroke="var(--color-info, #2563eb)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="400" cy="120" r="60" fill="url(#skills-grad)" className="hero-visual__skills-bg" />
          <g clipPath="url(#skills-clip)">
            <circle cx="400" cy="120" r="52" fill="var(--color-surface, #ffffff)" />
            <circle cx="400" cy="120" r="6" fill="var(--color-primary, #4f46e5)" className="hero-visual__skills-center" />
            <g className="hero-visual__skills-orbit">
              <circle cx="400" cy="88" r="5" fill="var(--color-info, #2563eb)" />
              <circle cx="428" cy="104" r="4" fill="var(--color-primary, #4f46e5)" />
              <circle cx="428" cy="136" r="5" fill="var(--color-success, #059669)" />
              <circle cx="400" cy="152" r="4" fill="var(--color-info, #2563eb)" />
              <circle cx="372" cy="136" r="5" fill="var(--color-primary, #4f46e5)" />
              <circle cx="372" cy="104" r="4" fill="var(--color-success, #059669)" />
            </g>
          </g>
          <circle cx="400" cy="120" r="64" fill="none" stroke="var(--color-info, #2563eb)" strokeWidth="1" strokeDasharray="4 6" className="hero-visual__skills-ring" />
          <text x="400" y="168" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">Skills</text>
        </g>

        {/* Job node */}
        <g className="hero-visual__node hero-visual__node--job">
          <circle cx="640" cy="200" r="72" fill="var(--color-surface, #ffffff)" stroke="var(--color-success, #059669)" strokeWidth="1.5" filter="url(#hero-shadow)" />
          <circle cx="640" cy="200" r="68" fill="url(#opportunity-grad)" className="hero-visual__opportunity-bg" />
          <g clipPath="url(#opportunity-clip)">
            <circle cx="640" cy="200" r="60" fill="var(--color-surface, #ffffff)" />
            <rect x="612" y="185" width="56" height="6" rx="3" fill="var(--color-border-strong, #d5cfc6)" className="hero-visual__opportunity-line" />
            <rect x="612" y="200" width="40" height="6" rx="3" fill="var(--color-border, #e8e2d8)" className="hero-visual__opportunity-line" />
            <rect x="612" y="215" width="48" height="6" rx="3" fill="var(--color-border-strong, #d5cfc6)" className="hero-visual__opportunity-line" />
            <circle cx="658" cy="235" r="12" fill="var(--color-success-soft, #ecfdf5)" stroke="var(--color-success, #059669)" strokeWidth="1.5" className="hero-visual__opportunity-check" />
            <path d="M654 235 L657 238 L662 232" stroke="var(--color-success, #059669)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" className="hero-visual__opportunity-check" />
          </g>
          <circle cx="640" cy="200" r="72" fill="none" stroke="var(--color-success, #059669)" strokeWidth="1" strokeDasharray="8 4" className="hero-visual__opportunity-ring" />
          <text x="640" y="250" textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">Opportunity</text>
        </g>

        {/* Match node */}
        <g className="hero-visual__node hero-visual__node--match">
          <circle cx="400" cy="420" r="84" fill="url(#hero-card)" stroke="var(--color-primary, #4f46e5)" strokeWidth="2" filter="url(#hero-shadow)" />
          <circle cx="400" cy="420" r="64" fill="none" stroke="var(--color-primary, #4f46e5)" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 3" />
          <text x="405" y="412" textAnchor="middle" fill="var(--color-text)" fontSize="36" fontWeight="700">96%</text>
          <text x="400" y="432" textAnchor="middle" fill="var(--color-text-secondary, var(--color-text))" fontSize="12" fontWeight="600">Match</text>
          <circle cx="400" cy="420" r="84" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1.5" opacity="0.3" className="hero-visual__pulse" />
        </g>

        {/* Apply button */}
        <g className="hero-visual__node hero-visual__node--apply">
          <rect x="340" y="440" width="120" height="36" rx="18" fill="url(#hero-btn)" filter="url(#hero-shadow)" />
          <text x="400" y="463" textAnchor="middle" fill="var(--color-primary-text, #ffffff)" fontSize="12" fontWeight="700">Apply Now</text>
        </g>

        {/* Scanning line */}
        <g className="hero-visual__scan" opacity="0.4">
          <rect x="80" y="60" width="640" height="3" rx="1.5" fill="url(#hero-conn)" className="hero-visual__scan-line" />
        </g>

        {/* Connection lines */}
        <g className="hero-visual__connections">
          <path d="M232 172 Q300 140 340 150" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
          <path d="M460 156 Q520 140 568 172" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
          <path d="M228 228 Q300 280 340 360" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
          <path d="M572 228 Q500 280 460 360" stroke="url(#hero-conn)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.7" />
        </g>

        {/* Traveling light particles */}
        <g className="hero-visual__particles">
          <circle cx="280" cy="280" r="3" fill="var(--color-primary, #4f46e5)" className="hero-visual__particle hero-visual__particle--1" />
          <circle cx="340" cy="300" r="2.5" fill="var(--color-info, #2563eb)" className="hero-visual__particle hero-visual__particle--2" />
          <circle cx="460" cy="260" r="3" fill="var(--color-primary, #4f46e5)" className="hero-visual__particle hero-visual__particle--3" />
          <circle cx="520" cy="320" r="2.5" fill="var(--color-info, #2563eb)" className="hero-visual__particle hero-visual__particle--4" />
          <circle cx="380" cy="360" r="2" fill="var(--color-success, #059669)" className="hero-visual__particle hero-visual__particle--5" />
        </g>

        {/* Floating accent elements */}
        <circle cx="280" cy="360" r="4" fill="var(--color-primary, #4f46e5)" opacity="0.4" className="hero-visual__float" />
        <circle cx="520" cy="370" r="3.5" fill="var(--color-info, #2563eb)" opacity="0.4" className="hero-visual__float" />
        <circle cx="260" cy="500" r="3" fill="var(--color-success, #059669)" opacity="0.3" className="hero-visual__float" />
        <circle cx="540" cy="500" r="3.5" fill="var(--color-primary, #4f46e5)" opacity="0.3" className="hero-visual__float" />
        <circle cx="400" cy="260" r="2.5" fill="var(--color-info, #2563eb)" opacity="0.3" className="hero-visual__float" />
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
          animation: profile-orbit 8s linear infinite;
          transform-origin: 160px 200px;
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

        /* Skills animations */
        .hero-visual__skills-bg {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.8s ease 0.2s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
        }

        .hero-visual--animated .hero-visual__skills-bg {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__skills-center {
          opacity: 0;
          transform: scale(0);
          transition: opacity 0.4s ease 0.4s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s;
        }

        .hero-visual--animated .hero-visual__skills-center {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__skills-orbit {
          opacity: 0;
          transform: rotate(0deg);
          transition: opacity 0.6s ease 0.5s;
        }

        .hero-visual--animated .hero-visual__skills-orbit {
          opacity: 1;
          animation: skills-orbit 6s linear infinite;
          transform-origin: 400px 120px;
        }

        .hero-visual__skills-ring {
          opacity: 0;
          stroke-dasharray: 12 8;
          stroke-dashoffset: 50;
          transition: opacity 0.6s ease 0.3s, stroke-dashoffset 2s ease 0.3s;
        }

        .hero-visual--animated .hero-visual__skills-ring {
          opacity: 0.5;
          stroke-dashoffset: 0;
        }

        @keyframes skills-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        /* Opportunity animations */
        .hero-visual__opportunity-bg {
          opacity: 0;
          transform: scale(0.8);
          transition: opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
        }

        .hero-visual--animated .hero-visual__opportunity-bg {
          opacity: 1;
          transform: scale(1);
        }

        .hero-visual__opportunity-line {
          opacity: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .hero-visual--animated .hero-visual__opportunity-line:nth-child(1) { opacity: 1; transform: scaleX(1); transition-delay: 0.5s; }
        .hero-visual--animated .hero-visual__opportunity-line:nth-child(2) { opacity: 0.7; transform: scaleX(1); transition-delay: 0.65s; }
        .hero-visual--animated .hero-visual__opportunity-line:nth-child(3) { opacity: 0.5; transform: scaleX(1); transition-delay: 0.8s; }

        .hero-visual__opportunity-check {
          opacity: 0;
          transform: scale(0) rotate(-90deg);
          transition: opacity 0.4s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .hero-visual--animated .hero-visual__opportunity-check {
          opacity: 1;
          transform: scale(1) rotate(0deg);
          transition-delay: 1s;
        }

        .hero-visual__opportunity-ring {
          opacity: 0;
          stroke-dasharray: 16 8;
          stroke-dashoffset: 80;
          transition: opacity 0.6s ease 0.4s, stroke-dashoffset 2.5s ease 0.4s;
        }

        .hero-visual--animated .hero-visual__opportunity-ring {
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
          .hero-visual__scan-line {
            animation: none;
            opacity: 0;
          }
          .hero-visual__profile-orbit,
          .hero-visual__skills-orbit {
            animation: none;
          }
          .hero-visual__profile-avatar,
          .hero-visual__profile-core,
          .hero-visual__skills-center,
          .hero-visual__opportunity-line,
          .hero-visual__opportunity-check {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};
