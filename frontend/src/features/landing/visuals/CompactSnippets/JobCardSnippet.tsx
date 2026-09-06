import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const JobCardSnippet = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const score = 87;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <div ref={ref} className="snippet snippet--job-card">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="snippet__card"
      >
        <div className="snippet__card-header">
          <div className="snippet__card-dots" aria-hidden="true">
            <span className="snippet__dot snippet__dot--red" />
            <span className="snippet__dot snippet__dot--yellow" />
            <span className="snippet__dot snippet__dot--green" />
          </div>
          <span className="snippet__card-title">Job Details</span>
          <span className="snippet__card-header-badge">New</span>
        </div>
        <div className="snippet__card-body">
          <div className="snippet__card-role-row">
            <div className="snippet__card-avatar">TC</div>
            <div>
              <div className="snippet__card-role">Frontend Developer</div>
              <div className="snippet__card-company">TechCorp Inc. · San Francisco, CA</div>
            </div>
          </div>
          <div className="snippet__card-meta-row">
            <span className="snippet__badge snippet__badge--remote">Remote</span>
            <span className="snippet__badge snippet__badge--type">Full-time</span>
            <span className="snippet__card-salary">$120K – $150K</span>
          </div>
          <div className="snippet__card-tags">
            <span className="snippet__card-tag">React</span>
            <span className="snippet__card-tag">TypeScript</span>
            <span className="snippet__card-tag">Node.js</span>
          </div>
        </div>
        <div className="snippet__card-footer">
          <div className="snippet__score-ring">
            <svg viewBox="0 0 48 48" className="snippet__score-svg">
              <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--visual-border)" strokeWidth="4" />
              <motion.circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="var(--visual-accent)"
                strokeWidth="4"
                strokeLinecap="round"
                transform="rotate(-90 24 24)"
                initial={reduceMotion ? false : { strokeDashoffset: circumference }}
                animate={inView ? { strokeDashoffset: circumference - (score / 100) * circumference } : { strokeDashoffset: circumference }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              />
            </svg>
            <span className="snippet__score-text">{score}%</span>
          </div>
          <div className="snippet__score-info">
            <span className="snippet__score-label">Match score</span>
            <span className="snippet__score-hint">Based on your profile</span>
          </div>
          <button className="snippet__card-apply" type="button">
            Apply
          </button>
        </div>
      </motion.div>
      <style>{`
        .snippet--job-card {
          width: 100%;
          max-width: 480px;
        }
        .snippet__card {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .snippet__card-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .snippet__card-dots {
          display: flex;
          gap: 6px;
        }
        .snippet__dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .snippet__dot--red { background: #f87171; }
        .snippet__dot--yellow { background: #fbbf24; }
        .snippet__dot--green { background: #4ade80; }
        .snippet__card-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .snippet__card-header-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-success-soft);
          color: var(--visual-success);
        }
        .snippet__card-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .snippet__card-role-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .snippet__card-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, var(--visual-accent), var(--visual-accent-soft));
          color: var(--visual-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 700;
          flex-shrink: 0;
        }
        .snippet__card-role {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1.2;
        }
        .snippet__card-company {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          margin-top: 2px;
        }
        .snippet__card-meta-row {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .snippet__badge {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .snippet__badge--remote {
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .snippet__badge--type {
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
        }
        .snippet__card-salary {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
          margin-left: auto;
        }
        .snippet__card-tags {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .snippet__card-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: var(--visual-surface-muted, var(--visual-border));
          color: var(--visual-text-muted);
          border: 1px solid var(--visual-border);
        }
        .snippet__card-footer {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .snippet__score-ring {
          position: relative;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
        .snippet__score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .snippet__score-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--visual-text);
        }
        .snippet__score-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
          min-width: 0;
        }
        .snippet__score-label {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .snippet__score-hint {
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .snippet__card-apply {
          font-size: var(--text-sm);
          font-weight: 700;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          background: var(--visual-accent);
          color: var(--visual-surface);
          border: none;
          cursor: pointer;
          transition: transform var(--transition-fast), opacity var(--transition-fast);
        }
        .snippet__card-apply:hover {
          transform: translateY(-1px);
        }
        .snippet__card-apply:active {
          transform: translateY(0);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export { JobCardSnippet };
