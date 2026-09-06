import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface SkillItem {
  name: string;
  matched: boolean;
}

const AIJobMatchingVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [showExplanation, setShowExplanation] = useState(false);

  const matchedSkills: SkillItem[] = [
    { name: 'React', matched: true },
    { name: 'TypeScript', matched: true },
    { name: 'Node.js', matched: true },
    { name: 'REST APIs', matched: true },
  ];

  const potentialSkills: SkillItem[] = [
    { name: 'Docker', matched: false },
    { name: 'Testing', matched: false },
    { name: 'GraphQL', matched: false },
  ];

  return (
    <div ref={ref} className="feature-visual feature-visual--matching">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        {/* Window chrome */}
        <div className="feature-visual__bar">
          <div className="feature-visual__dots">
            <span className="feature-visual__dot feature-visual__dot--red" />
            <span className="feature-visual__dot feature-visual__dot--yellow" />
            <span className="feature-visual__dot feature-visual__dot--green" />
          </div>
          <span className="feature-visual__bar-title">AI Job Matching</span>
          <span className="feature-visual__bar-badge">Match found</span>
        </div>

        <div className="feature-visual__body">
          {/* Left: Candidate Profile */}
          <div className="feature-visual__panel feature-visual__panel--candidate">
            <div className="feature-visual__panel-header">
              <span className="feature-visual__panel-label">Candidate</span>
            </div>
            <div className="feature-visual__candidate">
              <div className="feature-visual__candidate-avatar">JD</div>
              <div className="feature-visual__candidate-info">
                <div className="feature-visual__candidate-name">Jane Doe</div>
                <div className="feature-visual__candidate-role">Senior Frontend Engineer</div>
              </div>
            </div>
            <div className="feature-visual__candidate-skills">
              {matchedSkills.map((skill, i) => (
                <motion.span
                  key={skill.name}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, ease: EASE, delay: 0.4 + i * 0.05 }}
                  className="feature-visual__chip feature-visual__chip--matched"
                >
                  {skill.name}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Center: Match Analysis */}
          <div className="feature-visual__panel feature-visual__panel--analysis">
            <div className="feature-visual__match-score">
              <svg viewBox="0 0 120 120" className="feature-visual__match-svg">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--visual-border)" strokeWidth="8" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="var(--visual-accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  initial={reduceMotion ? false : { strokeDashoffset: 2 * Math.PI * 54 }}
                  animate={inView ? { strokeDashoffset: 2 * Math.PI * 54 - (87 / 100) * 2 * Math.PI * 54 } : { strokeDashoffset: 2 * Math.PI * 54 }}
                  transition={{ duration: 1.5, ease: EASE, delay: 0.3 }}
                />
              </svg>
              <div className="feature-visual__match-content">
                <span className="feature-visual__match-number">87%</span>
                <span className="feature-visual__match-label">Match</span>
              </div>
            </div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="feature-visual__match-explanation"
            >
              <button
                type="button"
                className="feature-visual__match-why"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                Why this match?
                <span className="feature-visual__match-why-arrow">{showExplanation ? '▲' : '▼'}</span>
              </button>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="feature-visual__match-detail"
                >
                  Strong alignment in core technologies and years of experience. Minor gaps in DevOps and testing, but overall excellent fit for the role requirements.
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right: Job Opportunity */}
          <div className="feature-visual__panel feature-visual__panel--job">
            <div className="feature-visual__panel-header">
              <span className="feature-visual__panel-label">Opportunity</span>
              <span className="feature-visual__panel-badge">New</span>
            </div>
            <div className="feature-visual__job">
              <div className="feature-visual__job-title">Frontend Developer</div>
              <div className="feature-visual__job-company">TechCorp Inc.</div>
              <div className="feature-visual__job-meta">
                <span className="feature-visual__job-badge">Remote</span>
                <span className="feature-visual__job-badge">Full-time</span>
              </div>
              <div className="feature-visual__job-salary">$120K – $150K</div>
            </div>
            <div className="feature-visual__job-skills">
              <span className="feature-visual__job-skill-label">Potential gaps:</span>
              <div className="feature-visual__job-skill-list">
                {potentialSkills.map((skill, i) => (
                  <motion.span
                    key={skill.name}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: EASE, delay: 0.8 + i * 0.05 }}
                    className="feature-visual__chip feature-visual__chip--potential"
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--matching {
          width: 100%;
          max-width: 560px;
        }
        .feature-visual__card {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .feature-visual__bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__dots {
          display: flex;
          gap: 6px;
        }
        .feature-visual__dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .feature-visual__dot--red { background: #f87171; }
        .feature-visual__dot--yellow { background: #fbbf24; }
        .feature-visual__dot--green { background: #4ade80; }
        .feature-visual__bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-success-soft);
          color: var(--visual-success);
        }
        .feature-visual__body {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-3);
          padding: var(--space-4);
        }
        @media (min-width: 768px) {
          .feature-visual__body {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 1024px) {
          .feature-visual__body {
            grid-template-columns: 1fr 1.1fr 1fr;
          }
        }
        .feature-visual__panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .feature-visual__panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__panel-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__panel-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-success-soft);
          color: var(--visual-success);
        }
        .feature-visual__candidate {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .feature-visual__candidate-avatar {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--visual-accent), var(--visual-accent-soft));
          color: var(--visual-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-base);
          font-weight: 700;
          flex-shrink: 0;
        }
        .feature-visual__candidate-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .feature-visual__candidate-name {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__candidate-role {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
        }
        .feature-visual__candidate-skills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .feature-visual__chip {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
        }
        .feature-visual__chip--matched {
          background: var(--visual-success-soft);
          color: var(--visual-success);
          border-color: var(--visual-success);
        }
        .feature-visual__chip--potential {
          background: var(--visual-warning-soft);
          color: var(--visual-warning);
          border-color: var(--visual-warning);
        }
        .feature-visual__match-score {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }
        .feature-visual__match-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .feature-visual__match-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
        }
        .feature-visual__match-number {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
        .feature-visual__match-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__match-explanation {
          text-align: center;
        }
        .feature-visual__match-why {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-accent);
          background: none;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-md);
          transition: background-color 150ms ease;
        }
        .feature-visual__match-why:hover {
          background: var(--visual-accent-soft);
        }
        .feature-visual__match-why-arrow {
          font-size: 10px;
        }
        .feature-visual__match-detail {
          margin-top: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          line-height: 1.5;
          text-align: left;
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__job {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .feature-visual__job-title {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__job-company {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
        }
        .feature-visual__job-meta {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-1);
          flex-wrap: wrap;
        }
        .feature-visual__job-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .feature-visual__job-salary {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
          margin-top: var(--space-2);
        }
        .feature-visual__job-skills {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }
        .feature-visual__job-skill-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__job-skill-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        @media (max-width: 640px) {
          .feature-visual__match-score {
            width: 100px;
            height: 100px;
          }
          .feature-visual__match-number {
            font-size: var(--text-xl);
          }
          .feature-visual__candidate-avatar {
            width: 36px;
            height: 36px;
            font-size: var(--text-sm);
          }
          .feature-visual__candidate-name {
            font-size: var(--text-sm);
          }
        }
      `}</style>
    </div>
  );
};

export { AIJobMatchingVisual };
