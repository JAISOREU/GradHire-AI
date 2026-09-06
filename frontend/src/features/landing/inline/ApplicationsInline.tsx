import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const ApplicationsInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  const stages = [
    { label: 'Applied', date: 'Oct 12', status: 'done', detail: 'Submitted resume & cover letter' },
    { label: 'Screening', date: 'Oct 14', status: 'done', detail: 'Reviewed by hiring team' },
    { label: 'Interview', date: 'Oct 18', status: 'active', detail: 'Technical + culture fit' },
    { label: 'Offer', date: 'Pending', status: 'pending', detail: 'Awaiting decision' },
  ];

  return (
    <div ref={ref} className="inline-ui inline-ui--applications">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__pipeline"
      >
        <div className="inline-ui__pipeline-bar">
          <div className="inline-ui__pipeline-dots">
            <span className="inline-ui__pipeline-dot inline-ui__pipeline-dot--red" />
            <span className="inline-ui__pipeline-dot inline-ui__pipeline-dot--yellow" />
            <span className="inline-ui__pipeline-dot inline-ui__pipeline-dot--green" />
          </div>
          <span className="inline-ui__pipeline-bar-title">Application Tracker</span>
          <span className="inline-ui__pipeline-bar-badge">TechCorp Inc.</span>
        </div>

        <div className="inline-ui__pipeline-stages">
          {stages.map((stage, i) => (
            <div key={stage.label} className={`inline-ui__pipeline-stage ${stage.status}`}>
              <div className="inline-ui__pipeline-header">
                <div className={`inline-ui__pipeline-dot ${stage.status}`} />
                <span className={`inline-ui__pipeline-label ${stage.status === 'active' ? 'inline-ui__pipeline-label--active' : ''}`}>{stage.label}</span>
              </div>
              <div className="inline-ui__pipeline-meta">
                <span className="inline-ui__pipeline-date">{stage.date}</span>
                <span className="inline-ui__pipeline-detail">{stage.detail}</span>
              </div>
              {i < stages.length - 1 && <div className="inline-ui__pipeline-connector" />}
            </div>
          ))}
        </div>

        <div className="inline-ui__pipeline-progress-track">
          <motion.div
            className="inline-ui__pipeline-progress"
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={inView ? { scaleX: 0.5 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
            style={{ originX: 0 }}
          />
        </div>

        <div className="inline-ui__pipeline-footer">
          <span className="inline-ui__pipeline-footer-label">Next step</span>
          <span className="inline-ui__pipeline-footer-value">Interview on Oct 18</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--applications {
          width: 100%;
          max-width: 480px;
        }
        .inline-ui__pipeline {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__pipeline-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__pipeline-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__pipeline-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__pipeline-dot--red { background: #f87171; }
        .inline-ui__pipeline-dot--yellow { background: #fbbf24; }
        .inline-ui__pipeline-dot--green { background: #4ade80; }
        .inline-ui__pipeline-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .inline-ui__pipeline-bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .inline-ui__pipeline-stages {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-4);
          position: relative;
        }
        .inline-ui__pipeline-stage {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          position: relative;
          padding-left: var(--space-6);
        }
        .inline-ui__pipeline-stage::before {
          content: '';
          position: absolute;
          left: 7px;
          top: 20px;
          bottom: -8px;
          width: 2px;
          background: var(--visual-border);
        }
        .inline-ui__pipeline-stage:last-child::before {
          display: none;
        }
        .inline-ui__pipeline-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .inline-ui__pipeline-dot {
          width: 14px;
          height: 14px;
          border-radius: var(--radius-full);
          background: var(--visual-border);
          position: absolute;
          left: 0;
          top: 2px;
          transition: background-color var(--transition-theme), transform var(--transition-fast);
        }
        .inline-ui__pipeline-dot--done {
          background: var(--visual-success);
        }
        .inline-ui__pipeline-dot--active {
          background: var(--visual-accent);
          transform: scale(1.2);
          box-shadow: 0 0 0 3px var(--visual-accent-soft);
        }
        .inline-ui__pipeline-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .inline-ui__pipeline-label--active {
          color: var(--visual-accent);
        }
        .inline-ui__pipeline-meta {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding-left: calc(14px + var(--space-2));
        }
        .inline-ui__pipeline-date {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .inline-ui__pipeline-detail {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          opacity: 0.8;
        }
        .inline-ui__pipeline-progress-track {
          height: 4px;
          background: var(--visual-border);
          margin: 0 var(--space-4) var(--space-4);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .inline-ui__pipeline-progress {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-success), var(--visual-accent));
          border-radius: var(--radius-full);
        }
        .inline-ui__pipeline-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__pipeline-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__pipeline-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }

        @media (max-width: 640px) {
          .inline-ui__pipeline-stage {
            padding-left: var(--space-5);
          }
          .inline-ui__pipeline-dot {
            width: 12px;
            height: 12px;
          }
          .inline-ui__pipeline-stage::before {
            left: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export { ApplicationsInline };
