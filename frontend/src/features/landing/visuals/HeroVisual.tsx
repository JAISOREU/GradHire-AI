import { useId, useMemo, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

const heroReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: EASE,
      when: 'beforeChildren',
      staggerChildren: 0.15,
    },
  },
};

const heroChild = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const drawLine = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 0.5, transition: { duration: 0.8, ease: EASE } },
};

export const HeroVisual = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgId = useId();
  const inView = useInView(wrapperRef, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();

  const floatCandidate = useMemo(() => ({
    y: [0, -2, 0],
    transition: {
      duration: 7.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror' as const,
    } as const,
  }), []);

  const floatJob = useMemo(() => ({
    y: [0, -2, 0],
    transition: {
      duration: 8.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror' as const,
    } as const,
  }), []);

  const aiPulse = useMemo(() => ({
    scale: [1, 1.12, 1],
    opacity: [0.9, 0.55, 0.9],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'mirror' as const,
    } as const,
  }), []);

  const cardHover = {
    scale: 1.01,
    transition: { duration: 0.3, ease: EASE },
  };

  const cardHoverJob = {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.3, ease: EASE },
  };

  const aiHover = {
    scale: 1.03,
    transition: { duration: 0.3, ease: EASE },
  };

  return (
    <div
      ref={wrapperRef}
      className="hero-visual-wrapper relative w-full"
    >
      <div
        className="hero-visual"
        aria-hidden="true"
      >
        <motion.svg
          viewBox="0 0 800 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          variants={heroReveal}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <defs>
            <radialGradient id={`${svgId}-hero-glow`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.05" />
              <stop offset="60%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.02" />
              <stop offset="100%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0" />
            </radialGradient>

            <filter id={`${svgId}-card-shadow`} x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="var(--color-text, #1a1814)" floodOpacity="0.06" />
            </filter>

            <linearGradient id={`${svgId}-ai-indicator-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary, #4f46e5)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--color-info, #2563eb)" stopOpacity="0.04" />
            </linearGradient>

            <clipPath id={`${svgId}-candidate-clip`}>
              <rect x="80" y="160" width="220" height="48" rx="12" />
            </clipPath>

            <clipPath id={`${svgId}-job-clip`}>
              <rect x="500" y="140" width="220" height="48" rx="12" />
            </clipPath>
          </defs>

          <motion.circle
            cx="400"
            cy="250"
            r="220"
            fill={`url(#${svgId}-hero-glow)`}
            opacity="0.6"
            variants={heroChild}
          />

          <motion.g className="hero-visual__layer hero-visual__layer--bg" variants={heroChild}>
            <motion.g
              className="hero-visual__card hero-visual__card--candidate"
              variants={heroChild}
              animate={reduceMotion ? undefined : floatCandidate}
              whileHover={reduceMotion ? undefined : cardHover}
              style={{ transformOrigin: '190px 250px' }}
            >
              <motion.rect
                x="80" y="160" width="220" height="180" rx="12"
                fill="var(--color-surface, #ffffff)"
                stroke="var(--color-border, #e8e2d8)"
                strokeWidth="1"
                filter={`url(#${svgId}-card-shadow)`}
              />
              <motion.rect x="80" y="160" width="220" height="48" rx="12" fill="var(--color-surface-muted, #fefcf8)" />
              <motion.rect x="80" y="196" width="220" height="12" fill="var(--color-surface-muted, #fefcf8)" />

              <motion.circle cx="108" cy="184" r="16" fill="var(--color-primary-soft, #eef2ff)" />
              <motion.text x="108" y="188" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="10" fontWeight="700">AR</motion.text>

              <motion.text x="134" y="178" fill="var(--color-text, #1a1814)" fontSize="11" fontWeight="600">Alex Rivera</motion.text>
              <motion.text x="134" y="192" fill="var(--color-text-tertiary, #7a756e)" fontSize="9" fontWeight="500">Frontend Developer</motion.text>

              <motion.rect x="96" y="228" width="40" height="22" rx="6" fill="var(--color-primary-soft, #eef2ff)" />
              <motion.text x="116" y="242" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="8" fontWeight="600">React</motion.text>

              <motion.rect x="142" y="228" width="52" height="22" rx="6" fill="var(--color-info-soft, #eff6ff)" />
              <motion.text x="168" y="242" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="8" fontWeight="600">TypeScript</motion.text>

              <motion.rect x="200" y="228" width="44" height="22" rx="6" fill="var(--color-warning-soft, #fffbeb)" />
              <motion.text x="222" y="242" textAnchor="middle" fill="var(--color-warning, #d97706)" fontSize="8" fontWeight="600">Node.js</motion.text>

              <motion.line x1="96" y1="268" x2="284" y2="268" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />

              <motion.text x="96" y="285" fill="var(--color-text-tertiary, #7a756e)" fontSize="8" fontWeight="500">Technical fit</motion.text>
              <motion.rect x="96" y="292" width="120" height="4" rx="2" fill="var(--color-primary, #4f46e5)" opacity="0.2" />

              <motion.text x="96" y="308" fill="var(--color-text-tertiary, #7a756e)" fontSize="8" fontWeight="500">Experience</motion.text>
              <motion.rect x="96" y="315" width="80" height="4" rx="2" fill="var(--color-success, #059669)" opacity="0.2" />
            </motion.g>

            <motion.g
              className="hero-visual__card hero-visual__card--job"
              variants={heroChild}
              animate={reduceMotion ? undefined : floatJob}
              whileHover={reduceMotion ? undefined : cardHoverJob}
              style={{ transformOrigin: '610px 250px' }}
            >
              <motion.rect x="500" y="140" width="220" height="200" rx="12" fill="var(--color-surface, #ffffff)" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" filter={`url(#${svgId}-card-shadow)`} />
              <motion.rect x="500" y="140" width="220" height="48" rx="12" fill="var(--color-surface-muted, #fefcf8)" />
              <motion.rect x="500" y="176" width="220" height="12" fill="var(--color-surface-muted, #fefcf8)" />

              <motion.text x="516" y="164" fill="var(--color-text, #1a1814)" fontSize="11" fontWeight="600">Frontend Developer</motion.text>
              <motion.text x="516" y="178" fill="var(--color-text-tertiary, #7a756e)" fontSize="9" fontWeight="500">Acme Technologies</motion.text>

              <motion.rect x="516" y="252" width="64" height="24" rx="6" fill="var(--color-success-soft, #ecfdf5)" />
              <motion.text x="548" y="268" textAnchor="middle" fill="var(--color-success, #059669)" fontSize="10" fontWeight="700" className="hero-visual__match-badge">94% Match</motion.text>

              <motion.line x1="516" y1="292" x2="704" y2="292" stroke="var(--color-border, #e8e2d8)" strokeWidth="1" />

              <motion.rect x="516" y="214" width="44" height="22" rx="6" fill="var(--color-primary-soft, #eef2ff)" />
              <motion.text x="538" y="228" textAnchor="middle" fill="var(--color-primary, #4f46e5)" fontSize="8" fontWeight="600">React</motion.text>

              <motion.rect x="566" y="214" width="52" height="22" rx="6" fill="var(--color-info-soft, #eff6ff)" />
              <motion.text x="592" y="228" textAnchor="middle" fill="var(--color-info, #2563eb)" fontSize="8" fontWeight="600">TypeScript</motion.text>

              <motion.text x="516" y="310" fill="var(--color-primary, #4f46e5)" fontSize="9" fontWeight="600" className="hero-visual__link">View opportunity →</motion.text>
            </motion.g>
          </motion.g>

          <motion.g className="hero-visual__layer hero-visual__layer--mid" variants={heroChild}>
            <motion.g
              className="hero-visual__ai-indicator"
              animate={reduceMotion ? undefined : aiPulse}
              whileHover={reduceMotion ? undefined : aiHover}
              style={{ transformOrigin: '400px 250px' }}
            >
              <motion.circle cx="400" cy="250" r="32" fill={`url(#${svgId}-ai-indicator-grad)`} />
              <motion.circle cx="400" cy="250" r="8" fill="var(--color-primary, #4f46e5)" className="hero-visual__ai-dot" />
              <motion.circle cx="400" cy="250" r="16" fill="none" stroke="var(--color-primary, #4f46e5)" strokeWidth="1" opacity="0.15" className="hero-visual__ai-ring" />

              <motion.text x="400" y="210" textAnchor="middle" fill="var(--color-text, #1a1814)" fontSize="10" fontWeight="600" className="hero-visual__ai-label">AI Matching</motion.text>
              <motion.text x="400" y="300" textAnchor="middle" fill="var(--color-text-tertiary, #7a756e)" fontSize="8" fontWeight="500" className="hero-visual__ai-sub">Analyzing profile</motion.text>
            </motion.g>
          </motion.g>

          <motion.g className="hero-visual__layer hero-visual__layer--connections" variants={heroChild}>
            <motion.path
              d="M300 250 Q340 250 368 250"
              stroke="var(--color-border, #e8e2d8)"
              strokeWidth="1"
              strokeDasharray="6 5"
              fill="none"
              opacity="0"
              className="hero-visual__conn"
              variants={drawLine}
            />
            <motion.path
              d="M432 250 Q460 250 500 250"
              stroke="var(--color-border, #e8e2d8)"
              strokeWidth="1"
              strokeDasharray="6 5"
              fill="none"
              opacity="0"
              className="hero-visual__conn"
              variants={drawLine}
            />
            <motion.circle r="2" fill="var(--color-primary, #4f46e5)" opacity="0" className="hero-visual__particle hero-visual__particle--1">
              <animateMotion dur="1.8s" repeatCount="1" begin="0.6s" fill="freeze" path="M300 250 Q340 250 400 250" />
            </motion.circle>
            <motion.circle r="2" fill="var(--color-primary, #4f46e5)" opacity="0" className="hero-visual__particle hero-visual__particle--2">
              <animateMotion dur="1.8s" repeatCount="1" begin="0.9s" fill="freeze" path="M400 250 Q460 250 500 250" />
            </motion.circle>
          </motion.g>
        </motion.svg>

        <style>{`
          .hero-visual-wrapper {
            position: relative;
            width: 100%;
            max-width: 100%;
          }

          .hero-visual {
            position: relative;
            width: 100%;
            transform: translate3d(0, 0, 0);
            will-change: transform;
          }

          .hero-visual svg {
            width: 100%;
            height: auto;
            display: block;
          }

          .hero-visual__link {
            cursor: pointer;
          }

          @media (max-width: 768px) {
            .hero-visual__card--candidate {
              transform: scale(0.72);
              transform-origin: 160px 240px;
            }

            .hero-visual__card--job {
              transform: scale(0.72);
              transform-origin: 640px 240px;
            }

            .hero-visual__ai-indicator {
              transform: scale(0.85);
              transform-origin: 400px 250px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .hero-visual__particle {
              display: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
