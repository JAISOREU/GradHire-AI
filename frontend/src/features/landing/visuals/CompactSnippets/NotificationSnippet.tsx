import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const NotificationSnippet = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="snippet snippet--notification">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -12 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="snippet__toast"
      >
        <div className="snippet__toast-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </div>
        <div className="snippet__toast-content">
          <span className="snippet__toast-title">New application received</span>
          <span className="snippet__toast-text">TechCorp Inc. viewed your profile</span>
        </div>
        <span className="snippet__toast-time">2m ago</span>
      </motion.div>
      <style>{`
        .snippet--notification {
          width: 100%;
          max-width: 320px;
        }
        .snippet__toast {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .snippet__toast-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-primary-soft);
          color: var(--color-primary);
          border-radius: var(--radius-md);
        }
        .snippet__toast-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .snippet__toast-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-text);
        }
        .snippet__toast-text {
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }
        .snippet__toast-time {
          flex-shrink: 0;
          font-size: 10px;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export { NotificationSnippet };
