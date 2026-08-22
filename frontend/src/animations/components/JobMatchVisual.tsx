import { ScrollReveal, StaggerContainer, StaggerChild, AnimatedCounter, FloatingParticles } from '../../animations';
import { MOTION } from '../../animations/motion-tokens';

export interface MatchData {
  skill: string;
  matched: boolean;
  importance: 'high' | 'medium' | 'low';
}

export interface JobMatchVisualProps {
  matchScore: number;
  candidateSkills: MatchData[];
  jobRequirements: MatchData[];
  title?: string;
  company?: string;
}

export const JobMatchVisual = ({
  matchScore,
  candidateSkills,
  jobRequirements,
  title = 'Junior AI Developer',
  company = 'TechCorp',
}: JobMatchVisualProps) => {
  const matchedCount = candidateSkills.filter((s) => s.matched).length;
  const scoreRadius = 54;
  const scoreCircumference = 2 * Math.PI * scoreRadius;

  return (
    <ScrollReveal
      options={{
        threshold: 0.2,
        once: true,
        duration: MOTION.duration.slowest,
        distance: MOTION.distance.lg,
        blur: MOTION.blur.md,
        direction: 'up',
      }}
      className="job-match-visual"
    >
      <div className="job-match-visual__inner">
        <FloatingParticles count={12} color="var(--color-primary)" minRadius={1} maxRadius={2.5} speed={0.2} />

        <div className="job-match-visual__header">
          <div className="job-match-visual__score-ring">
            <svg viewBox="0 0 120 120" className="job-match-visual__score-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-border)" strokeWidth="6" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="6"
                strokeDasharray={`${matchScore * scoreCircumference / 100} ${scoreCircumference}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className="job-match-visual__score-circle"
              />
            </svg>
            <div className="job-match-visual__score-text">
              <AnimatedCounter to={matchScore} duration={1500} delay={300} />
              <span className="job-match-visual__score-percent">%</span>
            </div>
          </div>
          <div className="job-match-visual__job-info">
            <h4 className="job-match-visual__title">{title}</h4>
            <p className="job-match-visual__company">{company}</p>
          </div>
        </div>

        <div className="job-match-visual__skills">
          <div className="job-match-visual__skill-group">
            <h5 className="job-match-visual__skill-label">Your Skills</h5>
            <StaggerContainer options={{ stagger: MOTION.stagger.xs, once: true }} className="job-match-visual__skill-list">
              {candidateSkills.map((skill) => (
                <StaggerChild key={skill.skill}>
                  <span
                    className={`job-match-visual__chip ${skill.matched ? 'job-match-visual__chip--matched' : ''}`}
                    data-importance={skill.importance}
                  >
                    {skill.matched && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {skill.skill}
                  </span>
                </StaggerChild>
              ))}
            </StaggerContainer>
          </div>

          <div className="job-match-visual__connector" aria-hidden="true">
            <div className="job-match-visual__connector-line" />
            <div className="job-match-visual__connector-dots">
              {Array.from({ length: Math.min(matchedCount, 5) }).map((_, i) => (
                <span key={i} className="job-match-visual__connector-dot" style={{ animationDelay: `${300 + i * 100}ms` }} />
              ))}
            </div>
          </div>

          <div className="job-match-visual__skill-group">
            <h5 className="job-match-visual__skill-label">Role Requirements</h5>
            <StaggerContainer options={{ stagger: MOTION.stagger.xs, once: true }} className="job-match-visual__skill-list">
              {jobRequirements.map((req) => (
                <StaggerChild key={req.skill}>
                  <span
                    className={`job-match-visual__chip job-match-visual__chip--requirement ${req.matched ? 'job-match-visual__chip--matched' : ''}`}
                    data-importance={req.importance}
                  >
                    {req.matched && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {req.skill}
                  </span>
                </StaggerChild>
              ))}
            </StaggerContainer>
          </div>
        </div>

        <style>{`
          .job-match-visual {
            position: relative;
            width: 100%;
          }

          .job-match-visual__inner {
            position: relative;
            background: var(--color-surface-muted, #fefcf8);
            border: 1px solid var(--color-border, #e8e2d8);
            border-radius: var(--radius-xl, 1rem);
            padding: var(--space-6, 1.5rem);
            overflow: hidden;
            transition: background-color var(--transition-theme), border-color var(--transition-theme);
          }

          .job-match-visual__inner::before {
            content: '';
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(79, 70, 229, 0.04) 0%, transparent 60%);
            pointer-events: none;
          }

          .job-match-visual__header {
            display: flex;
            align-items: center;
            gap: var(--space-4, 1rem);
            margin-bottom: var(--space-6, 1.5rem);
          }

          .job-match-visual__score-ring {
            position: relative;
            width: 80px;
            height: 80px;
            flex-shrink: 0;
          }

          .job-match-visual__score-svg {
            width: 100%;
            height: 100%;
            transform: rotate(-90deg);
          }

          .job-match-visual__score-circle {
            stroke-dasharray: ${scoreCircumference};
            stroke-dashoffset: ${scoreCircumference};
            transition: stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
          }

          .scroll-reveal--visible .job-match-visual__score-circle {
            stroke-dashoffset: ${scoreCircumference - (matchScore / 100) * scoreCircumference};
          }

          .job-match-visual__score-text {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: var(--text-xl, 1.25rem);
            font-weight: 700;
            color: var(--color-text);
            gap: 1px;
          }

          .job-match-visual__score-percent {
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-text-secondary);
            margin-top: 2px;
          }

          .job-match-visual__job-info {
            flex: 1;
            min-width: 0;
          }

          .job-match-visual__title {
            margin: 0 0 var(--space-1, 0.25rem) 0;
            font-size: var(--text-lg, 1.125rem);
            font-weight: 600;
            color: var(--color-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .job-match-visual__company {
            margin: 0;
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-text-secondary);
          }

          .job-match-visual__skills {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: var(--space-4, 1rem);
            align-items: start;
          }

          .job-match-visual__skill-group {
            display: flex;
            flex-direction: column;
            gap: var(--space-2, 0.5rem);
          }

          .job-match-visual__skill-label {
            margin: 0 0 var(--space-2, 0.5rem) 0;
            font-size: var(--text-xs, 0.75rem);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-text-secondary);
          }

          .job-match-visual__skill-list {
            display: flex;
            flex-direction: column;
            gap: var(--space-2, 0.5rem);
          }

          .job-match-visual__chip {
            display: inline-flex;
            align-items: center;
            gap: var(--space-2, 0.5rem);
            padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
            border-radius: var(--radius-full, 9999px);
            font-size: var(--text-sm, 0.875rem);
            font-weight: 500;
            background: var(--color-surface, #ffffff);
            border: 1px solid var(--color-border, #e8e2d8);
            color: var(--color-text-secondary);
            transition: all var(--transition-fast);
            opacity: 0;
            transform: translateY(8px) scale(0.95);
          }

          .scroll-reveal--visible .job-match-visual__chip {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

          .job-match-visual__chip--matched {
            background: var(--color-primary-soft, #eef2ff);
            border-color: var(--color-primary, #4f46e5);
            color: var(--color-primary);
          }

          .job-match-visual__chip--requirement {
            background: var(--color-surface, #ffffff);
          }

          .job-match-visual__chip svg {
            flex-shrink: 0;
          }

          .job-match-visual__connector {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--space-2, 0.5rem);
            padding-top: var(--space-8, 2rem);
          }

          .job-match-visual__connector-line {
            width: 2px;
            height: 40px;
            background: linear-gradient(to bottom, var(--color-primary), var(--color-success));
            border-radius: var(--radius-full, 9999px);
            opacity: 0.5;
          }

          .job-match-visual__connector-dots {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .job-match-visual__connector-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: var(--color-success);
            opacity: 0;
            animation: dot-appear 0.4s ease forwards;
          }

          @keyframes dot-appear {
            from { opacity: 0; transform: scale(0); }
            to { opacity: 1; transform: scale(1); }
          }

          @media (max-width: 640px) {
            .job-match-visual__skills {
              grid-template-columns: 1fr;
            }
            .job-match-visual__connector {
              flex-direction: row;
              padding-top: 0;
              padding-left: var(--space-4, 1rem);
            }
            .job-match-visual__connector-line {
              width: 40px;
              height: 2px;
              background: linear-gradient(to right, var(--color-primary), var(--color-success));
            }
            .job-match-visual__connector-dots {
              flex-direction: row;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .job-match-visual__chip,
            .job-match-visual__score-circle {
              transition-duration: 0.01ms !important;
              transition-delay: 0ms !important;
            }
            .job-match-visual__chip {
              opacity: 1 !important;
              transform: none !important;
            }
            .job-match-visual__connector-dot {
              animation: none !important;
              opacity: 1 !important;
            }
          }
        `}</style>
      </div>
    </ScrollReveal>
  );
};
