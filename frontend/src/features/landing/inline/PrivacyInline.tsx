import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const PrivacyInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  const items = [
    { label: 'End-to-end encrypted', icon: 'lock' },
    { label: 'Access controlled', icon: 'shield' },
    { label: 'Private by default', icon: 'eye-off' },
  ];

  return (
    <div ref={ref} className="inline-ui inline-ui--privacy">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__privacy"
      >
        <div className="inline-ui__privacy-bar">
          <div className="inline-ui__privacy-dots">
            <span className="inline-ui__privacy-dot inline-ui__privacy-dot--red" />
            <span className="inline-ui__privacy-dot inline-ui__privacy-dot--yellow" />
            <span className="inline-ui__privacy-dot inline-ui__privacy-dot--green" />
          </div>
          <span className="inline-ui__privacy-bar-title">Security Center</span>
          <span className="inline-ui__privacy-bar-badge">Protected</span>
        </div>

        <div className="inline-ui__privacy-body">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.08 }}
              className="inline-ui__privacy-item"
            >
              <div className="inline-ui__privacy-icon">
                {item.icon === 'lock' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                )}
                {item.icon === 'shield' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                )}
                {item.icon === 'eye-off' && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </div>
              <span className="inline-ui__privacy-label">{item.label}</span>
              <svg className="inline-ui__check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>
          ))}
        </div>

        <div className="inline-ui__privacy-footer">
          <span className="inline-ui__privacy-footer-label">Compliance</span>
          <span className="inline-ui__privacy-footer-value">SOC 2 · GDPR · CCPA</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--privacy {
          width: 100%;
          max-width: 480px;
        }
        .inline-ui__privacy {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__privacy-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__privacy-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__privacy-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__privacy-dot--red { background: #f87171; }
        .inline-ui__privacy-dot--yellow { background: #fbbf24; }
        .inline-ui__privacy-dot--green { background: #4ade80; }
        .inline-ui__privacy-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .inline-ui__privacy-bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-success-soft);
          color: var(--visual-success);
        }
        .inline-ui__privacy-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-4);
        }
        .inline-ui__privacy-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          transition: background-color 150ms ease;
        }
        .inline-ui__privacy-item:hover {
          background: var(--visual-surface-muted);
        }
        .inline-ui__privacy-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--visual-success-soft);
          color: var(--visual-success);
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .inline-ui__privacy-label {
          flex: 1;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .inline-ui__check {
          flex-shrink: 0;
          color: var(--visual-success);
        }
        .inline-ui__privacy-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__privacy-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__privacy-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
      `}</style>
    </div>
  );
};

export { PrivacyInline };
