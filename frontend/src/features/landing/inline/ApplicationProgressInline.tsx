import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const ApplicationProgressInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const stages = [
    { label: 'Applied', date: 'Oct 12', status: 'done', detail: 'Resume submitted' },
    { label: 'Reviewed', date: 'Oct 14', status: 'done', detail: 'Shortlisted by the team' },
    { label: 'Interview', date: 'Oct 18', status: 'active', detail: 'Video call scheduled' },
    { label: 'Offer', date: 'Pending', status: 'pending', detail: 'Awaiting decision' },
  ];

  return (
    <div ref={ref} className="inline-ui inline-ui--progress">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__progress"
      >
        <div className="inline-ui__progress-bar">
          <div className="inline-ui__progress-dots">
            <span className="inline-ui__progress-dot inline-ui__progress-dot--red" />
            <span className="inline-ui__progress-dot inline-ui__progress-dot--yellow" />
            <span className="inline-ui__progress-dot inline-ui__progress-dot--green" />
          </div>
          <span className="inline-ui__progress-bar-title">Application Progress</span>
          <span className="inline-ui__progress-bar-badge">Nova Labs</span>
        </div>

        <div className="inline-ui__progress-stages">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.06 }}
              className={`inline-ui__progress-stage ${stage.status}`}
            >
              <div className="inline-ui__progress-header">
                <div className={`inline-ui__progress-dot ${stage.status}`} />
                <span className={`inline-ui__progress-label ${stage.status === 'active' ? 'inline-ui__progress-label--active' : ''}`}>{stage.label}</span>
              </div>
              <div className="inline-ui__progress-meta">
                <span className="inline-ui__progress-date">{stage.date}</span>
                <span className="inline-ui__progress-detail">{stage.detail}</span>
              </div>
              {i < stages.length - 1 && <div className="inline-ui__progress-connector" />}
            </motion.div>
          ))}
        </div>

        <div className="inline-ui__progress-track">
          <motion.div
            className="inline-ui__progress-fill"
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={inView ? { scaleX: 0.5 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
            style={{ originX: 0 }}
          />
        </div>

        <div className="inline-ui__progress-footer">
          <span className="inline-ui__progress-footer-label">Next step</span>
          <span className="inline-ui__progress-footer-value">Interview on Oct 18</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--progress {
          width: 100%;
          max-width: 480px;
        }
        .inline-ui__progress {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__progress-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__progress-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__progress-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__progress-dot--red { background: #f87171; }
        .inline-ui__progress-dot--yellow { background: #fbbf24; }
        .inline-ui__progress-dot--green { background: #4ade80; }
        .inline-ui__progress-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
          flex: 1;
        }
        .inline-ui__progress-bar-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          white-space: nowrap;
        }
        .inline-ui__progress-stages {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-4);
          position: relative;
        }
        .inline-ui__progress-stage {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          position: relative;
          padding-left: var(--space-6);
        }
        .inline-ui__progress-stage::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 20px;
          bottom: -8px;
          width: 2px;
          background: var(--visual-border);
        }
        .inline-ui__progress-stage:last-child::before {
          display: none;
        }
        .inline-ui__progress-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .inline-ui__progress-dot {
          width: 14px;
          height: 14px;
          border-radius: var(--radius-full);
          background: var(--visual-border);
          position: absolute;
          left: 0;
          top: 2px;
          transition: background-color var(--transition-theme), transform var(--transition-fast);
        }
        .inline-ui__progress-dot--done {
          background: var(--visual-success);
        }
        .inline-ui__progress-dot--active {
          background: var(--visual-accent);
          transform: scale(1.2);
          box-shadow: 0 0 0 3px var(--visual-accent-soft);
        }
        .inline-ui__progress-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .inline-ui__progress-label--active {
          color: var(--visual-accent);
        }
        .inline-ui__progress-meta {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding-left: calc(14px + var(--space-2));
        }
        .inline-ui__progress-date {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .inline-ui__progress-detail {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          opacity: 0.8;
        }
        .inline-ui__progress-track {
          height: 4px;
          background: var(--visual-border);
          margin: 0 var(--space-4) var(--space-4);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .inline-ui__progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-success), var(--visual-accent));
          border-radius: var(--radius-full);
        }
        .inline-ui__progress-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__progress-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__progress-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }

        @media (max-width: 640px) {
          .inline-ui__progress-stage {
            padding-left: var(--space-5);
          }
          .inline-ui__progress-dot {
            width: 12px;
            height: 12px;
          }
          .inline-ui__progress-stage::before {
            left: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export { ApplicationProgressInline };