import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  { label: 'Data encryption active', icon: 'lock' },
  { label: 'Access audit logging', icon: 'activity' },
  { label: 'Privacy dashboard online', icon: 'layout-dashboard' },
  { label: 'Two-factor authentication', icon: 'key-round' },
  { label: 'Session management secure', icon: 'users' },
];

const COMPLIANCE = [
  { name: 'SOC 2', color: 'var(--color-primary)' },
  { name: 'GDPR', color: 'var(--color-success)' },
  { name: 'CCPA', color: 'var(--color-warning)' },
  { name: 'HIPAA', color: 'var(--color-danger)' },
];

const TIMELINE_STEPS = [
  { label: 'Scan', done: true },
  { label: 'Analyze', done: true },
  { label: 'Remediate', done: true },
  { label: 'Verify', done: true },
  { label: 'Report', done: true },
];

const SecurityScoreRing = ({ score, delay }: { score: number; delay: number }) => {
  const reduceMotion = useReducedMotion();
  const radius = 36;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="inline-ui__privacy-score">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
        <circle
          cx="44" cy="44" r={normalizedRadius}
          stroke="var(--color-border)"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx="44" cy="44" r={normalizedRadius}
          stroke="url(#scoreGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference + ' ' + circumference}
          initial={reduceMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          animate={reduceMotion ? {} : { strokeDashoffset }}
          transition={{ duration: 1.2, ease: EASE, delay }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '44px 44px' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="88" y2="88">
            <stop offset="0%" stopColor="var(--color-success)" />
            <stop offset="100%" stopColor="var(--color-primary)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="inline-ui__privacy-score-text">
        <span className="inline-ui__privacy-score-value">{score}</span>
        <span className="inline-ui__privacy-score-label">Score</span>
      </div>
    </div>
  );
};

const PrivacyInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="inline-ui inline-ui--privacy">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__privacy"
      >
        <div className="inline-ui__privacy-bar">
          <div className="inline-ui__privacy-dots">
            <span className="inline-ui__privacy-dot inline-ui__privacy-dot--red" />
            <span className="inline-ui__privacy-dot inline-ui__privacy-dot--yellow" />
            <span className="inline-ui__privacy-dot inline-ui__privacy-dot--green" />
          </div>
          <span className="inline-ui__privacy-bar-title">Security Center</span>
          <motion.span
            className="inline-ui__privacy-bar-badge"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.3 }}
          >
            Protected
          </motion.span>
        </div>

        <div className="inline-ui__privacy-body">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="inline-ui__privacy-shield-row"
          >
            <div className="inline-ui__privacy-shield">
              <motion.svg
                width="56" height="56" viewBox="0 0 24 24" fill="none"
                animate={reduceMotion ? {} : { rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 3 }}
                className="inline-ui__privacy-shield-icon"
              >
                <motion.path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="url(#shieldGrad)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
                />
                <motion.path
                  d="M9 12l2 2 4-4"
                  stroke="var(--visual-success)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0 }}
                  animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
                />
                <defs>
                  <linearGradient id="shieldGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="var(--color-success)" />
                    <stop offset="100%" stopColor="var(--color-primary)" />
                  </linearGradient>
                </defs>
              </motion.svg>
              <motion.div
                className="inline-ui__privacy-shield-ring"
                animate={reduceMotion ? {} : { scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2 }}
              />
              <motion.div
                className="inline-ui__privacy-shield-ring inline-ui__privacy-shield-ring--outer"
                animate={reduceMotion ? {} : { scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatDelay: 2.5 }}
              />
            </div>
            <SecurityScoreRing score={92} delay={0.25} />
            <div className="inline-ui__privacy-shield-meta">
              <span className="inline-ui__privacy-shield-meta-label">Security</span>
              <span className="inline-ui__privacy-shield-meta-status">All systems operational</span>
            </div>
          </motion.div>

          <div className="inline-ui__privacy-items">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                transition={{ duration: 0.45, ease: EASE, delay: 0.15 + i * 0.07 }}
                className="inline-ui__privacy-item"
              >
                <div className={`inline-ui__privacy-icon inline-ui__privacy-icon--${feature.icon}`}>
                  {feature.icon === 'lock' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                  {feature.icon === 'activity' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  )}
                  {feature.icon === 'layout-dashboard' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  )}
                  {feature.icon === 'key-round' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="7.5" cy="15.5" r="5.5" />
                      <path d="M21 2l-5.5 5.5" />
                      <path d="M21 2l-2 2" />
                      <path d="M21 2v4h-4" />
                    </svg>
                  )}
                  {feature.icon === 'users' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )}
                </div>
                <span className="inline-ui__privacy-label">{feature.label}</span>
                <motion.svg
                  className="inline-ui__check"
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={inView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.4 + i * 0.08 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="inline-ui__privacy-timeline"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
          >
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step.label} className="inline-ui__privacy-timeline-step">
                <motion.div
                  className={`inline-ui__privacy-timeline-dot ${step.done ? 'inline-ui__privacy-timeline-dot--done' : ''}`}
                  initial={reduceMotion ? false : { scale: 0 }}
                  animate={inView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: 0.5 + i * 0.06 }}
                />
                {i < TIMELINE_STEPS.length - 1 && (
                  <motion.div
                    className="inline-ui__privacy-timeline-line"
                    initial={reduceMotion ? false : { scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.55 + i * 0.06 }}
                    style={{ originX: 0 }}
                  />
                )}
                <span className="inline-ui__privacy-timeline-label">{step.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="inline-ui__privacy-footer">
          <div className="inline-ui__privacy-badges">
            {COMPLIANCE.map((badge, i) => (
              <motion.span
                key={badge.name}
                className="inline-ui__privacy-badge"
                style={{ '--badge-color': badge.color } as React.CSSProperties}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={{ duration: 0.35, ease: EASE, delay: 0.5 + i * 0.06 }}
              >
                {badge.name}
              </motion.span>
            ))}
          </div>
          <motion.span
            className="inline-ui__privacy-timestamp"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
          >
            Last check: 2 min ago
          </motion.span>
        </div>

        {!reduceMotion && (
          <div className="inline-ui__privacy-particles">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.span
                key={i}
                className="inline-ui__privacy-particle"
                animate={{
                  y: [0, -14 - i * 3, 0],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (6 + i * 2), 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 3 + i * 0.4,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  delay: i * 0.35,
                }}
                style={{ left: `${12 + i * 10}%`, top: `${18 + (i % 3) * 22}%`, width: 4 + (i % 3), height: 4 + (i % 3) }}
              />
            ))}
          </div>
        )}
      </motion.div>
      <style>{`
        .inline-ui--privacy {
          width: 100%;
          min-width: 340px;
          max-width: 900px;
        }
        @media (max-width: 767px) {
          .inline-ui--privacy {
            min-width: 100%;
            max-width: 100%;
          }
        }
        .inline-ui__privacy {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
          position: relative;
        }
        .inline-ui__privacy-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: linear-gradient(180deg, var(--visual-surface-elevated) 0%, var(--visual-surface-muted) 100%);
          border-bottom: 1px solid var(--visual-border);
          flex-shrink: 0;
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__privacy-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__privacy-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__privacy-dot--red { background: var(--color-danger); }
        .inline-ui__privacy-dot--yellow { background: var(--color-warning); }
        .inline-ui__privacy-dot--green { background: var(--color-success); }
        .inline-ui__privacy-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
          letter-spacing: 0.02em;
        }
        .inline-ui__privacy-bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 10px;
          border-radius: var(--radius-full);
          background: var(--visual-success-soft);
          color: var(--visual-success);
          letter-spacing: 0.03em;
        }

        .inline-ui__privacy-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-4) var(--space-3);
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .inline-ui__privacy-shield-row {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          border-radius: var(--radius-xl);
          border: 1px solid var(--visual-border);
          background: linear-gradient(135deg, var(--visual-surface-muted) 0%, var(--visual-success-soft) 200%);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__privacy-shield {
          position: relative;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .inline-ui__privacy-shield-icon {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 8px rgba(74, 222, 128, 0.35));
        }
        .inline-ui__privacy-shield-ring {
          position: absolute;
          inset: 0;
          border-radius: var(--radius-full);
          border: 2px solid var(--visual-success);
          opacity: 0.35;
          pointer-events: none;
        }
        .inline-ui__privacy-shield-ring--outer {
          inset: -8px;
          border-color: var(--visual-accent);
          opacity: 0.15;
        }
        .inline-ui__privacy-score {
          position: relative;
          width: 88px;
          height: 88px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .inline-ui__privacy-score svg {
          position: absolute;
          top: 0;
          left: 0;
        }
        .inline-ui__privacy-score-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
        }
        .inline-ui__privacy-score-value {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
          font-variant-numeric: tabular-nums;
        }
        .inline-ui__privacy-score-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-top: 2px;
        }
        .inline-ui__privacy-shield-meta {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .inline-ui__privacy-shield-meta-label {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .inline-ui__privacy-shield-meta-status {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-success);
        }

        .inline-ui__privacy-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .inline-ui__privacy-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface-muted);
          transition: background-color 150ms ease, border-color 150ms ease, transform 150ms ease;
        }
        .inline-ui__privacy-item:hover {
          border-color: var(--visual-accent);
          transform: translateX(2px);
        }
        .inline-ui__privacy-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--visual-success-soft);
          color: var(--visual-success);
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .inline-ui__privacy-icon--lock { color: var(--visual-success); background: var(--visual-success-soft); }
        .inline-ui__privacy-icon--activity { color: var(--visual-accent); background: var(--visual-accent-soft); }
        .inline-ui__privacy-icon--layout-dashboard { color: var(--visual-warning); background: var(--visual-warning-soft); }
        .inline-ui__privacy-icon--key-round { color: var(--color-primary); background: var(--color-primary-soft); }
        .inline-ui__privacy-icon--users { color: var(--color-primary); background: var(--color-primary-soft); }
        .inline-ui__privacy-label {
          flex: 1;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
          letter-spacing: 0.01em;
        }
        .inline-ui__check {
          flex-shrink: 0;
          color: var(--visual-success);
          width: 20px;
          height: 20px;
        }

        .inline-ui__privacy-timeline {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-1);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface-muted);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__privacy-timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          position: relative;
        }
        .inline-ui__privacy-timeline-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background: var(--color-border);
          border: 2px solid var(--visual-text-muted);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__privacy-timeline-dot--done {
          background: var(--visual-success);
          border-color: var(--visual-success);
          box-shadow: 0 0 0 3px var(--visual-success-soft);
        }
        .inline-ui__privacy-timeline-line {
          position: absolute;
          top: 5px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--visual-success);
          transform-origin: left;
          z-index: 0;
          border-radius: 1px;
        }
        .inline-ui__privacy-timeline-label {
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .inline-ui__privacy-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          flex-shrink: 0;
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
          gap: var(--space-3);
        }
        .inline-ui__privacy-badges {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .inline-ui__privacy-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--badge-color) 0%, color-mix(in srgb, var(--badge-color) 70%, var(--visual-surface)) 100%);
          color: var(--visual-surface);
          letter-spacing: 0.04em;
          position: relative;
          overflow: hidden;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
          border: 1px solid color-mix(in srgb, var(--badge-color) 60%, transparent);
        }
        .inline-ui__privacy-badge::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 35%, rgba(var(--visual-surface-rgb), 0.35) 50%, transparent 65%);
          background-size: 250% 100%;
          animation: badge-shimmer 3s ease-in-out infinite;
          pointer-events: none;
        }
        .inline-ui__privacy-timestamp {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          white-space: nowrap;
          letter-spacing: 0.02em;
        }

        .inline-ui__privacy-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }
        .inline-ui__privacy-particle {
          position: absolute;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          opacity: 0;
          pointer-events: none;
        }

        @keyframes badge-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 640px) {
          .inline-ui--privacy {
            max-width: 100%;
          }
          .inline-ui__privacy-body {
            gap: var(--space-3);
            padding: var(--space-3) var(--space-3) var(--space-2);
          }
          .inline-ui__privacy-shield-row {
            flex-wrap: wrap;
            gap: var(--space-3);
            padding: var(--space-3);
            justify-content: center;
            text-align: center;
          }
          .inline-ui__privacy-shield-meta {
            width: 100%;
            align-items: center;
          }
          .inline-ui__privacy-item {
            padding: var(--space-2) var(--space-3);
            gap: var(--space-2);
          }
          .inline-ui__privacy-label {
            font-size: var(--text-sm);
          }
          .inline-ui__privacy-icon {
            width: 36px;
            height: 36px;
          }
          .inline-ui__privacy-icon svg {
            width: 16px;
            height: 16px;
          }
          .inline-ui__privacy-timeline {
            flex-wrap: wrap;
            gap: var(--space-2) var(--space-1);
            padding: var(--space-3) var(--space-2);
          }
          .inline-ui__privacy-timeline-step {
            flex: 0 0 auto;
            min-width: 18%;
          }
          .inline-ui__privacy-timeline-line {
            display: none;
          }
          .inline-ui__privacy-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
          }
          .inline-ui__privacy-badges {
            gap: var(--space-1);
          }
          .inline-ui__privacy-badge {
            font-size: 9px;
            padding: 2px 7px;
          }
        }
        @media (max-width: 375px) {
          .inline-ui__privacy-shield-row {
            padding: var(--space-2);
            gap: var(--space-2);
          }
          .inline-ui__privacy-score {
            width: 68px;
            height: 68px;
          }
          .inline-ui__privacy-shield-icon svg {
            width: 40px;
            height: 40px;
          }
          .inline-ui__privacy-score-value {
            font-size: var(--text-base);
          }
          .inline-ui__privacy-shield-meta-label {
            font-size: 10px;
          }
          .inline-ui__privacy-shield-meta-status {
            font-size: var(--text-xs);
          }
          .inline-ui__privacy-item {
            padding: var(--space-2);
            gap: var(--space-2);
          }
          .inline-ui__privacy-icon {
            width: 32px;
            height: 32px;
          }
          .inline-ui__privacy-icon svg {
            width: 14px;
            height: 14px;
          }
          .inline-ui__privacy-label {
            font-size: var(--text-xs);
          }
          .inline-ui__check {
            width: 16px;
            height: 16px;
          }
          .inline-ui__privacy-timeline-step {
            min-width: 16%;
          }
          .inline-ui__privacy-timeline-label {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export { PrivacyInline };
