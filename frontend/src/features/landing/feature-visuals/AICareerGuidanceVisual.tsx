import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface SkillMetric {
  name: string;
  level: number;
  recommendation: string;
  impact: string;
}

const AICareerGuidanceVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();

  const skills: SkillMetric[] = [
    { name: 'React', level: 95, recommendation: 'Maintain expertise — strong foundation', impact: 'High' },
    { name: 'TypeScript', level: 92, recommendation: 'Explore advanced types and generics', impact: 'High' },
    { name: 'Node.js', level: 85, recommendation: 'Build a backend service to strengthen', impact: 'Medium' },
    { name: 'Docker', level: 41, recommendation: 'Add containerization projects', impact: 'High' },
    { name: 'Testing', level: 68, recommendation: 'Practice Jest and integration tests', impact: 'Medium' },
  ];

  return (
    <div ref={ref} className="feature-visual feature-visual--guidance">
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
          <span className="feature-visual__bar-title">Career Guidance</span>
          <span className="feature-visual__bar-badge">AI-powered</span>
        </div>

        <div className="feature-visual__guidance-body">
          <div className="feature-visual__guidance-header">
            <div className="feature-visual__guidance-title-group">
              <span className="feature-visual__guidance-badge">Recommended next step</span>
              <h3 className="feature-visual__guidance-title">Strengthen DevOps skills</h3>
            </div>
            <div className="feature-visual__guidance-impact">
              <span className="feature-visual__guidance-impact-label">Impact</span>
              <span className="feature-visual__guidance-impact-value">High</span>
            </div>
          </div>

          <div className="feature-visual__guidance-explanation">
            <p>
              Adding Docker and containerization experience will significantly expand your eligible opportunities. 
              68% of senior frontend roles now list container skills as a requirement or preference.
            </p>
          </div>

          <div className="feature-visual__skills-dashboard">
            <div className="feature-visual__skills-header">
              <span className="feature-visual__skills-title">Skill Proficiency</span>
              <span className="feature-visual__skills-subtitle">Based on your profile and market data</span>
            </div>
            <div className="feature-visual__skills-list">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.08 }}
                  className="feature-visual__skill-row"
                >
                  <div className="feature-visual__skill-row-header">
                    <span className="feature-visual__skill-row-name">{skill.name}</span>
                    <span className="feature-visual__skill-row-level">{skill.level}%</span>
                  </div>
                  <div className="feature-visual__skill-row-track">
                    <motion.div
                      className="feature-visual__skill-row-fill"
                      initial={reduceMotion ? false : { scaleX: 0 }}
                      animate={inView ? { scaleX: skill.level / 100 } : { scaleX: 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.4 + i * 0.08 }}
                      style={{ originX: 0 }}
                    />
                  </div>
                  <div className="feature-visual__skill-row-meta">
                    <span className="feature-visual__skill-row-recommendation">{skill.recommendation}</span>
                    <span className={`feature-visual__skill-row-impact feature-visual__skill-row-impact--${skill.impact.toLowerCase()}`}>
                      {skill.impact} impact
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="feature-visual__guidance-footer">
            <div className="feature-visual__guidance-stat">
              <span className="feature-visual__guidance-stat-value">+23%</span>
              <span className="feature-visual__guidance-stat-label">More opportunities</span>
            </div>
            <div className="feature-visual__guidance-stat">
              <span className="feature-visual__guidance-stat-value">3</span>
              <span className="feature-visual__guidance-stat-label">Skills to improve</span>
            </div>
            <div className="feature-visual__guidance-stat">
              <span className="feature-visual__guidance-stat-value">2</span>
              <span className="feature-visual__guidance-stat-label">Weeks estimated</span>
            </div>
          </div>
        </div>
      </motion.div>
<style>{`
          .feature-visual--guidance {
            width: 100%;
            max-width: 900px;
          }
          @media (min-width: 641px) {
            .feature-visual--guidance {
              max-width: 900px;
            }
          }
.feature-visual--guidance .feature-visual__card {
            overflow: hidden;
            width: 100%;
            max-width: 900px;
            display: flex;
            flex-direction: column;
            background: var(--visual-surface);
            border: 1px solid var(--visual-border);
            border-radius: var(--visual-radius);
            box-shadow: var(--visual-shadow);
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
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          border: 1px solid var(--visual-accent);
          overflow: hidden;
          white-space: nowrap;
        }
        .feature-visual__guidance-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
         .feature-visual__guidance-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-3);
        }
        .feature-visual__guidance-title-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .feature-visual__guidance-badge {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__guidance-title {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
          margin: 0;
        }
        .feature-visual__guidance-impact {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
        }
        .feature-visual__guidance-impact-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__guidance-impact-value {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-success);
        }
        .feature-visual__guidance-explanation {
          padding: var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
           font-size: var(--text-sm);
           color: var(--visual-text);
           line-height: 1.6;
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
         .feature-visual__skills-dashboard {
           display: flex;
           flex-direction: column;
           gap: var(--space-3);
           flex: 1;
           min-height: 0;
           overflow-y: auto;
         }
        .feature-visual__skills-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }
        .feature-visual__skills-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__skills-subtitle {
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .feature-visual__skills-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .feature-visual__skill-row {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .feature-visual__skill-row-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__skill-row-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__skill-row-level {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text-muted);
        }
        .feature-visual__skill-row-track {
          height: 6px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .feature-visual__skill-row-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-accent), var(--visual-success));
          border-radius: var(--radius-full);
        }
        .feature-visual__skill-row-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
        }
        .feature-visual__skill-row-recommendation {
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .feature-visual__skill-row-impact {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__skill-row-impact--high {
          color: var(--visual-danger);
        }
        .feature-visual__skill-row-impact--medium {
          color: var(--visual-warning);
        }
        .feature-visual__guidance-footer {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-muted);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__guidance-stat {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex: 1;
        }
        .feature-visual__guidance-stat-value {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
         .feature-visual__guidance-stat-label {
           font-size: 10px;
           color: var(--visual-text-muted);
           font-weight: 500;
         }
          .feature-visual--guidance button {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

         @media (max-width: 640px) {
          .feature-visual__guidance-header {
            flex-direction: column;
          }
          .feature-visual__skill-row-meta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export { AICareerGuidanceVisual };
