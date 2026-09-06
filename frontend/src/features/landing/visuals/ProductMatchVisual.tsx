import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { AnimatedCounter } from '../../../animations';

const EASE = [0.22, 1, 0.36, 1] as const;

interface SkillItem {
  label: string;
  matched: boolean;
  score?: number;
  detail?: string;
}

interface ProductMatchVisualProps {
  role?: string;
  matchScore?: number;
  skills?: SkillItem[];
  className?: string;
}

type Stage = 'analyzing' | 'resume' | 'skills' | 'finding' | 'match' | 'details';

const STAGE_DURATIONS: Record<Stage, number> = {
  analyzing: 1200,
  resume: 1000,
  skills: 1200,
  finding: 1500,
  match: 800,
  details: 0,
};

const STAGES: Stage[] = ['analyzing', 'resume', 'skills', 'finding', 'match', 'details'];

const DEFAULT_SKILLS: SkillItem[] = [
  { label: 'React', matched: true, score: 95, detail: 'Strong alignment — 3 years experience detected' },
  { label: 'TypeScript', matched: true, score: 92, detail: 'Strong alignment — proficient usage' },
  { label: 'PostgreSQL', matched: true, score: 78, detail: 'Good alignment — some gaps in advanced queries' },
  { label: 'Docker', matched: false, score: 41, detail: 'Potential improvement — consider adding container projects' },
];

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase' },
  { id: 'matches', label: 'Matches', icon: 'star' },
  { id: 'apps', label: 'Applications', icon: 'file' },
  { id: 'messages', label: 'Messages', icon: 'message' },
];

