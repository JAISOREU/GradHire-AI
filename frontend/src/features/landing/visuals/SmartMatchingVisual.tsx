import { useInView } from '../../../core/hooks/useInView';

export const SmartMatchingVisual = () => {
  const { ref, inView } = useInView();

  return (
    <div ref={ref} className={`feature-visual feature-visual--ai ${inView ? 'is-animated' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 420 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="ai-core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="conn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="badge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--color-primary-soft, #eef2ff)" />
            <stop offset="100%" stopColor="var(--color-info-soft, #eff6ff)" />
          </linearGradient>
          <radialGradient id="ai-ambient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="210" cy="124" r="109" fill="url(#ai-ambient)" opacity="0.6" className="ai-ambient" />

        <g className="ai-core">
          <circle cx="210" cy="104" r="37" fill="url(#ai-core-glow)" opacity="0.6" />
          <circle cx="210" cy="104" r="25" fill="var(--color-surface, #ffffff)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="210" cy="104" r="12" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <circle cx="210" cy="104" r="4" fill="var(--color-primary)" />
          <circle cx="210" cy="104" r="37" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.35" strokeDasharray="4 3" className="ai-core-ring" />
        </g>

        <g className="ai-skill-chips">
          <rect x="51" y="62" width="80" height="19" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="93" y="75" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Leadership</text>
          <rect x="51" y="87" width="80" height="19" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="92" y="99" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Communication</text>
          <rect x="51" y="112" width="80" height="19" rx="6" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="92" y="124" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Problem Solving</text>

          <rect x="289" y="62" width="70" height="19" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="324" y="75" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Full-time</text>
          <rect x="289" y="87" width="70" height="19" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="324" y="99" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Part-time</text>
          <rect x="289" y="112" width="70" height="19" rx="6" fill="var(--color-info-soft, #eff6ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="324" y="124" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="700">Contract</text>
        </g>

        <g className="ai-conns">
          <path d="M210 145 L210.1 170" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M131 72 L170 100" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M131 97 L172 111" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M131 121 L175 122" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M248 99 L289 72" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M247 111 L289 97" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />
          <path d="M245 122 L289 121" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.95" />

        </g>

        <g className="ai-you">
          <circle cx="70" cy="185" r="22" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-primary)" strokeWidth="1.5" />
          <circle cx="70" cy="179" r="7" fill="var(--color-primary-soft, #eef2ff)" stroke="var(--color-primary)" strokeWidth="1" />
          <path d="M58 188 Q70 196 82 188" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <text x="70" y="202" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="600" className="hero-visual__invert-text">You</text>
        </g>

        <g className="ai-match-card">
          <rect x="162" y="171" width="96" height="28" rx="8" fill="url(#badge-grad)" stroke="var(--color-primary)" strokeWidth="1" />
          <text x="210" y="189" textAnchor="middle" fill="var(--color-text)" fontSize="10" fontWeight="700">94% Match</text>
        </g>

        <g className="ai-opp ai-opp--1">
          <circle cx="324" cy="225" r="17" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="309" y="219" width="28" height="4" rx="2" fill="var(--color-border, #e8e2d8)" />
          <text x="324" y="243" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600" className="hero-visual__invert-text">Teacher</text>
        </g>

        <g className="ai-opp ai-opp--2">
          <circle cx="350" cy="163" r="17" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="336" y="157" width="28" height="4" rx="2" fill="var(--color-border, #e8e2d8)" />
          <text x="350" y="181" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600" className="hero-visual__invert-text">Developer</text>
        </g>

        <g className="ai-opp ai-opp--3">
          <circle cx="385" cy="202" r="17" fill="var(--color-surface-muted, #fefcf8)" stroke="var(--color-border-strong, #d5cfc6)" strokeWidth="1" />
          <rect x="371" y="196" width="28" height="4" rx="2" fill="var(--color-border, #e8e2d8)" />
          <text x="385" y="219" textAnchor="middle" fill="var(--color-text)" fontSize="9" fontWeight="600" className="hero-visual__invert-text">Nurse</text>
        </g>

        <g className="ai-flow-conns">
          <path d="M95 185 L162 185" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.9" />
          <path d="M95 182 Q129 170 162 182" stroke="url(#conn-grad)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.7" />
          <path d="M258 185 L330 163" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.9" />
          <path d="M258 185 L305 225" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.9" />
          <path d="M258 185 L366 202" stroke="url(#conn-grad)" strokeWidth="2" strokeDasharray="6 4" fill="none" opacity="0.9" />
        </g>
      </svg>

      <style>{`
        .feature-visual--ai .ai-ambient,
        .feature-visual--ai .ai-core,
        .feature-visual--ai .ai-skill-chips,
        .feature-visual--ai .ai-you,
        .feature-visual--ai .ai-opp,
        .feature-visual--ai .ai-conns,
        .feature-visual--ai .ai-match-card,
        .feature-visual--ai .ai-flow-conns {
          opacity: 0;
          transform: scale(0.94);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .feature-visual--ai.is-animated .ai-ambient { opacity: 1; transform: scale(1); transition-delay: 0.05s; }
        .feature-visual--ai.is-animated .ai-core { opacity: 1; transform: scale(1); transition-delay: 0.1s; }
        .feature-visual--ai.is-animated .ai-skill-chips { opacity: 1; transform: scale(1); transition-delay: 0.2s; }
        .feature-visual--ai.is-animated .ai-conns { opacity: 1; transform: scale(1); transition-delay: 0.35s; }
        .feature-visual--ai.is-animated .ai-you { opacity: 1; transform: scale(1); transition-delay: 0.45s; }
        .feature-visual--ai.is-animated .ai-match-card { opacity: 1; transform: scale(1); transition-delay: 0.55s; }
        .feature-visual--ai.is-animated .ai-opp--1 { opacity: 1; transform: scale(1); transition-delay: 0.65s; }
        .feature-visual--ai.is-animated .ai-opp--2 { opacity: 1; transform: scale(1); transition-delay: 0.75s; }
        .feature-visual--ai.is-animated .ai-opp--3 { opacity: 1; transform: scale(1); transition-delay: 0.85s; }
        .feature-visual--ai.is-animated .ai-flow-conns { opacity: 1; transform: scale(1); transition-delay: 0.9s; }

        @media (prefers-reduced-motion: reduce) {
          .feature-visual--ai * {
            transition-duration: 0.01ms !important;
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
