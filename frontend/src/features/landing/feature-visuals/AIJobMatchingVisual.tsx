import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { PhosphorIcon } from '../../../components/PhosphorIcon';

const EASE = [0.22, 1, 0.36, 1] as const;

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  delay: i * 0.3,
  x: (Math.random() - 0.5) * 2,
  y: (Math.random() - 0.5) * 2,
  size: Math.random() * 4 + 2,
  repeatDelay: Math.random() * 2 + 1,
}));

interface SkillItem {
  name: string;
  matched: boolean;
}

interface StatItem {
  label: string;
  value: string;
  suffix?: string;
}

interface RequirementItem {
  text: string;
  matched: boolean;
}

const FloatingParticle = ({ delay, x, y, size, repeatDelay }: { delay: number; x: number; y: number; size: number; repeatDelay: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 0, y: 0 }}
    animate={{ opacity: [0, 1, 0], x: x * 20, y: y * 15 }}
    transition={{ duration: 2, delay, repeat: Infinity, repeatDelay }}
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--visual-accent)',
      pointerEvents: 'none',
      left: `${50 + x * 30}%`,
      top: `${50 + y * 30}%`,
    }}
  />
);

const FloatingOrb = ({ delay, x, y, size, color }: { delay: number; x: number; y: number; size: number; color: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
    transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      filter: 'blur(30px)',
      pointerEvents: 'none',
      left: `${x}%`,
      top: `${y}%`,
    }}
  />
);

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
    { name: 'CSS/SCSS', matched: true },
    { name: 'Git', matched: true },
  ];

  const potentialSkills: SkillItem[] = [
    { name: 'Docker', matched: false },
    { name: 'Testing', matched: false },
    { name: 'GraphQL', matched: false },
  ];

  const candidateStats: StatItem[] = [
    { label: 'Experience', value: '5', suffix: 'yrs' },
    { label: 'Education', value: 'MS', suffix: '' },
    { label: 'Projects', value: '12', suffix: '+' },
  ];

  const jobRequirements: RequirementItem[] = [
    { text: '5+ years frontend experience', matched: true },
    { text: 'React/TypeScript proficiency', matched: true },
    { text: 'Remote work availability', matched: true },
    { text: 'CI/CD experience', matched: false },
  ];

  const jobBenefits: string[] = [
    'Health Insurance',
    '401k Match',
    'Unlimited PTO',
    'Learning Budget',
  ];

  return (
    <div ref={ref} className="feature-visual feature-visual--matching">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        {/* Floating background orbs */}
        <div className="feature-visual__orbs">
          <FloatingOrb delay={0} x={10} y={20} size={120} color="var(--visual-accent)" />
          <FloatingOrb delay={1} x={80} y={60} size={100} color="var(--visual-success)" />
          <FloatingOrb delay={2} x={50} y={80} size={80} color="var(--visual-accent-soft)" />
        </div>

        {/* Window chrome */}
        <div className="feature-visual__bar">
          <div className="feature-visual__dots">
            <span className="feature-visual__dot feature-visual__dot--red" />
            <span className="feature-visual__dot feature-visual__dot--yellow" />
            <span className="feature-visual__dot feature-visual__dot--green" />
          </div>
          <span className="feature-visual__bar-title">AI Job Matching</span>
          <span className="visual-badge visual-badge--success">Match found</span>
        </div>

        <div className="feature-visual__body">
          {/* Left: Candidate Profile */}
          <motion.div
            className="feature-visual__panel feature-visual__panel--candidate"
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}
          >
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

            {/* Candidate Stats */}
            <div className="feature-visual__stats">
              {candidateStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="feature-visual__stat"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, ease: EASE, delay: 0.35 + i * 0.08 }}
                >
                  <span className="feature-visual__stat-value">{stat.value}{stat.suffix}</span>
                  <span className="feature-visual__stat-label">{stat.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="feature-visual__skills-section">
              <span className="feature-visual__skills-label">Skills</span>
              <div className="feature-visual__candidate-skills">
                {matchedSkills.map((skill, i) => (
                  <motion.span
                    key={skill.name}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: EASE, delay: 0.4 + i * 0.05 }}
                     className="visual-badge visual-badge--success"
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Center: Match Analysis */}
          <motion.div
            className="feature-visual__panel feature-visual__panel--analysis"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          >
            <div className="feature-visual__match-container">
              {/* Floating particles */}
              <div className="feature-visual__particles">
                {PARTICLES.map((p) => (
                  <FloatingParticle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} repeatDelay={p.repeatDelay} />
                ))}
              </div>
              
              <div className="feature-visual__match-score">
                <motion.div
                  className="feature-visual__shimmer"
                  animate={inView ? { opacity: [0.3, 0.6, 0.3] } : { opacity: 0.3 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
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
                    animate={inView ? { strokeDashoffset: 2 * Math.PI * 54 - (95 / 100) * 2 * Math.PI * 54 } : { strokeDashoffset: 2 * Math.PI * 54 }}
                    transition={{ duration: 1.5, ease: EASE, delay: 0.3 }}
                  />
                </svg>
                <div className="feature-visual__match-content">
                  <span className="feature-visual__match-number">95%</span>
                  <span className="feature-visual__match-label">Match</span>
                </div>
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
                <span className="feature-visual__match-why-arrow"><PhosphorIcon name={showExplanation ? 'CaretUp' : 'CaretDown'} size={12} weight="bold" /></span>
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

            {/* Quick Actions */}
            <motion.div
              className="feature-visual__actions"
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 1.2 }}
            >
              <button type="button" className="feature-visual__action feature-visual__action--primary">
                Apply
              </button>
              <button type="button" className="feature-visual__action feature-visual__action--secondary">
                Save
              </button>
              <button type="button" className="feature-visual__action feature-visual__action--secondary">
                Share
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Job Opportunity */}
          <motion.div
            className="feature-visual__panel feature-visual__panel--job"
            initial={reduceMotion ? false : { opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
          >
            <div className="feature-visual__panel-header">
              <span className="feature-visual__panel-label">Opportunity</span>
              <span className="visual-badge visual-badge--success">New</span>
            </div>
            <div className="feature-visual__job">
              <div className="feature-visual__job-title">Senior Frontend Developer</div>
              <div className="feature-visual__job-company">TechCorp Inc.</div>
              <div className="feature-visual__job-meta">
                <span className="visual-badge visual-badge--accent">Remote</span>
                <span className="visual-badge visual-badge--accent">Full-time</span>
              </div>
              <div className="feature-visual__job-salary">$140K – $180K</div>
            </div>

            {/* Location & Benefits */}
            <div className="feature-visual__job-location">
              <svg className="feature-visual__location-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>San Francisco, CA (Remote OK)</span>
            </div>

            <div className="feature-visual__job-benefits">
              <span className="feature-visual__benefits-label">Benefits</span>
              <div className="feature-visual__benefits-list">
                {jobBenefits.map((benefit, i) => (
                  <motion.span
                    key={benefit}
                    initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                    transition={{ duration: 0.3, ease: EASE, delay: 0.6 + i * 0.06 }}
                    className="feature-visual__benefit-tag"
                  >
                    {benefit}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="feature-visual__requirements">
              <span className="feature-visual__requirements-label">Requirements</span>
              <div className="feature-visual__requirements-list">
                {jobRequirements.map((req, i) => (
                  <motion.div
                    key={req.text}
                    className="feature-visual__requirement"
                    initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                    transition={{ duration: 0.3, ease: EASE, delay: 0.7 + i * 0.08 }}
                  >
                    <span className={`feature-visual__requirement-dot feature-visual__requirement-dot--${req.matched ? 'matched' : 'gap'}`} />
                    <span className="feature-visual__requirement-text">{req.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="feature-visual__job-skills">
              <span className="feature-visual__job-skill-label">Potential gaps:</span>
              <div className="feature-visual__job-skill-list">
                {potentialSkills.map((skill, i) => (
                  <motion.span
                    key={skill.name}
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease: EASE, delay: 0.9 + i * 0.05 }}
                     className="visual-badge visual-badge--accent"
                  >
                    {skill.name}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--matching {
          width: 100%;
          max-width: 900px;
        }
        @media (max-width: 767px) {
          .feature-visual--matching {
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
        .feature-visual--matching .feature-visual__card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--visual-accent-soft) 0%, transparent 50%, var(--visual-success-soft) 100%);
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
          transition: opacity var(--transition-theme);
        }
        .feature-visual__orbs {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .feature-visual__bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
          position: relative;
          z-index: 1;
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

        .feature-visual__body {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: auto 1fr auto;
          gap: var(--space-3);
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
          }
        }
        @media (min-width: 1024px) {
          .feature-visual__body {
            grid-template-columns: 1.6fr 1fr 1.6fr;
            grid-template-rows: 1fr;
          }
        }
        .feature-visual__panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          min-height: 0;
          overflow-y: auto;
          flex: 1;
        }
        .feature-visual__panel--analysis {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 0;
          overflow-y: auto;
        }
        .feature-visual__panel--candidate {
          flex: 1;
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
          transition: transform 200ms ease;
        }
        .feature-visual__candidate-avatar:hover {
          transform: scale(1.05);
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
        .feature-visual__stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-2);
          padding: var(--space-2) 0;
        }
        .feature-visual__stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-2) var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme), transform 200ms ease;
        }
        .feature-visual__stat:first-child {
          grid-column: 1 / -1;
        }
        .feature-visual__stat:hover {
          transform: translateY(-2px);
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
        }
        .feature-visual__stat-value {
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--visual-accent);
        }
        .feature-visual__stat-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .feature-visual__skills-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__skills-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__candidate-skills {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
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
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .visual-badge:hover {
          transform: scale(1.08);
          box-shadow: var(--visual-shadow);
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
        .feature-visual__match-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feature-visual__particles {
          position: absolute;
          inset: -40px;
          pointer-events: none;
        }
        .feature-visual__match-score {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }
        .feature-visual__shimmer {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          background: radial-gradient(circle, var(--visual-accent) 0%, transparent 70%);
          pointer-events: none;
        }
        .feature-visual__match-svg {
          width: 100%;
          height: 100%;
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
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: background-color 150ms ease, transform 150ms ease;
        }
        .feature-visual__match-why:hover {
          background: var(--visual-accent-soft);
          transform: scale(1.02);
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
        .feature-visual__actions {
          display: flex;
          gap: var(--space-2);
          margin-top: var(--space-3);
          flex-wrap: wrap;
        }
        .feature-visual__action {
          font-size: var(--text-sm);
          font-weight: 600;
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
          text-align: center;
          transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
        }
        .feature-visual__action:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .feature-visual__action:active {
          transform: translateY(0);
        }
        .feature-visual__action--primary {
          background: var(--visual-accent);
          color: var(--visual-surface);
        }
        .feature-visual__action--primary:hover {
          background: var(--visual-accent-hover, var(--visual-accent));
        }
        .feature-visual__action--secondary {
          background: var(--visual-surface-muted);
          color: var(--visual-text);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__action--secondary:hover {
          background: var(--visual-border);
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

        .feature-visual__job-salary {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
          margin-top: var(--space-2);
        }
        .feature-visual__job-location {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
        }
        .feature-visual__location-icon {
          width: 16px;
          height: 16px;
          color: var(--visual-accent);
        }
        .feature-visual__job-benefits {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__benefits-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__benefits-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .feature-visual__benefit-tag {
          font-size: 10px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
          border: 1px solid var(--visual-border);
          transition: transform 150ms ease, background-color 150ms ease;
        }
        .feature-visual__benefit-tag:hover {
          transform: scale(1.05);
          background: var(--visual-success-soft);
          color: var(--visual-success);
          border-color: var(--visual-success);
        }
        .feature-visual__requirements {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__requirements-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__requirements-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .feature-visual__requirement {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) 0;
        }
        .feature-visual__requirement-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .feature-visual__requirement-dot--matched {
          background: var(--visual-success);
        }
        .feature-visual__requirement-dot--gap {
          background: var(--visual-warning);
        }
        .feature-visual__requirement-text {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
        }
        .feature-visual__job-skills {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: auto;
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
          .feature-visual__stats {
            gap: var(--space-2);
          }
          .feature-visual__stat {
            padding: var(--space-1) var(--space-2);
          }
          .feature-visual__stat:first-child {
            grid-column: 1 / -1;
          }
          .feature-visual__stat-value {
            font-size: var(--text-base);
          }
          .feature-visual__actions {
            flex-wrap: wrap;
            justify-content: center;
          }
          .feature-visual__action {
            padding: var(--space-1) var(--space-3);
            font-size: var(--text-xs);
          }
        }

        @media (max-width: 375px) {
          .feature-visual__body {
            padding: var(--space-3);
            min-height: 300px;
          }
          .feature-visual__stats {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-2);
          }
          .feature-visual__stat {
            padding: var(--space-2);
          }
          .feature-visual__stat:first-child {
            grid-column: 1 / -1;
          }
          .feature-visual__benefits-list {
            gap: var(--space-1);
          }
          .feature-visual__benefit-tag {
            font-size: 9px;
            padding: 2px 6px;
          }
          .feature-visual__actions {
            flex-direction: column;
            width: 100%;
          }
          .feature-visual__action {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export { AIJobMatchingVisual };