export const ProductMatchVisual = ({
  role = 'Frontend Developer',
  matchScore = 87,
  skills = DEFAULT_SKILLS,
  className = '',
}: ProductMatchVisualProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>('analyzing');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [expandedInsight, setExpandedInsight] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const scoreRadius = 54;
  const scoreCircumference = 2 * Math.PI * scoreRadius;

  useEffect(() => {
    if (!inView) return;

    if (reduceMotion) {
      setStage('details');
      return;
    }

    setStage('analyzing');

    const timers: number[] = [];
    let elapsed = 0;

    STAGES.forEach((s, i) => {
      if (i === 0) return;
      elapsed += STAGE_DURATIONS[STAGES[i - 1]];
      const timer = window.setTimeout(() => {
        setStage(s);
      }, elapsed);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [inView, reduceMotion]);

  const isStageVisible = (s: Stage) => {
    if (!inView) return false;
    const currentIndex = STAGES.indexOf(stage);
    const targetIndex = STAGES.indexOf(s);
    return targetIndex <= currentIndex;
  };

  return (
    <div
      ref={ref}
      className={`product-match-visual ${inView ? 'product-match-visual--visible' : ''} ${className}`.trim()}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="product-match-visual__window"
      >
        {/* Window header */}
        <div className="product-match-visual__header">
          <div className="product-match-visual__title-bar">
            <span className="product-match-visual__dot product-match-visual__dot--red" />
            <span className="product-match-visual__dot product-match-visual__dot--yellow" />
            <span className="product-match-visual__dot product-match-visual__dot--green" />
          </div>
          <div className="product-match-visual__header-text">
            <span className="product-match-visual__label">Gradture AI Match</span>
          </div>
          <div className="product-match-visual__header-actions">
            <span className="product-match-visual__status">
              <span className="product-match-visual__status-dot" />
              Live
            </span>
          </div>
        </div>

        {/* Window body */}
        <div className="product-match-visual__body">
          <div className="product-match-visual__layout">
            {/* Sidebar */}
            <div className="product-match-visual__sidebar">
              <div className="product-match-visual__sidebar-brand">
                <span className="product-match-visual__sidebar-logo" aria-hidden="true">G</span>
                <span className="product-match-visual__sidebar-name">Gradture</span>
              </div>
              <nav className="product-match-visual__sidebar-nav" aria-label="Simulated navigation">
                {SIDEBAR_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`product-match-visual__sidebar-item ${activeTab === item.id ? 'product-match-visual__sidebar-item--active' : ''}`}
                    onMouseEnter={() => setActiveTab(item.id)}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span className="product-match-visual__sidebar-icon" aria-hidden="true">
                      {item.icon === 'home' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      )}
                      {item.icon === 'briefcase' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                      )}
                      {item.icon === 'star' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      )}
                      {item.icon === 'file' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      )}
                      {item.icon === 'message' && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      )}
                    </span>
                    <span className="product-match-visual__sidebar-label">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <div className="product-match-visual__content">
              {/* Status bar */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={isStageVisible('analyzing') || isStageVisible('resume') || isStageVisible('skills') || isStageVisible('finding') || isStageVisible('match') || isStageVisible('details') ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="product-match-visual__status-bar"
              >
                {stage === 'analyzing' && (
                  <span className="product-match-visual__status-text">Analyzing profile...</span>
                )}
                {stage === 'resume' && (
                  <span className="product-match-visual__status-text product-match-visual__status-text--success">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -1 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Resume analyzed
                  </span>
                )}
                {stage === 'skills' && (
                  <span className="product-match-visual__status-text product-match-visual__status-text--success">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -1 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    12 skills detected
                  </span>
                )}
                {stage === 'finding' && (
                  <span className="product-match-visual__status-text">Finding compatible opportunities...</span>
                )}
                {(stage === 'match' || stage === 'details') && (
                  <span className="product-match-visual__status-text product-match-visual__status-text--success">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: -1 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Best match found
                  </span>
                )}
              </motion.div>

              {/* Role */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={isStageVisible('match') || isStageVisible('details') ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="product-match-visual__role"
              >
                <span className="product-match-visual__role-label">Recommended Role</span>
                <span className="product-match-visual__role-title">{role}</span>
              </motion.div>

              {/* Match score */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                animate={isStageVisible('match') || isStageVisible('details') ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.7, ease: EASE }}
                className="product-match-visual__score"
                onMouseEnter={() => setHoveredSkill('score')}
                onMouseLeave={() => setHoveredSkill(null)}
              >
                <div className="product-match-visual__score-ring">
                  <svg viewBox="0 0 120 120" className="product-match-visual__score-svg">
                     <circle cx="60" cy="60" r={scoreRadius} fill="none" stroke="var(--visual-border)" strokeWidth="6" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r={scoreRadius}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      initial={reduceMotion ? false : { strokeDashoffset: scoreCircumference }}
                      animate={isStageVisible('match') || isStageVisible('details') ? { strokeDashoffset: scoreCircumference - (matchScore / 100) * scoreCircumference } : { strokeDashoffset: scoreCircumference }}
                      transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
                    />
                  </svg>
                  <div className="product-match-visual__score-text">
                    <AnimatedCounter to={matchScore} duration={1200} delay={400} />
                    <span className="product-match-visual__score-percent">%</span>
                  </div>
                </div>
                <div className="product-match-visual__score-label">Match Score</div>
                {hoveredSkill === 'score' && isStageVisible('details') && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="product-match-visual__score-tooltip"
                  >
                    Strong overall compatibility
                  </motion.div>
                )}
              </motion.div>

              {/* Skills */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={isStageVisible('details') ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
                className="product-match-visual__skills"
              >
                <div className="product-match-visual__skills-header">
                  <span className="product-match-visual__skills-label">Skill Analysis</span>
                </div>
                <div className="product-match-visual__skills-list">
                  {skills.map((skill, i) => {
                    const isHovered = hoveredSkill === skill.label;
                    return (
                      <motion.div
                        key={skill.label}
                        initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                        animate={isStageVisible('details') ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                        transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.08 }}
                        className={`product-match-visual__skill ${skill.matched ? 'product-match-visual__skill--matched' : 'product-match-visual__skill--missing'}`}
                        onMouseEnter={() => setHoveredSkill(skill.label)}
                        onMouseLeave={() => setHoveredSkill(null)}
                      >
                        <span className="product-match-visual__skill-icon">
                          {skill.matched ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          )}
                        </span>
                        <span className="product-match-visual__skill-label">{skill.label}</span>
                        <motion.div
                          className="product-match-visual__skill-bar"
                          initial={reduceMotion ? false : { width: 0 }}
                          animate={isHovered && isStageVisible('details') ? { width: `${skill.score ?? 0}%` } : { width: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                        />
                        {isHovered && isStageVisible('details') && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="product-match-visual__skill-score"
                          >
                            {skill.score ?? 0}%
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* AI Insight */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={isStageVisible('details') ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
                className="product-match-visual__footer"
              >
                <button
                  type="button"
                  className="product-match-visual__link"
                  onClick={() => setExpandedInsight(!expandedInsight)}
                >
                  {expandedInsight ? 'Hide' : 'Why this match?'}
                  <motion.svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    animate={{ rotate: expandedInsight ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </motion.svg>
                </button>
                {expandedInsight && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="product-match-visual__insight"
                  >
                    <p className="product-match-visual__insight-text">
                      Strong alignment because your profile shows deep experience with React and TypeScript, 
                      plus solid database skills. Adding Docker experience would strengthen your candidacy for 
                      full-stack roles.
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .product-match-visual {
          position: relative;
          width: 100%;
          max-width: 720px;
        }

        .product-match-visual__window {
          position: relative;
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--visual-shadow);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }

        .product-match-visual__header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--visual-border);
          background: var(--visual-surface-muted);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }

        .product-match-visual__title-bar {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .product-match-visual__dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
          opacity: 0.8;
        }

        .product-match-visual__dot--red { background: #f87171; }
        .product-match-visual__dot--yellow { background: #fbbf24; }
        .product-match-visual__dot--green { background: #4ade80; }

        .product-match-visual__header-text {
          flex: 1;
          min-width: 0;
        }

        .product-match-visual__label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .product-match-visual__status {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 10px;
          font-weight: 600;
          color: var(--color-success);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .product-match-visual__status-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--color-success);
          animation: status-pulse 2s ease-in-out infinite;
        }

        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .product-match-visual__body {
          padding: var(--space-5);
        }

        .product-match-visual__layout {
          display: flex;
          gap: var(--space-4);
        }

        .product-match-visual__sidebar {
          width: 140px;
          flex-shrink: 0;
          display: none;
        }

        .product-match-visual__sidebar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          margin-bottom: var(--space-4);
        }

        .product-match-visual__sidebar-logo {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-md);
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-sm);
          font-weight: 700;
        }

        .product-match-visual__sidebar-name {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }

        .product-match-visual__sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .product-match-visual__sidebar-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--visual-text-secondary);
          font-size: var(--text-xs);
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: background-color 150ms ease, color 150ms ease;
        }

        .product-match-visual__sidebar-item:hover,
        .product-match-visual__sidebar-item--active {
          background: var(--visual-surface-muted);
          color: var(--visual-text);
        }

        .product-match-visual__sidebar-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .product-match-visual__content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .product-match-visual__status-bar {
          min-height: 24px;
        }

        .product-match-visual__status-text {
          font-size: var(--text-sm);
          color: var(--visual-text-secondary);
          display: inline-flex;
          align-items: center;
        }

        .product-match-visual__status-text--success {
          color: var(--color-success);
          font-weight: 500;
        }

        .product-match-visual__role {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .product-match-visual__role-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .product-match-visual__role-title {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-text);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .product-match-visual__score {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          position: relative;
        }

        .product-match-visual__score-ring {
          position: relative;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .product-match-visual__score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .product-match-visual__score-circle {
          stroke-dasharray: ${scoreCircumference};
          stroke-dashoffset: ${scoreCircumference};
          transition: stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
        }

        .product-match-visual--visible .product-match-visual__score-circle {
          stroke-dashoffset: ${scoreCircumference - (matchScore / 100) * scoreCircumference};
        }

        .product-match-visual__score-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--visual-text);
          gap: 1px;
        }

        .product-match-visual__score-percent {
          font-size: var(--text-sm);
          color: var(--visual-text-secondary);
          margin-top: 2px;
        }

        .product-match-visual__score-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .product-match-visual__score-tooltip {
          position: absolute;
          bottom: -28px;
          left: 0;
          background: var(--visual-text);
          color: var(--visual-surface);
          padding: 4px 10px;
          border-radius: var(--radius-md);
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
          pointer-events: none;
          z-index: 2;
        }

        .product-match-visual__skills {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .product-match-visual__skills-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .product-match-visual__skills-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .product-match-visual__skills-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .product-match-visual__skill {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 500;
          cursor: default;
          position: relative;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), color var(--transition-theme);
        }

        .product-match-visual__skill--matched {
          background: var(--color-primary-soft);
          color: var(--color-primary);
          border: 1px solid transparent;
        }

        .product-match-visual__skill--missing {
          background: var(--visual-surface-muted);
          color: var(--visual-text-secondary);
          border: 1px solid var(--visual-border);
        }

        .product-match-visual__skill:hover {
          background: var(--visual-surface-muted);
        }

        .product-match-visual__skill-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .product-match-visual__skill-label {
          flex: 1;
          min-width: 0;
        }

        .product-match-visual__skill-bar {
          position: absolute;
          bottom: 0;
          left: var(--space-3);
          right: var(--space-3);
          height: 3px;
          background: var(--color-primary);
          border-radius: var(--radius-full);
          opacity: 0.3;
          transform-origin: left;
        }

        .product-match-visual__skill-score {
          font-size: 11px;
          font-weight: 600;
          color: var(--visual-text-secondary);
          margin-left: auto;
        }

        .product-match-visual__footer {
          padding-top: var(--space-3);
          border-top: 1px solid var(--visual-border);
          transition: border-color var(--transition-theme);
        }

        .product-match-visual__link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-primary);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: color var(--transition-fast), gap var(--transition-fast);
        }

        .product-match-visual__link:hover {
          gap: var(--space-3);
        }

        .product-match-visual__insight {
          margin-top: var(--space-3);
          padding: var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }

        .product-match-visual__insight-text {
          font-size: var(--text-sm);
          color: var(--visual-text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        @media (min-width: 640px) {
          .product-match-visual__sidebar {
            display: block;
          }
        }

        @media (max-width: 640px) {
          .product-match-visual {
            max-width: 100%;
          }

          .product-match-visual__window {
            border-radius: var(--radius-lg);
          }

          .product-match-visual__body {
            padding: var(--space-4);
            gap: var(--space-4);
          }

          .product-match-visual__layout {
            flex-direction: column;
          }

          .product-match-visual__sidebar {
            display: none;
          }

          .product-match-visual__role-title {
            font-size: var(--text-base);
          }

          .product-match-visual__score-ring {
            width: 64px;
            height: 64px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-match-visual__status-dot {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
