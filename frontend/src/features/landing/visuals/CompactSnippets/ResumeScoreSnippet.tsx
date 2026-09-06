import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const ResumeScoreSnippet = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const score = 87;

  return (
    <div ref={ref} className="snippet snippet--resume">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="snippet__resume"
      >
        <div className="snippet__resume-bar">
          <div className="snippet__resume-dots">
            <span className="snippet__resume-dot snippet__resume-dot--red" />
            <span className="snippet__resume-dot snippet__resume-dot--yellow" />
            <span className="snippet__resume-dot snippet__resume-dot--green" />
          </div>
          <span className="snippet__resume-bar-title">Resume Analysis</span>
          <span className="snippet__resume-bar-badge">AI-powered</span>
        </div>

        <div className="snippet__resume-body">
          <div className="snippet__resume-ring">
            <svg viewBox="0 0 80 80" className="snippet__resume-svg">
              <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--visual-border)" strokeWidth="5" />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="var(--visual-success)"
                strokeWidth="5"
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                initial={reduceMotion ? false : { strokeDashoffset: circumference }}
                animate={inView ? { strokeDashoffset: circumference - (score / 100) * circumference } : { strokeDashoffset: circumference }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              />
            </svg>
            <div className="snippet__resume-score">
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
                className="snippet__resume-number"
              >
                {score}%
              </motion.span>
            </div>
          </div>

          <div className="snippet__resume-content">
            <span className="snippet__resume-title">Resume Strength</span>
            <span className="snippet__resume-subtitle">Strong match for this role</span>
            <div className="snippet__resume-metrics">
              <div className="snippet__resume-metric">
                <span className="snippet__resume-metric-value">12</span>
                <span className="snippet__resume-metric-label">Skills extracted</span>
              </div>
              <div className="snippet__resume-metric">
                <span className="snippet__resume-metric-value">3</span>
                <span className="snippet__resume-metric-label">Gaps identified</span>
              </div>
              <div className="snippet__resume-metric">
                <span className="snippet__resume-metric-value">8</span>
                <span className="snippet__resume-metric-label">Suggestions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="snippet__resume-footer">
          <span className="snippet__resume-footer-label">Top strength</span>
          <span className="snippet__resume-footer-value">React & TypeScript</span>
        </div>
      </motion.div>
      <style>{`
        .snippet--resume {
          width: 100%;
          max-width: 480px;
        }
        .snippet__resume {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .snippet__resume-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .snippet__resume-dots {
          display: flex;
          gap: 6px;
        }
        .snippet__resume-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .snippet__resume-dot--red { background: #f87171; }
        .snippet__resume-dot--yellow { background: #fbbf24; }
        .snippet__resume-dot--green { background: #4ade80; }
        .snippet__resume-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .snippet__resume-bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-success-soft);
          color: var(--visual-success);
        }
        .snippet__resume-body {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-4);
          align-items: center;
        }
        .snippet__resume-ring {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }
        .snippet__resume-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .snippet__resume-score {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .snippet__resume-number {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
        }
        .snippet__resume-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          flex: 1;
          min-width: 0;
        }
        .snippet__resume-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
        }
        .snippet__resume-subtitle {
          font-size: var(--text-sm);
          color: var(--visual-success);
          font-weight: 500;
        }
        .snippet__resume-metrics {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }
        .snippet__resume-metric {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .snippet__resume-metric-value {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
        .snippet__resume-metric-label {
          font-size: 10px;
          color: var(--visual-text-muted);
          font-weight: 500;
          white-space: nowrap;
        }
        .snippet__resume-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .snippet__resume-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .snippet__resume-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-accent);
        }
      `}</style>
    </div>
  );
};

export { ResumeScoreSnippet };
