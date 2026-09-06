import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const PrivacyBadgeSnippet = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const items = [
    { icon: 'lock', label: 'End-to-end encrypted' },
    { icon: 'shield', label: 'Access controlled' },
    { icon: 'eye-off', label: 'Private by default' },
  ];

  return (
    <div ref={ref} className="snippet snippet--privacy">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="snippet__privacy"
      >
        {items.map((item, i) => (
          <motion.div
            key={item.icon}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.08 }}
            className="snippet__privacy-item"
          >
            <div className="snippet__privacy-icon">
              {item.icon === 'lock' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              )}
              {item.icon === 'shield' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              )}
              {item.icon === 'eye-off' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              )}
            </div>
            <span className="snippet__privacy-label">{item.label}</span>
            <svg className="snippet__check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </motion.div>
        ))}
      </motion.div>
      <style>{`
        .snippet--privacy {
          width: 100%;
          max-width: 280px;
        }
        .snippet__privacy {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .snippet__privacy-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .snippet__privacy-icon {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-success-soft);
          color: var(--color-success);
          border-radius: var(--radius-md);
        }
        .snippet__privacy-label {
          flex: 1;
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--color-text);
        }
        .snippet__check {
          flex-shrink: 0;
          color: var(--color-success);
        }
      `}</style>
    </div>
  );
};

export { PrivacyBadgeSnippet };
