import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface SkillItem {
  name: string;
  level: number;
  matched: boolean;
}

const ProfileIntelligenceVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const skills: SkillItem[] = [
    { name: 'React', level: 95, matched: true },
    { name: 'TypeScript', level: 92, matched: true },
    { name: 'Node.js', level: 85, matched: true },
    { name: 'PostgreSQL', level: 78, matched: true },
    { name: 'Docker', level: 41, matched: false },
    { name: 'Testing', level: 68, matched: false },
  ];

  return (
    <div ref={ref} className="feature-visual feature-visual--profile">
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
          <span className="feature-visual__bar-title">Profile Intelligence</span>
          <span className="feature-visual__bar-badge">
            <span className="feature-visual__status-dot" />
            {inView ? 'Analyzed' : 'Analyzing...'}
          </span>
        </div>

        <div className="feature-visual__body">
          {/* Left: Profile Summary */}
          <div className="feature-visual__profile">
            <div className="feature-visual__profile-avatar">
              <span>JD</span>
            </div>
            <div className="feature-visual__profile-info">
              <div className="feature-visual__profile-name">Jane Doe</div>
              <div className="feature-visual__profile-role">Senior Frontend Engineer</div>
              <div className="feature-visual__profile-meta">
                <span className="feature-visual__profile-badge">5+ years</span>
                <span className="feature-visual__profile-badge">Remote</span>
              </div>
            </div>
            <div className="feature-visual__profile-stats">
              <div className="feature-visual__profile-stat">
                <span className="feature-visual__profile-stat-value">12</span>
                <span className="feature-visual__profile-stat-label">Projects</span>
              </div>
              <div className="feature-visual__profile-stat">
                <span className="feature-visual__profile-stat-value">8</span>
                <span className="feature-visual__profile-stat-label">Skills</span>
              </div>
              <div className="feature-visual__profile-stat">
                <span className="feature-visual__profile-stat-value">4.9</span>
                <span className="feature-visual__profile-stat-label">Rating</span>
              </div>
            </div>
          </div>

          {/* Center: Skill Matrix */}
          <div className="feature-visual__skills">
            <div className="feature-visual__section-header">
              <span className="feature-visual__section-title">Detected Skills</span>
              <span className="feature-visual__section-count">{skills.length} found</span>
            </div>
            <div className="feature-visual__skill-list">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.08 }}
                  className="feature-visual__skill-item"
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                >
                  <div className="feature-visual__skill-header">
                    <span className="feature-visual__skill-name">{skill.name}</span>
                    <span className="feature-visual__skill-level">{skill.level}%</span>
                  </div>
                  <div className="feature-visual__skill-track">
                    <motion.div
                      className="feature-visual__skill-fill"
                      initial={reduceMotion ? false : { scaleX: 0 }}
                      animate={inView ? { scaleX: skill.level / 100 } : { scaleX: 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.5 + i * 0.08 }}
                      style={{ originX: 0 }}
                    />
                  </div>
                  {hoveredSkill === skill.name && (
                    <div className="feature-visual__skill-tooltip">
                      {skill.matched ? 'Strong match for current roles' : 'Potential growth area'}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: AI Analysis */}
          <div className="feature-visual__analysis">
            <div className="feature-visual__analysis-header">
              <span className="feature-visual__analysis-badge">AI INSIGHT</span>
              <span className="feature-visual__analysis-dot" aria-hidden="true" />
            </div>
            <div className="feature-visual__analysis-content">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.8 }}
                className="feature-visual__analysis-text"
              >
                Strong candidate with excellent React and TypeScript proficiency. Experience aligns with senior-level expectations. Consider upskilling in containerization to unlock more opportunities.
              </motion.div>
            </div>
            <div className="feature-visual__analysis-metrics">
              <div className="feature-visual__analysis-metric">
                <span className="feature-visual__analysis-metric-value">5</span>
                <span className="feature-visual__analysis-metric-label">Strengths</span>
              </div>
              <div className="feature-visual__analysis-metric">
                <span className="feature-visual__analysis-metric-value">2</span>
                <span className="feature-visual__analysis-metric-label">Growth areas</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--profile {
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
          font-weight: 600;
          color: var(--visual-text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .feature-visual__status-dot {
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
        .feature-visual__body {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-4);
          padding: var(--space-4);
        }
        @media (min-width: 768px) {
          .feature-visual__body {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 1024px) {
          .feature-visual__body {
            grid-template-columns: 1fr 1.2fr 1fr;
          }
        }
        .feature-visual__profile {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--visual-radius);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__profile-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--visual-accent), var(--visual-accent-soft));
          color: var(--visual-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-lg);
          font-weight: 700;
        }
        .feature-visual__profile-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .feature-visual__profile-name {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__profile-role {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
        }
        .feature-visual__profile-meta {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-1);
          flex-wrap: wrap;
        }
        .feature-visual__profile-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .feature-visual__profile-stats {
          display: flex;
          gap: var(--space-2);
          margin-top: auto;
        }
        .feature-visual__profile-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          flex: 1;
          padding: var(--space-2);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__profile-stat-value {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
        .feature-visual__profile-stat-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .feature-visual__skills {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .feature-visual__section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__section-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__section-count {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__skill-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__skill-item {
          position: relative;
          padding: var(--space-2);
          border-radius: var(--radius-md);
          transition: background-color 150ms ease;
        }
        .feature-visual__skill-item:hover {
          background: var(--visual-surface-muted);
        }
        .feature-visual__skill-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .feature-visual__skill-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__skill-level {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text-muted);
        }
        .feature-visual__skill-track {
          height: 6px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .feature-visual__skill-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-accent), var(--visual-success));
          border-radius: var(--radius-full);
        }
        .feature-visual__skill-tooltip {
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
        .feature-visual__analysis {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--visual-radius);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__analysis-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .feature-visual__analysis-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--visual-accent);
        }
        .feature-visual__analysis-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: status-pulse 2s ease-in-out infinite;
        }
        .feature-visual__analysis-content {
          flex: 1;
        }
        .feature-visual__analysis-text {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          line-height: 1.6;
        }
        .feature-visual__analysis-metrics {
          display: flex;
          gap: var(--space-4);
          padding-top: var(--space-2);
          border-top: 1px solid var(--visual-border);
          transition: border-color var(--transition-theme);
        }
        .feature-visual__analysis-metric {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .feature-visual__analysis-metric-value {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
        .feature-visual__analysis-metric-label {
          font-size: 10px;
          color: var(--visual-text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        @media (max-width: 640px) {
          .feature-visual__profile-avatar {
            width: 40px;
            height: 40px;
            font-size: var(--text-base);
          }
          .feature-visual__skill-name {
            font-size: var(--text-xs);
          }
          .feature-visual__skill-level {
            font-size: 10px;
          }
          .feature-visual__analysis-text {
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
};

export { ProfileIntelligenceVisual };
