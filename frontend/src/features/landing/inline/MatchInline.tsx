import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const MatchInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const score = 87;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  return (
    <div ref={ref} className="inline-ui inline-ui--match">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__card"
      >
        {/* Window chrome */}
        <div className="inline-ui__window-bar">
          <div className="inline-ui__window-dots">
            <span className="inline-ui__window-dot inline-ui__window-dot--red" />
            <span className="inline-ui__window-dot inline-ui__window-dot--yellow" />
            <span className="inline-ui__window-dot inline-ui__window-dot--green" />
          </div>
          <span className="inline-ui__window-title">AI Match Analysis</span>
          <span className="inline-ui__window-status">
            <span className="inline-ui__window-status-dot" />
            Analyzing
          </span>
        </div>

        <div className="inline-ui__match-header">
          <div>
            <div className="inline-ui__match-role">Frontend Developer</div>
            <div className="inline-ui__match-company">TechCorp Inc. · San Francisco, CA</div>
            <div className="inline-ui__match-meta">
              <span className="inline-ui__match-badge">Full-time</span>
              <span className="inline-ui__match-badge">Remote</span>
              <span className="inline-ui__match-badge">$120K–$150K</span>
            </div>
          </div>
          <div className="inline-ui__match-score">
            <svg viewBox="0 0 80 80" className="inline-ui__match-svg">
              <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--visual-border)" strokeWidth="5" />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                fill="none"
                stroke="var(--visual-accent)"
                strokeWidth="5"
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                initial={reduceMotion ? false : { strokeDashoffset: circumference }}
                animate={inView ? { strokeDashoffset: circumference - (score / 100) * circumference } : { strokeDashoffset: circumference }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
              />
            </svg>
            <span className="inline-ui__match-number">{score}%</span>
          </div>
        </div>

        <div className="inline-ui__match-skills">
          {[
            { name: 'React', match: 95, detail: '3 years experience detected' },
            { name: 'TypeScript', match: 92, detail: 'Proficient usage across codebase' },
            { name: 'PostgreSQL', match: 78, detail: 'Good alignment — advanced queries gap' },
            { name: 'Docker', match: 41, detail: 'Consider adding container projects' },
          ].map((skill) => (
            <div
              key={skill.name}
              className="inline-ui__skill"
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <span className="inline-ui__skill-name">{skill.name}</span>
              <div className="inline-ui__skill-track">
                <motion.div
                  className="inline-ui__skill-fill"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={inView ? { scaleX: skill.match / 100 } : { scaleX: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
                  style={{ originX: 0 }}
                />
              </div>
              <span className="inline-ui__skill-pct">{skill.match}%</span>
              {hoveredSkill === skill.name && (
                <span className="inline-ui__skill-tooltip">{skill.detail}</span>
              )}
            </div>
          ))}
        </div>

        <div className="inline-ui__match-footer">
          <span className="inline-ui__match-footer-label">Match confidence</span>
          <div className="inline-ui__match-footer-bar">
            <motion.div
              className="inline-ui__match-footer-fill"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={inView ? { scaleX: score / 100 } : { scaleX: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.6 }}
              style={{ originX: 0 }}
            />
          </div>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--match {
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
        .inline-ui__window-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__window-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__window-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__window-dot--red { background: #f87171; }
        .inline-ui__window-dot--yellow { background: #fbbf24; }
        .inline-ui__window-dot--green { background: #4ade80; }
        .inline-ui__window-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
          letter-spacing: 0.02em;
        }
        .inline-ui__window-status {
          margin-left: auto;
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .inline-ui__window-status-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: status-pulse 2s ease-in-out infinite;
        }
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .inline-ui__match-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-4) var(--space-3);
        }
        .inline-ui__match-role {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1.2;
        }
        .inline-ui__match-company {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          margin-top: 4px;
        }
        .inline-ui__match-meta {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-2);
          flex-wrap: wrap;
        }
        .inline-ui__match-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          white-space: nowrap;
        }
        .inline-ui__match-score {
          position: relative;
          width: 64px;
          height: 64px;
          flex-shrink: 0;
        }
        .inline-ui__match-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .inline-ui__match-number {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .inline-ui__match-skills {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: 0 var(--space-4) var(--space-4);
        }
        .inline-ui__skill {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          position: relative;
          cursor: default;
        }
        .inline-ui__skill-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
          width: 100px;
          flex-shrink: 0;
        }
        .inline-ui__skill-track {
          flex: 1;
          height: 6px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .inline-ui__skill-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-accent), var(--visual-success));
          border-radius: var(--radius-full);
        }
        .inline-ui__skill-pct {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text-muted);
          width: 32px;
          text-align: right;
        }
        .inline-ui__skill-tooltip {
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--visual-text);
          color: var(--visual-surface);
          font-size: 10px;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: var(--radius-md);
          white-space: nowrap;
          pointer-events: none;
          z-index: 10;
          box-shadow: var(--visual-shadow);
        }
        .inline-ui__match-footer {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__match-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .inline-ui__match-footer-bar {
          flex: 1;
          height: 4px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .inline-ui__match-footer-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-accent), var(--visual-success));
          border-radius: var(--radius-full);
        }

        @media (max-width: 640px) {
          .inline-ui__match-score {
            width: 52px;
            height: 52px;
          }
          .inline-ui__skill-name {
            width: 72px;
            font-size: var(--text-xs);
          }
          .inline-ui__skill-pct {
            width: 24px;
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
};

export { MatchInline };
