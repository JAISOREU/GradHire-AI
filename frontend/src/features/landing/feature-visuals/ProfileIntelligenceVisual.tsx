import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { PhosphorIcon, type PhosphorIconName } from '../../../components/PhosphorIcon';

const EASE = [0.22, 1, 0.36, 1] as const;

interface SkillItem {
  name: string;
  level: number;
  matched: boolean;
}

interface ActivityItem {
  id: number;
  action: string;
  time: string;
  icon: string;
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
    { name: 'GraphQL', level: 55, matched: false },
    { name: 'AWS', level: 48, matched: false },
  ];

  const activities: ActivityItem[] = [
    { id: 1, action: 'Resume uploaded', time: '2 hours ago', icon: 'file' },
    { id: 2, action: 'Profile completed', time: '1 day ago', icon: 'check' },
    { id: 3, action: 'Matched with 12 jobs', time: '3 days ago', icon: 'match' },
  ];

  const completeness = 87;

  return (
    <div ref={ref} className="feature-visual feature-visual--profile">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        {/* Floating background particles */}
        <div className="feature-visual__particles" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="feature-visual__particle"
              initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
              animate={inView ? { opacity: [0, 0.3, 0], scale: [0, 1.5, 0] } : { opacity: 0, scale: 0 }}
              transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
            />
          ))}
        </div>

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
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="feature-visual__profile-header"
            >
              <div className="feature-visual__profile-avatar">
                <span>JD</span>
              </div>
              <div className="feature-visual__profile-info">
                <div className="feature-visual__profile-name">Jane Doe</div>
                <div className="feature-visual__profile-role">Senior Frontend Engineer</div>
                <div className="feature-visual__profile-meta">
                  <span className="visual-badge">5+ years</span>
                  <span className="visual-badge">Remote</span>
                </div>
              </div>
            </motion.div>

            {/* Completeness meter */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
              className="feature-visual__completeness"
            >
              <div className="feature-visual__completeness-header">
                <span className="feature-visual__completeness-label">Profile completeness</span>
                <span className="feature-visual__completeness-value">{completeness}%</span>
              </div>
              <div className="feature-visual__completeness-track">
                <motion.div
                  className="feature-visual__completeness-fill"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={inView ? { scaleX: completeness / 100 } : { scaleX: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.4 }}
                  style={{ originX: 0 }}
                />
              </div>
            </motion.div>

            <div className="feature-visual__profile-stats">
              {[
                { value: '12', label: 'Projects', trend: '+3' },
                { value: '8', label: 'Skills', trend: '+2' },
                { value: '4.9', label: 'Rating', trend: '+0.2' },
                { value: '87%', label: 'Match', trend: '+5%' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.08 }}
                  className="feature-visual__profile-stat"
                >
                  <span className="feature-visual__profile-stat-value">{stat.value}</span>
                  <span className="feature-visual__profile-stat-label">{stat.label}</span>
                  <span className="feature-visual__profile-stat-trend">{stat.trend}</span>
                </motion.div>
              ))}
            </div>

            {/* Recent activity */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
              className="feature-visual__activity"
            >
              <span className="feature-visual__activity-title">Recent Activity</span>
              <div className="feature-visual__activity-list">
                {activities.map((act, i) => (
                  <motion.div
                    key={act.id}
                    initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.7 + i * 0.1 }}
                    className="feature-visual__activity-item"
                  >
                    <div className="feature-visual__activity-icon">
                      {act.icon === 'file' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      )}
                      {act.icon === 'check' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {act.icon === 'match' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 8v8M8 12h8" />
                        </svg>
                      )}
                    </div>
                    <div className="feature-visual__activity-info">
                      <span className="feature-visual__activity-action">{act.action}</span>
                      <span className="feature-visual__activity-time">{act.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
                  transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.06 }}
                  className={`feature-visual__skill-item ${skill.matched ? 'matched' : 'growth'}`}
                  onMouseEnter={() => setHoveredSkill(skill.name)}
                  onMouseLeave={() => setHoveredSkill(null)}
                  whileHover={reduceMotion ? {} : { x: 4 }}
                >
                  <div className="feature-visual__skill-header">
                    <div className="feature-visual__skill-name-wrap">
                      <span className="feature-visual__skill-name">{skill.name}</span>
                      {skill.matched && (
                        <span className="visual-badge visual-badge--success">Matched</span>
                      )}
                    </div>
                    <span className="feature-visual__skill-level">{skill.level}%</span>
                  </div>
                  <div className="feature-visual__skill-track">
                    <motion.div
                      className="feature-visual__skill-fill"
                      initial={reduceMotion ? false : { scaleX: 0 }}
                      animate={inView ? { scaleX: skill.level / 100 } : { scaleX: 0 }}
                      transition={{ duration: 0.8, ease: EASE, delay: 0.4 + i * 0.06 }}
                      style={{ originX: 0 }}
                    />
                  </div>
                  {hoveredSkill === skill.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="feature-visual__skill-tooltip"
                    >
                      {skill.matched ? 'Strong match for current roles' : 'Potential growth area'}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* AI Suggestions */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.8 }}
              className="feature-visual__suggestions"
            >
              <span className="feature-visual__suggestions-title">AI Suggestions</span>
              <div className="feature-visual__suggestion-list">
                {[
                  { icon: 'BookOpen', text: 'Add Docker certification' },
                  { icon: 'Briefcase', text: 'Upload portfolio projects' },
                  { icon: 'Target', text: 'Complete skill assessments' },
                ].map((suggestion, i) => (
                  <motion.div
                    key={i}
                    initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.9 + i * 0.1 }}
                    className="feature-visual__suggestion-item"
                  >
                    <span className="feature-visual__suggestion-icon"><PhosphorIcon name={suggestion.icon as PhosphorIconName} size={14} weight="bold" /></span>
                    <span className="feature-visual__suggestion-text">{suggestion.text}</span>
                    <button type="button" className="feature-visual__suggestion-action">Add</button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: AI Analysis */}
          <div className="feature-visual__analysis">
            <div className="feature-visual__analysis-header">
              <motion.span
                className="feature-visual__analysis-badge"
                animate={inView ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI INSIGHT
              </motion.span>
              <span className="feature-visual__analysis-dot" aria-hidden="true" />
            </div>
            <div className="feature-visual__analysis-content">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
                className="feature-visual__analysis-text"
              >
                Strong candidate with excellent React and TypeScript proficiency. Experience aligns with senior-level expectations. Consider upskilling in containerization to unlock more opportunities.
              </motion.div>
            </div>

            <div className="feature-visual__analysis-metrics">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.6 }}
                className="feature-visual__analysis-metric"
              >
                <span className="feature-visual__analysis-metric-value">5</span>
                <span className="feature-visual__analysis-metric-label">Strengths</span>
              </motion.div>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.7 }}
                className="feature-visual__analysis-metric"
              >
                <span className="feature-visual__analysis-metric-value">3</span>
                <span className="feature-visual__analysis-metric-label">Growth areas</span>
              </motion.div>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.8 }}
                className="feature-visual__analysis-metric"
              >
                <span className="feature-visual__analysis-metric-value">12</span>
                <span className="feature-visual__analysis-metric-label">Job matches</span>
              </motion.div>
            </div>

            {/* Education section */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.9 }}
              className="feature-visual__education"
            >
              <span className="feature-visual__education-title">Education</span>
              <div className="feature-visual__education-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                <div>
                  <span className="feature-visual__education-degree">MS Computer Science</span>
                  <span className="feature-visual__education-school">Stanford University, 2019</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--profile {
          width: 100%;
          max-width: 900px;
        }
        @media (max-width: 767px) {
          .feature-visual--profile {
            max-width: 100%;
          }
        }
        .feature-visual__card {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .feature-visual__particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .feature-visual__particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--visual-accent);
        }
        .feature-visual__particle:nth-child(1) { top: 20%; left: 10%; }
        .feature-visual__particle:nth-child(2) { top: 40%; left: 85%; }
        .feature-visual__particle:nth-child(3) { top: 60%; left: 20%; }
        .feature-visual__particle:nth-child(4) { top: 80%; left: 75%; }
        .feature-visual__particle:nth-child(5) { top: 30%; left: 50%; }
        .feature-visual__particle:nth-child(6) { top: 70%; left: 40%; }
        .feature-visual__bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          position: relative;
          z-index: 1;
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
          grid-template-rows: auto 1fr;
          gap: var(--space-4);
          padding: var(--space-4);
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          position: relative;
          z-index: 1;
        }
        @media (min-width: 768px) {
          .feature-visual__body {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr;
          }
        }
        @media (min-width: 1600px) {
          .feature-visual__body {
            grid-template-columns: 1.1fr 1.2fr 1fr;
            grid-template-rows: 1fr;
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
        .feature-visual__profile-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .feature-visual__profile-avatar {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--visual-accent), var(--visual-accent-soft));
          color: var(--visual-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .feature-visual__profile-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .feature-visual__profile-name {
          font-size: var(--text-lg);
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
        .visual-badge {
          position: relative;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
          border: 1px solid var(--visual-border);
          overflow: hidden;
          white-space: nowrap;
        }
        .visual-badge--success {
          background: rgba(34, 197, 94, 0.15);
          border-color: var(--visual-success);
          color: var(--visual-success);
        }
        .visual-badge--accent {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .feature-visual__completeness {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__completeness-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__completeness-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__completeness-value {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-success);
        }
        .feature-visual__completeness-track {
          height: 8px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .feature-visual__completeness-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-success), var(--visual-accent));
          border-radius: var(--radius-full);
        }
        .feature-visual__profile-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-2);
        }
        .feature-visual__profile-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--space-2);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          position: relative;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .feature-visual__profile-stat:hover {
          transform: translateY(-2px);
          box-shadow: var(--visual-shadow);
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
        .feature-visual__profile-stat-trend {
          position: absolute;
          top: 4px;
          right: 4px;
          font-size: 8px;
          font-weight: 700;
          color: var(--visual-success);
        }
        .feature-visual__activity {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__activity-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__activity-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__activity-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .feature-visual__activity-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .feature-visual__activity-action {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__activity-time {
          font-size: 10px;
          color: var(--visual-text-muted);
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
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          transition: all 150ms ease;
        }
        .feature-visual__skill-item:hover {
          border-color: var(--visual-accent);
          box-shadow: var(--visual-shadow);
        }
        .feature-visual__skill-item.matched {
          border-left: 3px solid var(--visual-success);
        }
        .feature-visual__skill-item.growth {
          border-left: 3px solid var(--visual-warning);
        }
        .feature-visual__skill-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .feature-visual__skill-name-wrap {
          display: flex;
          align-items: center;
          gap: var(--space-2);
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
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--visual-text);
          color: var(--visual-surface);
          font-size: 10px;
          font-weight: 500;
          padding: 6px 10px;
          border-radius: var(--radius-md);
          white-space: nowrap;
          pointer-events: none;
          z-index: 10;
          box-shadow: var(--visual-shadow);
        }
        .feature-visual__suggestions {
          display: flex;
          flex-direction: column;
          gap: var(--space-0.1);
          padding: var(--space-2);
          background: var(--visual-accent-soft);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-accent);
        }
        .feature-visual__suggestions-title {
          font-size: 11px;
          font-weight: 700;
          color: var(--visual-accent);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__suggestion-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .feature-visual__suggestion-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
        }
        .feature-visual__suggestion-icon {
          font-size: 14px;
        }
        .feature-visual__suggestion-text {
          flex: 1;
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--visual-text);
        }
        .feature-visual__suggestion-action {
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-accent);
          background: var(--visual-accent-soft);
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 150ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__suggestion-action:hover {
          background: var(--visual-accent);
          color: var(--visual-surface);
        }
        .feature-visual__analysis {
          width: 250px;
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
          gap: var(--space-2);
          padding-top: var(--space-2);
          border-top: 1px solid var(--visual-border);
        }
        .feature-visual__analysis-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          flex: 1;
          padding: var(--space-2);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__analysis-metric-value {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
        .feature-visual__analysis-metric-label {
          font-size: 9px;
          color: var(--visual-text-muted);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          text-align: center;
        }
        .feature-visual__education {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__education-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__education-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
        }
        .feature-visual__education-item svg {
          color: var(--visual-accent);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .feature-visual__education-degree {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__education-school {
          display: block;
          font-size: 10px;
          color: var(--visual-text-muted);
          margin-top: 2px;
        }

        @media (min-width: 768px) and (max-width: 1599px) {
          .feature-visual__analysis {
            grid-column: 1 / -1;
            width: auto;
          }
        }

        @media (max-width: 640px) {
          .feature-visual__profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .feature-visual__analysis-metrics {
            flex-wrap: wrap;
          }
          .feature-visual__analysis-metric {
            min-width: calc(50% - var(--space-1));
          }
          .feature-visual__profile-avatar {
            width: 48px;
            height: 48px;
            font-size: var(--text-base);
          }
          .feature-visual__profile-name {
            font-size: var(--text-base);
          }
        }
        @media (max-width: 375px) {
          .feature-visual__profile-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .feature-visual__skill-name {
            font-size: var(--text-xs);
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
