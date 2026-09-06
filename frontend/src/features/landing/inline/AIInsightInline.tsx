import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const AIInsightInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="inline-ui inline-ui--insight">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__insight"
      >
        <div className="inline-ui__insight-bar">
          <div className="inline-ui__insight-dots">
            <span className="inline-ui__insight-dot inline-ui__insight-dot--red" />
            <span className="inline-ui__insight-dot inline-ui__insight-dot--yellow" />
            <span className="inline-ui__insight-dot inline-ui__insight-dot--green" />
          </div>
          <span className="inline-ui__insight-bar-title">AI Insight</span>
          <span className="inline-ui__insight-bar-badge">Explainable</span>
        </div>

        <div className="inline-ui__insight-body">
          <div className="inline-ui__insight-header">
            <span className="inline-ui__insight-badge">AI INSIGHT</span>
            <span className="inline-ui__insight-dot" aria-hidden="true" />
          </div>
          <p className="inline-ui__insight-text">
            You are a strong match because your React and API experience align with the core requirements for this role. Your project history shows consistent delivery of production-ready interfaces.
          </p>

          <div className="inline-ui__insight-section">
            <span className="inline-ui__insight-section-title">Strengths</span>
            <div className="inline-ui__insight-list">
              <div className="inline-ui__insight-item">
                <span className="inline-ui__insight-check">✓</span>
                <span>React component architecture</span>
              </div>
              <div className="inline-ui__insight-item">
                <span className="inline-ui__insight-check">✓</span>
                <span>TypeScript type safety</span>
              </div>
              <div className="inline-ui__insight-item">
                <span className="inline-ui__insight-check">✓</span>
                <span>API integration experience</span>
              </div>
            </div>
          </div>

          <div className="inline-ui__insight-section">
            <span className="inline-ui__insight-section-title">Areas to improve</span>
            <div className="inline-ui__insight-list">
              <div className="inline-ui__insight-item inline-ui__insight-item--warn">
                <span className="inline-ui__insight-check">!</span>
                <span>Add containerization projects</span>
              </div>
              <div className="inline-ui__insight-item inline-ui__insight-item--warn">
                <span className="inline-ui__insight-check">!</span>
                <span>Advanced SQL query practice</span>
              </div>
            </div>
          </div>
        </div>

        <div className="inline-ui__insight-footer">
          <div className="inline-ui__insight-metric">
            <span className="inline-ui__insight-metric-value">3</span>
            <span className="inline-ui__insight-metric-label">strengths</span>
          </div>
          <div className="inline-ui__insight-metric">
            <span className="inline-ui__insight-metric-value">2</span>
            <span className="inline-ui__insight-metric-label">areas to improve</span>
          </div>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--insight {
          width: 100%;
          max-width: 480px;
        }
        .inline-ui__insight {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__insight-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__insight-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__insight-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__insight-dot--red { background: #f87171; }
        .inline-ui__insight-dot--yellow { background: #fbbf24; }
        .inline-ui__insight-dot--green { background: #4ade80; }
        .inline-ui__insight-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .inline-ui__insight-bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .inline-ui__insight-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .inline-ui__insight-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .inline-ui__insight-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--visual-accent);
        }
        .inline-ui__insight-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: insight-pulse 2s ease-in-out infinite;
        }
        @keyframes insight-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .inline-ui__insight-text {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          line-height: 1.6;
          margin: 0;
        }
        .inline-ui__insight-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .inline-ui__insight-section-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__insight-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .inline-ui__insight-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--visual-text);
        }
        .inline-ui__insight-item--warn {
          color: var(--visual-warning);
        }
        .inline-ui__insight-check {
          width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          background: var(--visual-success-soft);
          color: var(--visual-success);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .inline-ui__insight-item--warn .inline-ui__insight-check {
          background: var(--visual-warning-soft);
          color: var(--visual-warning);
        }
        .inline-ui__insight-footer {
          display: flex;
          gap: var(--space-6);
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__insight-metric {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .inline-ui__insight-metric-value {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
        .inline-ui__insight-metric-label {
          font-size: 10px;
          color: var(--visual-text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
      `}</style>
    </div>
  );
};

export { AIInsightInline };
