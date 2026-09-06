import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Stage {
  label: string;
  date: string;
  status: 'done' | 'active' | 'pending';
  detail: string;
}

const ApplicationTrackingVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const stages: Stage[] = [
    { label: 'Saved', date: 'Sep 28', status: 'done', detail: 'Bookmarked opportunity' },
    { label: 'Applied', date: 'Oct 02', status: 'done', detail: 'Resume & cover letter submitted' },
    { label: 'Screening', date: 'Oct 05', status: 'done', detail: 'Reviewed by hiring team' },
    { label: 'Interview', date: 'Oct 12', status: 'active', detail: 'Technical + culture fit' },
    { label: 'Offer', date: 'Pending', status: 'pending', detail: 'Awaiting decision' },
  ];

  return (
    <div ref={ref} className="feature-visual feature-visual--tracking">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        {/* Window chrome */}
        <div className="feature-visual__bar">
          <div className="feature-visual__dots">
            <span className="feature-visual__dot feature-visual__dot--red" />
            <span className="feature-visual__dot feature-visual__dot--yellow" />
            <span className="feature-visual__dot feature-visual__dot--green" />
          </div>
          <span className="feature-visual__bar-title">Application Tracker</span>
          <span className="feature-visual__bar-badge">TechCorp Inc.</span>
        </div>

        <div className="feature-visual__tracking-body">
          <div className="feature-visual__tracking-header">
            <div>
              <div className="feature-visual__tracking-role">Senior Frontend Developer</div>
              <div className="feature-visual__tracking-company">TechCorp Inc. · San Francisco, CA</div>
            </div>
            <div className="feature-visual__tracking-status">
              <span className="feature-visual__tracking-status-dot" />
              In progress
            </div>
          </div>

          <div className="feature-visual__tracking-stages">
            {stages.map((stage, i) => (
              <div key={stage.label} className={`feature-visual__tracking-stage ${stage.status}`}>
                <div className="feature-visual__tracking-connector-vertical">
                  {i < stages.length - 1 && <div className="feature-visual__tracking-connector-line" />}
                </div>
                <div className="feature-visual__tracking-stage-content">
                  <div className={`feature-visual__tracking-dot ${stage.status}`}>
                    {stage.status === 'done' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {stage.status === 'active' && <span className="feature-visual__tracking-active-ring" />}
                  </div>
                  <div className="feature-visual__tracking-info">
                    <span className="feature-visual__tracking-label">{stage.label}</span>
                    <span className="feature-visual__tracking-date">{stage.date}</span>
                    <span className="feature-visual__tracking-detail">{stage.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="feature-visual__tracking-progress">
            <div className="feature-visual__tracking-progress-header">
              <span className="feature-visual__tracking-progress-label">Overall progress</span>
              <span className="feature-visual__tracking-progress-value">60%</span>
            </div>
            <div className="feature-visual__tracking-progress-bar">
              <motion.div
                className="feature-visual__tracking-progress-fill"
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={inView ? { scaleX: 0.6 } : { scaleX: 0 }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
                style={{ originX: 0 }}
              />
            </div>
          </div>

          <div className="feature-visual__tracking-footer">
            <span className="feature-visual__tracking-footer-label">Next step</span>
            <span className="feature-visual__tracking-footer-value">Interview on Oct 12</span>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--tracking {
          width: 100%;
          max-width: 480px;
        }
        .feature-visual__card {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .feature-visual__bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__dots {
          display: flex;
          gap: 6px;
        }
        .feature-visual__dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .feature-visual__dot--red { background: #f87171; }
        .feature-visual__dot--yellow { background: #fbbf24; }
        .feature-visual__dot--green { background: #4ade80; }
        .feature-visual__bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__tracking-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .feature-visual__tracking-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-3);
        }
        .feature-visual__tracking-role {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__tracking-company {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          margin-top: 2px;
        }
        .feature-visual__tracking-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-success);
          white-space: nowrap;
        }
        .feature-visual__tracking-status-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: status-pulse 2s ease-in-out infinite;
        }
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .feature-visual__tracking-stages {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          position: relative;
        }
        .feature-visual__tracking-stage {
          display: flex;
          gap: var(--space-3);
          position: relative;
        }
        .feature-visual__tracking-connector-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
          flex-shrink: 0;
        }
        .feature-visual__tracking-connector-line {
          width: 2px;
          flex: 1;
          background: var(--visual-border);
          margin-top: 8px;
          transition: background-color var(--transition-theme);
        }
        .feature-visual__tracking-stage-content {
          display: flex;
          gap: var(--space-3);
          flex: 1;
          min-width: 0;
        }
        .feature-visual__tracking-dot {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background: var(--visual-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 300ms ease;
        }
        .feature-visual__tracking-dot--done {
          background: var(--visual-success);
          color: var(--visual-surface);
        }
        .feature-visual__tracking-dot--active {
          background: var(--visual-accent-soft);
          border: 2px solid var(--visual-accent);
        }
        .feature-visual__tracking-active-ring {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background: var(--visual-accent);
          animation: status-pulse 2s ease-in-out infinite;
        }
        .feature-visual__tracking-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding-top: 1px;
        }
        .feature-visual__tracking-label {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__tracking-date {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__tracking-detail {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          opacity: 0.8;
        }
        .feature-visual__tracking-progress {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__tracking-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__tracking-progress-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__tracking-progress-value {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__tracking-progress-bar {
          height: 6px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .feature-visual__tracking-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-success), var(--visual-accent));
          border-radius: var(--radius-full);
        }
        .feature-visual__tracking-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__tracking-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__tracking-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }

        @media (max-width: 640px) {
          .feature-visual__tracking-dot {
            width: 20px;
            height: 20px;
          }
          .feature-visual__tracking-connector-vertical {
            width: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export { ApplicationTrackingVisual };
