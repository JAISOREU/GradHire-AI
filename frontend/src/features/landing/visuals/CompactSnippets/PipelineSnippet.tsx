import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const PipelineSnippet = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const stages = ['Applied', 'Viewed', 'Interview', 'Offer'];
  const activeIndex = 1; // "Viewed" is active

  return (
    <div ref={ref} className="snippet snippet--pipeline">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="snippet__pipeline"
      >
        <div className="snippet__pipeline-stages">
          {stages.map((stage, i) => (
            <div key={stage} className="snippet__pipeline-stage">
              <div className={`snippet__pipeline-dot ${i <= activeIndex ? 'snippet__pipeline-dot--active' : ''} ${i < activeIndex ? 'snippet__pipeline-dot--done' : ''}`} />
              <span className={`snippet__pipeline-label ${i === activeIndex ? 'snippet__pipeline-label--active' : ''}`}>{stage}</span>
            </div>
          ))}
        </div>
        <div className="snippet__pipeline-bar">
          <motion.div
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="snippet__pipeline-progress"
            style={{ originX: 0 }}
          />
        </div>
      </motion.div>
      <style>{`
        .snippet--pipeline {
          width: 100%;
          max-width: 320px;
        }
        .snippet__pipeline {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-md);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .snippet__pipeline-stages {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-3);
        }
        .snippet__pipeline-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
        }
        .snippet__pipeline-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          background: var(--color-border);
          transition: background-color var(--transition-theme), transform var(--transition-fast);
        }
        .snippet__pipeline-dot--active {
          background: var(--color-primary);
          transform: scale(1.2);
        }
        .snippet__pipeline-dot--done {
          background: var(--color-success);
        }
        .snippet__pipeline-label {
          font-size: 10px;
          font-weight: 500;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color var(--transition-theme);
        }
        .snippet__pipeline-label--active {
          color: var(--color-primary);
          font-weight: 600;
        }
        .snippet__pipeline-bar {
          height: 4px;
          background: var(--color-border);
          border-radius: var(--radius-full);
          overflow: hidden;
          transition: background-color var(--transition-theme);
        }
        .snippet__pipeline-progress {
          height: 100%;
          background: var(--color-primary);
          border-radius: var(--radius-full);
          transform-origin: left;
        }
      `}</style>
    </div>
  );
};

export { PipelineSnippet };
