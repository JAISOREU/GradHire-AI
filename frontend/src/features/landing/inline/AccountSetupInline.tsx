import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const AccountSetupInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div ref={ref} className="inline-ui inline-ui--account">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__account"
      >
        <div className="inline-ui__account-bar">
          <div className="inline-ui__account-dots">
            <span className="inline-ui__account-dot inline-ui__account-dot--red" />
            <span className="inline-ui__account-dot inline-ui__account-dot--yellow" />
            <span className="inline-ui__account-dot inline-ui__account-dot--green" />
          </div>
          <span className="inline-ui__account-bar-title">Create Account</span>
          <span className="inline-ui__account-bar-badge">{submitted ? 'Done' : 'New'}</span>
        </div>

        <div className="inline-ui__account-body">
          <div className="inline-ui__account-roles">
            <span className="inline-ui__account-role inline-ui__account-role--active">Student</span>
            <span className="inline-ui__account-role">Employer</span>
          </div>

          <div className="inline-ui__account-fields">
            <label className="inline-ui__field">
              <span className="inline-ui__field-label">Full name</span>
              <span className="inline-ui__input">Jordan Miles</span>
            </label>
            <label className="inline-ui__field">
              <span className="inline-ui__field-label">Email</span>
              <span className="inline-ui__input">jordan@example.com</span>
            </label>
            <label className="inline-ui__field">
              <span className="inline-ui__field-label">Password</span>
              <span className="inline-ui__input">••••••••••</span>
            </label>
          </div>

          <button
            type="button"
            className={`inline-ui__account-submit ${submitted ? 'inline-ui__account-submit--done' : ''}`}
            onClick={() => setSubmitted(true)}
          >
            {submitted ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Account created
              </>
            ) : (
              'Create account'
            )}
          </button>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="inline-ui__account-success"
            >
              Welcome, Jordan — your profile is ready to build.
            </motion.div>
          )}
        </div>

        <div className="inline-ui__account-footer">
          <span className="inline-ui__account-footer-label">Time to complete</span>
          <span className="inline-ui__account-footer-value">Under a minute</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--account {
          width: 100%;
          max-width: 480px;
        }
        .inline-ui__account {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__account-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__account-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__account-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__account-dot--red { background: #f87171; }
        .inline-ui__account-dot--yellow { background: #fbbf24; }
        .inline-ui__account-dot--green { background: #4ade80; }
        .inline-ui__account-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
          flex: 1;
        }
        .inline-ui__account-bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .inline-ui__account-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-4);
        }
        .inline-ui__account-roles {
          display: flex;
          gap: var(--space-2);
        }
        .inline-ui__account-role {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          background: var(--visual-surface-muted);
          border: 1px solid var(--visual-border);
          color: var(--visual-text-muted);
        }
        .inline-ui__account-role--active {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .inline-ui__account-fields {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .inline-ui__field {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .inline-ui__field-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .inline-ui__input {
          display: block;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          font-size: var(--text-sm);
          color: var(--visual-text);
        }
        .inline-ui__account-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border: none;
          border-radius: var(--radius-md);
          background: var(--visual-accent);
          color: var(--visual-surface);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: background-color 150ms ease, transform 150ms ease;
        }
        .inline-ui__account-submit:hover {
          opacity: 0.92;
        }
        .inline-ui__account-submit:active {
          transform: translateY(1px);
        }
        .inline-ui__account-submit--done {
          background: var(--visual-success);
        }
        .inline-ui__account-success {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-success);
        }
        .inline-ui__account-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__account-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__account-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
      `}</style>
    </div>
  );
};

export { AccountSetupInline };