import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const MessageBubbleSnippet = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  return (
    <div ref={ref} className="snippet snippet--message">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="snippet__messages"
      >
        <div className="snippet__message snippet__message--received">
          <div className="snippet__avatar snippet__avatar--sm" aria-hidden="true">JD</div>
          <div className="snippet__bubble snippet__bubble--received">
            <span className="snippet__bubble-text">When are you available for an interview?</span>
            <span className="snippet__bubble-time">10:24 AM</span>
          </div>
        </div>
        <div className="snippet__message snippet__message--sent">
          <div className="snippet__bubble snippet__bubble--sent">
            <span className="snippet__bubble-text">I am free Thursday afternoon.</span>
            <span className="snippet__bubble-time">10:26 AM</span>
          </div>
        </div>
      </motion.div>
      <style>{`
        .snippet--message {
          width: 100%;
          max-width: 280px;
        }
        .snippet__messages {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-3) var(--space-4);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .snippet__message {
          display: flex;
          align-items: flex-end;
          gap: var(--space-2);
        }
        .snippet__message--sent {
          justify-content: flex-end;
        }
        .snippet__avatar {
          width: 24px;
          height: 24px;
          border-radius: var(--radius-full);
          background: var(--color-primary-soft);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .snippet__bubble {
          max-width: 80%;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .snippet__bubble--received {
          background: var(--color-surface-muted);
          color: var(--color-text);
          border-bottom-left-radius: var(--radius-xs);
        }
        .snippet__bubble--sent {
          background: var(--color-primary);
          color: white;
          border-bottom-right-radius: var(--radius-xs);
        }
        .snippet__bubble-text {
          font-size: var(--text-xs);
          line-height: 1.4;
        }
        .snippet__bubble-time {
          font-size: 10px;
          opacity: 0.7;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export { MessageBubbleSnippet };
