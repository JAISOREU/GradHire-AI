import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const SkillChipsSnippet = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const matched = ['React', 'TypeScript', 'Node.js', 'PostgreSQL'];
  const missing = ['Docker', 'AWS'];

  return (
    <div ref={ref} className="snippet snippet--skills">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="snippet__skills"
      >
        <div className="snippet__skills-group">
          <span className="snippet__skills-label">Matched</span>
          <div className="snippet__skills-chips">
            {matched.map((skill, i) => (
              <motion.span
                key={skill}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: EASE, delay: 0.1 + i * 0.05 }}
                className="snippet__chip snippet__chip--matched"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
        <div className="snippet__skills-group">
          <span className="snippet__skills-label">Missing</span>
          <div className="snippet__skills-chips">
            {missing.map((skill, i) => (
              <motion.span
                key={skill}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: EASE, delay: 0.2 + i * 0.05 }}
                className="snippet__chip snippet__chip--missing"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>
      <style>{`
        .snippet--skills {
          width: 100%;
          max-width: 280px;
        }
        .snippet__skills {
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
        .snippet__skills-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .snippet__skills-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .snippet__skills-chips {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .snippet__chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
          border: 1px solid transparent;
        }
        .snippet__chip--matched {
          background: var(--color-primary-soft);
          color: var(--color-primary);
        }
        .snippet__chip--missing {
          background: var(--color-surface-muted);
          color: var(--color-text-secondary);
          border-color: var(--color-border);
        }
      `}</style>
    </div>
  );
};

export { SkillChipsSnippet };
