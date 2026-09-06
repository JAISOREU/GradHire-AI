import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const EmployersInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();

  const candidates = [
    { name: 'Sarah Chen', role: 'Frontend Developer', score: 94, skills: ['React', 'TypeScript'], location: 'San Francisco, CA' },
    { name: 'Michael Ross', role: 'Full-stack Engineer', score: 89, skills: ['Node.js', 'PostgreSQL'], location: 'New York, NY' },
    { name: 'John Park', role: 'React Developer', score: 83, skills: ['React', 'Docker'], location: 'Austin, TX' },
  ];

  return (
    <div ref={ref} className="inline-ui inline-ui--employers">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__card"
      >
        <div className="inline-ui__employers-bar">
          <div className="inline-ui__employers-dots">
            <span className="inline-ui__employers-dot inline-ui__employers-dot--red" />
            <span className="inline-ui__employers-dot inline-ui__employers-dot--yellow" />
            <span className="inline-ui__employers-dot inline-ui__employers-dot--green" />
          </div>
          <span className="inline-ui__employers-bar-title">Candidate Ranking</span>
          <span className="inline-ui__employers-bar-badge">{candidates.length} matches</span>
        </div>

        <div className="inline-ui__employers-list">
          {candidates.map((c, i) => (
            <motion.div
              key={c.name}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.08 }}
              className="inline-ui__employer"
            >
              <div className="inline-ui__employer-rank">#{i + 1}</div>
              <div className="inline-ui__employer-info">
                <div className="inline-ui__employer-avatar">{c.name.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="inline-ui__employer-name">{c.name}</div>
                  <div className="inline-ui__employer-role">{c.role}</div>
                  <div className="inline-ui__employer-location">{c.location}</div>
                </div>
              </div>
              <div className="inline-ui__employer-skills">
                {c.skills.map(s => (
                  <span key={s} className="inline-ui__employer-skill">{s}</span>
                ))}
              </div>
              <div className="inline-ui__employer-score-ring">
                <svg viewBox="0 0 48 48" className="inline-ui__employer-svg">
                  <circle cx="24" cy="24" r="18" fill="none" stroke="var(--visual-border)" strokeWidth="4" />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke="var(--visual-accent)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    transform="rotate(-90 24 24)"
                    initial={reduceMotion ? false : { strokeDashoffset: 2 * Math.PI * 18 }}
                    animate={inView ? { strokeDashoffset: 2 * Math.PI * 18 - (c.score / 100) * 2 * Math.PI * 18 } : { strokeDashoffset: 2 * Math.PI * 18 }}
                    transition={{ duration: 1, ease: EASE, delay: 0.2 + i * 0.1 }}
                  />
                </svg>
                <span className="inline-ui__employer-score">{c.score}%</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="inline-ui__employers-footer">
          <span className="inline-ui__employers-footer-label">Sort by</span>
          <span className="inline-ui__employers-footer-value">Match score ↓</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--employers {
          width: 100%;
          max-width: 520px;
        }
        .inline-ui__card {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__employers-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__employers-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__employers-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__employers-dot--red { background: #f87171; }
        .inline-ui__employers-dot--yellow { background: #fbbf24; }
        .inline-ui__employers-dot--green { background: #4ade80; }
        .inline-ui__employers-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .inline-ui__employers-bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .inline-ui__employers-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
        }
        .inline-ui__employer {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          transition: background-color 150ms ease;
        }
        .inline-ui__employer:hover {
          background: var(--visual-surface-muted);
        }
        .inline-ui__employer-rank {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text-muted);
          width: 20px;
          text-align: center;
          flex-shrink: 0;
        }
        .inline-ui__employer-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex: 1;
          min-width: 0;
        }
        .inline-ui__employer-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .inline-ui__employer-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
          line-height: 1.2;
        }
        .inline-ui__employer-role {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
        }
        .inline-ui__employer-location {
          font-size: 10px;
          color: var(--visual-text-muted);
          opacity: 0.8;
        }
        .inline-ui__employer-skills {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .inline-ui__employer-skill {
          font-size: 9px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
          white-space: nowrap;
        }
        .inline-ui__employer-score-ring {
          position: relative;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
        .inline-ui__employer-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .inline-ui__employer-score {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text);
        }
        .inline-ui__employers-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__employers-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__employers-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
      `}</style>
    </div>
  );
};

export { EmployersInline };
