import { ScrollReveal, StaggerContainer, StaggerChild } from '../../animations';
import { MOTION } from '../../animations/motion-tokens';

export interface ExtractionStep {
  label: string;
}

export interface ResumeScanVisualProps {
  steps?: ExtractionStep[];
}

export const ResumeScanVisual = ({
  steps = [
    { label: 'Scanning document' },
    { label: 'Extracting skills' },
    { label: 'Identifying experience' },
    { label: 'Building profile' },
  ],
}: ResumeScanVisualProps) => {
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
      className="resume-scan-visual"
    >
      <div className="resume-scan-visual__inner">
        <div className="resume-scan-visual__document">
          <div className="resume-scan-visual__doc-header">
            <div className="resume-scan-visual__doc-dots">
              <span /><span /><span />
            </div>
            <div className="resume-scan-visual__doc-title">resume.pdf</div>
          </div>
          <div className="resume-scan-visual__doc-body">
            <div className="resume-scan-visual__doc-line resume-scan-visual__doc-line--title" />
            <div className="resume-scan-visual__doc-line resume-scan-visual__doc-line--subtitle" />
            <div className="resume-scan-visual__doc-line resume-scan-visual__doc-line--short" />
            <div className="resume-scan-visual__doc-line resume-scan-visual__doc-line--medium" />
            <div className="resume-scan-visual__doc-line resume-scan-visual__doc-line--short" />
            <div className="resume-scan-visual__doc-line resume-scan-visual__doc-line--long" />
          </div>
          <div className="resume-scan-visual__scan-line" />
        </div>

        <div className="resume-scan-visual__arrow" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>

        <div className="resume-scan-visual__extraction">
          <StaggerContainer options={{ stagger: MOTION.stagger.sm, once: true }} className="resume-scan-visual__steps">
            {steps.map((step) => (
              <StaggerChild key={step.label}>
                <div className="resume-scan-visual__step">
                  <div className="resume-scan-visual__step-indicator">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="resume-scan-visual__step-label">{step.label}</span>
                </div>
              </StaggerChild>
            ))}
          </StaggerContainer>

          <div className="resume-scan-visual__profile-card">
            <div className="resume-scan-visual__profile-avatar">
              <div className="resume-scan-visual__profile-initials">JD</div>
            </div>
            <div className="resume-scan-visual__profile-info">
              <div className="resume-scan-visual__profile-name">Jane Doe</div>
              <div className="resume-scan-visual__profile-role">Software Engineer</div>
            </div>
            <div className="resume-scan-visual__profile-skills">
              {['React', 'Python', 'SQL'].map((skill) => (
                <span key={skill} className="resume-scan-visual__profile-skill">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          .resume-scan-visual {
            position: relative;
            width: 100%;
          }

          .resume-scan-visual__inner {
            position: relative;
            display: flex;
            align-items: center;
            gap: var(--space-4, 1rem);
            padding: var(--space-6, 1.5rem);
            background: var(--color-surface-muted, #fefcf8);
            border: 1px solid var(--color-border, #e8e2d8);
            border-radius: var(--radius-xl, 1rem);
            transition: background-color var(--transition-theme), border-color var(--transition-theme);
          }

          .resume-scan-visual__document {
            position: relative;
            width: 140px;
            height: 180px;
            background: var(--color-surface, #ffffff);
            border: 1px solid var(--color-border, #e8e2d8);
            border-radius: var(--radius-lg, 0.75rem);
            overflow: hidden;
            flex-shrink: 0;
            transition: background-color var(--transition-theme), border-color var(--transition-theme);
          }

          .resume-scan-visual__doc-header {
            display: flex;
            align-items: center;
            gap: var(--space-2, 0.5rem);
            padding: var(--space-3, 0.75rem) var(--space-3, 0.75rem) var(--space-2, 0.5rem);
            border-bottom: 1px solid var(--color-border, #e8e2d8);
          }

          .resume-scan-visual__doc-dots {
            display: flex;
            gap: 4px;
          }

          .resume-scan-visual__doc-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--color-border, #e8e2d8);
          }

          .resume-scan-visual__doc-title {
            font-size: var(--text-xs, 0.75rem);
            font-weight: 600;
            color: var(--color-text-secondary);
          }

          .resume-scan-visual__doc-body {
            padding: var(--space-3, 0.75rem);
            display: flex;
            flex-direction: column;
            gap: var(--space-2, 0.5rem);
          }

          .resume-scan-visual__doc-line {
            height: 6px;
            border-radius: var(--radius-sm, 0.375rem);
            background: var(--color-border, #e8e2d8);
            opacity: 0.6;
          }

          .resume-scan-visual__doc-line--title { width: 70%; opacity: 0.9; }
          .resume-scan-visual__doc-line--subtitle { width: 50%; opacity: 0.7; }
          .resume-scan-visual__doc-line--short { width: 40%; }
          .resume-scan-visual__doc-line--medium { width: 60%; }
          .resume-scan-visual__doc-line--long { width: 80%; }

          .resume-scan-visual__scan-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(to bottom, transparent, var(--color-primary), transparent);
            opacity: 0.7;
            animation: scan-move 2.5s ease-in-out infinite;
            box-shadow: 0 0 8px var(--color-primary);
          }

          @keyframes scan-move {
            0%, 100% { top: 0; opacity: 0; }
            10% { opacity: 0.7; }
            90% { opacity: 0.7; }
            50% { top: 100%; }
          }

          .resume-scan-visual__arrow {
            flex-shrink: 0;
            animation: arrow-pulse 1.5s ease-in-out infinite;
          }

          @keyframes arrow-pulse {
            0%, 100% { opacity: 0.5; transform: translateX(0); }
            50% { opacity: 1; transform: translateX(4px); }
          }

          .resume-scan-visual__extraction {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: var(--space-4, 1rem);
          }

          .resume-scan-visual__steps {
            display: flex;
            flex-direction: column;
            gap: var(--space-2, 0.5rem);
          }

          .resume-scan-visual__step {
            display: flex;
            align-items: center;
            gap: var(--space-2, 0.5rem);
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-text-secondary);
            opacity: 0;
            transform: translateX(-8px);
            transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease;
          }

          .scroll-reveal--visible .resume-scan-visual__step {
            opacity: 1;
            transform: translateX(0);
          }

          .resume-scan-visual__step-indicator {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--color-success-soft, #ecfdf5);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .resume-scan-visual__step-indicator svg {
            width: 10px;
            height: 10px;
          }

          .resume-scan-visual__profile-card {
            display: flex;
            align-items: center;
            gap: var(--space-3, 0.75rem);
            padding: var(--space-3, 0.75rem);
            background: var(--color-surface, #ffffff);
            border: 1px solid var(--color-primary, #4f46e5);
            border-radius: var(--radius-lg, 0.75rem);
            opacity: 0;
            transform: translateY(8px);
            transition: opacity 0.7s ease 0.8s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.8s, background-color var(--transition-theme), border-color var(--transition-theme);
          }

          .scroll-reveal--visible .resume-scan-visual__profile-card {
            opacity: 1;
            transform: translateY(0);
          }

          .resume-scan-visual__profile-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--color-primary-soft, #eef2ff);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .resume-scan-visual__profile-initials {
            font-size: var(--text-sm, 0.875rem);
            font-weight: 700;
            color: var(--color-primary);
          }

          .resume-scan-visual__profile-info {
            flex: 1;
            min-width: 0;
          }

          .resume-scan-visual__profile-name {
            font-size: var(--text-sm, 0.875rem);
            font-weight: 600;
            color: var(--color-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .resume-scan-visual__profile-role {
            font-size: var(--text-xs, 0.75rem);
            color: var(--color-text-secondary);
          }

          .resume-scan-visual__profile-skills {
            display: flex;
            gap: var(--space-1, 0.25rem);
            flex-wrap: wrap;
          }

          .resume-scan-visual__profile-skill {
            padding: 2px var(--space-2, 0.5rem);
            border-radius: var(--radius-full, 9999px);
            font-size: 10px;
            font-weight: 600;
            background: var(--color-primary-soft, #eef2ff);
            color: var(--color-primary);
            border: 1px solid var(--color-primary);
          }

          @media (max-width: 640px) {
            .resume-scan-visual__inner {
              flex-direction: column;
            }
            .resume-scan-visual__arrow {
              transform: rotate(90deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .resume-scan-visual__scan-line {
              animation: none !important;
              opacity: 0 !important;
            }
            .resume-scan-visual__step,
            .resume-scan-visual__profile-card {
              opacity: 1 !important;
              transform: none !important;
              transition-duration: 0.01ms !important;
              transition-delay: 0ms !important;
            }
          }
        `}</style>
      </div>
    </ScrollReveal>
  );
};
