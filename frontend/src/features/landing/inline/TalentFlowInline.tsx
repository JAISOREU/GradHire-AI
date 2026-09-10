import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import { PhosphorIcon, type PhosphorIconName } from '../../../components/PhosphorIcon';

const EASE = [0.22, 1, 0.36, 1] as const;

const TalentFlowInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  const steps: Array<{ label: string; icon: PhosphorIconName; active: boolean }> = [
    { label: 'Discover', icon: 'MagnifyingGlass', active: true },
    { label: 'Match', icon: 'Star', active: true },
    { label: 'Apply', icon: 'PaperPlaneTilt', active: false },
    { label: 'Interview', icon: 'ChatCircle', active: false },
    { label: 'Hired', icon: 'CheckCircle', active: false },
  ];

  return (
    <div ref={ref} className="inline-ui inline-ui--flow">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__flow"
      >
        <div className="inline-ui__flow-bar">
          <div className="inline-ui__flow-dots">
            <span className="inline-ui__flow-dot inline-ui__flow-dot--red" />
            <span className="inline-ui__flow-dot inline-ui__flow-dot--yellow" />
            <span className="inline-ui__flow-dot inline-ui__flow-dot--green" />
          </div>
          <span className="inline-ui__flow-bar-title">Hiring Journey</span>
        </div>

        <div className="inline-ui__flow-steps">
          {steps.map((step, i) => (
            <div key={step.label} className={`inline-ui__flow-step ${step.active ? 'inline-ui__flow-step--active' : ''}`}>
              <div className="inline-ui__flow-step-icon"><PhosphorIcon name={step.icon} size={22} weight="duotone" /></div>
              <span className="inline-ui__flow-label">{step.label}</span>
              {i < steps.length - 1 && <div className="inline-ui__flow-connector" />}
            </div>
          ))}
        </div>

        <div className="inline-ui__flow-progress-track">
          <motion.div
            className="inline-ui__flow-progress"
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={inView ? { scaleX: 0.4 } : { scaleX: 0 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
            style={{ originX: 0 }}
          />
        </div>

        <div className="inline-ui__flow-footer">
          <span className="inline-ui__flow-footer-label">Current stage</span>
          <span className="inline-ui__flow-footer-value">Interview — 2 candidates</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--flow {
          width: 100%;
          max-width: 520px;
        }
        .inline-ui__flow {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__flow-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__flow-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__flow-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__flow-dot--red { background: #f87171; }
        .inline-ui__flow-dot--yellow { background: #fbbf24; }
        .inline-ui__flow-dot--green { background: #4ade80; }
        .inline-ui__flow-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .inline-ui__flow-steps {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: var(--space-5) var(--space-4) var(--space-4);
          position: relative;
        }
        .inline-ui__flow-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          position: relative;
          z-index: 1;
          flex: 1;
        }
        .inline-ui__flow-step-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-lg);
          background: var(--visual-surface-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--visual-text-muted);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), transform var(--transition-fast);
        }
        .inline-ui__flow-step--active .inline-ui__flow-step-icon {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
          transform: scale(1.05);
        }
        .inline-ui__flow-connector {
          position: absolute;
          top: 22px;
          left: calc(50% + 24px);
          right: calc(-50% + 24px);
          height: 2px;
          background: var(--visual-border);
          z-index: 0;
        }
        .inline-ui__flow-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: center;
        }
        .inline-ui__flow-step--active .inline-ui__flow-label {
          color: var(--visual-accent);
        }
        .inline-ui__flow-progress-track {
          height: 4px;
          background: var(--visual-border);
          margin: 0 var(--space-4) var(--space-4);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .inline-ui__flow-progress {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-accent), var(--visual-success));
          border-radius: var(--radius-full);
        }
        .inline-ui__flow-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__flow-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__flow-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }

        @media (max-width: 640px) {
          .inline-ui__flow-steps {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
            padding: var(--space-4);
          }
          .inline-ui__flow-step {
            flex-direction: row;
            align-items: center;
            gap: var(--space-3);
            width: 100%;
          }
          .inline-ui__flow-connector {
            position: absolute;
            top: 24px;
            left: 19px;
            right: auto;
            bottom: auto;
            width: 2px;
            height: calc(100% + var(--space-3));
            background: var(--visual-border);
            z-index: 0;
          }
          .inline-ui__flow-step-icon {
            width: 40px;
            height: 40px;
            font-size: 18px;
            flex-shrink: 0;
            z-index: 1;
          }
          .inline-ui__flow-label {
            font-size: var(--text-sm);
            text-align: left;
            letter-spacing: 0.04em;
          }
        }
      `}</style>
    </div>
  );
};

export { TalentFlowInline };
