import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const ProfileSetupInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const items = [
    { label: 'Skills', note: '6 skills added', done: true },
    { label: 'Education', note: 'BSc Computer Science', done: true },
    { label: 'Experience', note: 'Internship · 6 months', done: true },
    { label: 'Resume', note: 'PDF uploaded', done: false },
    { label: 'Preferences', note: 'Remote · Full-time', done: false },
  ];

  const completeness = 86;

  return (
    <div ref={ref} className="inline-ui inline-ui--profile">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__profile"
      >
        <div className="inline-ui__profile-bar">
          <div className="inline-ui__profile-dots">
            <span className="inline-ui__profile-dot inline-ui__profile-dot--red" />
            <span className="inline-ui__profile-dot inline-ui__profile-dot--yellow" />
            <span className="inline-ui__profile-dot inline-ui__profile-dot--green" />
          </div>
          <span className="inline-ui__profile-bar-title">Profile Setup</span>
          <span className="inline-ui__profile-bar-badge">{completeness}% complete</span>
        </div>

        <div className="inline-ui__profile-progress">
          <div className="inline-ui__profile-progress-track">
            <motion.div
              className="inline-ui__profile-progress-fill"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={inView ? { scaleX: completeness / 100 } : { scaleX: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.3 }}
              style={{ originX: 0 }}
            />
          </div>
        </div>

        <div className="inline-ui__profile-list">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.06 }}
              className={`inline-ui__profile-item ${item.done ? 'inline-ui__profile-item--done' : ''}`}
            >
              <span className="inline-ui__profile-icon" aria-hidden="true">
                {item.done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </span>
              <span className="inline-ui__profile-item-label">{item.label}</span>
              <span className="inline-ui__profile-item-note">{item.note}</span>
            </motion.div>
          ))}
        </div>

        <div className="inline-ui__profile-footer">
          <span className="inline-ui__profile-footer-label">Next step</span>
          <span className="inline-ui__profile-footer-value">Add resume to reach 100%</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--profile {
          width: 100%;
          max-width: 480px;
        }
        .inline-ui__profile {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__profile-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__profile-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__profile-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__profile-dot--red { background: #f87171; }
        .inline-ui__profile-dot--yellow { background: #fbbf24; }
        .inline-ui__profile-dot--green { background: #4ade80; }
        .inline-ui__profile-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
          flex: 1;
        }
        .inline-ui__profile-bar-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          white-space: nowrap;
        }
        .inline-ui__profile-progress {
          padding: var(--space-3) var(--space-4) 0;
        }
        .inline-ui__profile-progress-track {
          height: 6px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .inline-ui__profile-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-accent), var(--visual-success));
          border-radius: var(--radius-full);
        }
        .inline-ui__profile-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4) var(--space-4);
        }
        .inline-ui__profile-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          background: var(--visual-surface-muted);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__profile-item--done {
          background: var(--visual-surface);
          border-color: var(--visual-success);
        }
        .inline-ui__profile-icon {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-full);
          background: var(--visual-surface-elevated);
          color: var(--visual-text-muted);
          border: 1px solid var(--visual-border);
        }
        .inline-ui__profile-item--done .inline-ui__profile-icon {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .inline-ui__profile-item-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .inline-ui__profile-item-note {
          margin-left: auto;
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          text-align: right;
        }
        .inline-ui__profile-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__profile-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__profile-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
      `}</style>
    </div>
  );
};

export { ProfileSetupInline };