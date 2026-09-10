import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Stage {
  label: string;
  date: string;
  status: 'done' | 'active' | 'pending';
  detail: string;
  expandedDetail?: string;
  timeElapsed?: string;
}

const ApplicationTrackingVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const [expandedStage, setExpandedStage] = useState<string | null>(null);

  const stages: Stage[] = [
    { label: 'Saved', date: 'Sep 28', status: 'done', detail: 'Bookmarked opportunity', expandedDetail: 'Found via LinkedIn job alert matching your preferences', timeElapsed: '0 days' },
    { label: 'Applied', date: 'Oct 02', status: 'done', detail: 'Resume & cover letter submitted', expandedDetail: 'Application reviewed by ATS. Custom cover letter highlighting React expertise was included.', timeElapsed: '4 days' },
    { label: 'Screening', date: 'Oct 05', status: 'done', detail: 'Phone screen with recruiter', expandedDetail: '30-min call. Discussed salary expectations, remote work policy, and team culture.', timeElapsed: '3 days' },
    { label: 'Assessment', date: 'Oct 08', status: 'done', detail: 'Technical coding challenge', expandedDetail: 'Completed take-home project (3 hours). Built a task management dashboard with React & TypeScript.', timeElapsed: '3 days' },
    { label: 'Interview', date: 'Oct 12', status: 'active', detail: 'Technical + culture fit rounds', expandedDetail: 'Round 2 of 3. Met with engineering manager and two senior developers. System design discussion.', timeElapsed: 'In progress' },
    { label: 'Offer', date: 'Pending', status: 'pending', detail: 'Awaiting decision', expandedDetail: 'Final round complete. HR reviewing compensation package.', timeElapsed: 'Est. 5-7 days' },
    { label: 'Hired', date: 'Pending', status: 'pending', detail: 'Onboarding phase', expandedDetail: 'Background check and paperwork processing.', timeElapsed: 'Est. 2 weeks' },
  ];

  const documents = [
    { name: 'Resume', status: 'Uploaded', type: 'pdf' },
    { name: 'Cover Letter', status: 'Uploaded', type: 'pdf' },
    { name: 'Portfolio', status: 'Uploaded', type: 'link' },
  ];

  const metrics = [
    { label: 'Days Active', value: '14' },
    { label: 'Profile Views', value: '47' },
    { label: 'Response Rate', value: '85%' },
  ];

  const progressPercentage = 57;

  return (
    <div ref={ref} className="feature-visual feature-visual--tracking">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        <div className="feature-visual__bar">
          <div className="feature-visual__dots">
            <span className="feature-visual__dot feature-visual__dot--red" />
            <span className="feature-visual__dot feature-visual__dot--yellow" />
            <span className="feature-visual__dot feature-visual__dot--green" />
          </div>
          <span className="feature-visual__bar-title">Application Tracker</span>
          <span className="feature-visual__bar-badge">TechCorp Inc.</span>
        </div>

        <div className="feature-visual__tracking-body">
          <div className="feature-visual__tracking-header">
            <div>
              <div className="feature-visual__tracking-role">Senior Frontend Developer</div>
              <div className="feature-visual__tracking-company">TechCorp Inc. · San Francisco, CA</div>
            </div>
            <div className="feature-visual__tracking-status">
              <span className="feature-visual__tracking-status-dot" />
              In progress
            </div>
          </div>

          <div className="feature-visual__tracking-referral">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Referred by Sarah Chen (Engineering Manager)</span>
          </div>

          <div className="feature-visual__tracking-metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className="feature-visual__tracking-metric">
                <span className="feature-visual__tracking-metric-value">{metric.value}</span>
                <span className="feature-visual__tracking-metric-label">{metric.label}</span>
              </div>
            ))}
          </div>

          <div className="feature-visual__tracking-stages">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                className={`feature-visual__tracking-stage ${stage.status}`}
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.08 }}
              >
                <div className="feature-visual__tracking-connector-vertical">
                  {i < stages.length - 1 && (
                    <div className={`feature-visual__tracking-connector-line ${stage.status === 'done' ? 'done' : ''}`}>
                      {stage.status === 'done' && !reduceMotion && (
                        <motion.div
                          className="feature-visual__tracking-particles"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + i * 0.08 }}
                        >
                          <span className="particle particle-1" />
                          <span className="particle particle-2" />
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className="feature-visual__tracking-stage-content"
                  onClick={() => setExpandedStage(expandedStage === stage.label ? null : stage.label)}
                >
                  <div className={`feature-visual__tracking-dot ${stage.status}`}>
                    {stage.status === 'done' && (
                      <motion.svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={reduceMotion ? false : { scale: 0, rotate: -45 }}
                        animate={inView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -45 }}
                        transition={{ duration: 0.3, ease: EASE, delay: 0.3 + i * 0.08 }}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </motion.svg>
                    )}
                    {stage.status === 'active' && <span className="feature-visual__tracking-active-ring" />}
                  </div>
                  <div className="feature-visual__tracking-info">
                    <div className="feature-visual__tracking-info-main">
                      <span className="feature-visual__tracking-label">{stage.label}</span>
                      <span className="feature-visual__tracking-date">{stage.date}</span>
                      {stage.timeElapsed && (
                        <span className="feature-visual__tracking-time">{stage.timeElapsed}</span>
                      )}
                    </div>
                    <span className="feature-visual__tracking-detail">{stage.detail}</span>
                    <motion.div
                      className="feature-visual__tracking-expanded"
                      initial={false}
                      animate={{ height: expandedStage === stage.label ? 'auto' : 0, opacity: expandedStage === stage.label ? 1 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="feature-visual__tracking-expanded-text">{stage.expandedDetail}</span>
                    </motion.div>
                  </div>
                  <svg className="feature-visual__tracking-expand-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points={expandedStage === stage.label ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="feature-visual__tracking-documents">
            <span className="feature-visual__tracking-documents-label">Documents</span>
            <div className="feature-visual__tracking-documents-list">
              {documents.map((doc) => (
                <div key={doc.name} className="feature-visual__tracking-document">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{doc.name}</span>
                  <span className="feature-visual__tracking-document-status">{doc.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="feature-visual__tracking-notes">
            <div className="feature-visual__tracking-notes-header">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>AI Insights</span>
            </div>
            <p className="feature-visual__tracking-notes-text">
              Strong alignment with technical requirements. 95% skill match. Consider emphasizing TypeScript experience in final interview.
            </p>
          </div>

          <div className="feature-visual__tracking-progress">
            <div className="feature-visual__tracking-progress-header">
              <span className="feature-visual__tracking-progress-label">Overall progress</span>
              <span className="feature-visual__tracking-progress-value">{progressPercentage}%</span>
            </div>
            <div className="feature-visual__tracking-progress-bar">
              <motion.div
                className="feature-visual__tracking-progress-fill"
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={inView ? { scaleX: progressPercentage / 100 } : { scaleX: 0 }}
                transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
                style={{ originX: 0 }}
              >
                <div className="feature-visual__tracking-progress-shimmer" />
              </motion.div>
            </div>
          </div>

          <div className="feature-visual__tracking-footer">
            <span className="feature-visual__tracking-footer-label">Next step</span>
            <span className="feature-visual__tracking-footer-value">Round 3: Team fit interview · Oct 16</span>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--tracking {
          width: 100%;
          max-width: 900px;
        }
        .feature-visual--tracking .feature-visual__card {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .feature-visual--tracking .feature-visual__bar {
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
        .feature-visual--tracking .feature-visual__dot--red { background: #f87171; }
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
        }
        .feature-visual__tracking-body {
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          background: linear-gradient(180deg, transparent 0%, rgba(var(--visual-accent-rgb, 99, 102, 241), 0.02) 100%);
        }
        .feature-visual__tracking-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-3);
        }
        .feature-visual__tracking-role {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__tracking-company {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          margin-top: 2px;
        }
        .feature-visual__tracking-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-success);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__tracking-status-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: tracking-status-pulse 2s ease-in-out infinite;
        }
        @keyframes tracking-status-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        .feature-visual__tracking-referral {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--visual-surface-elevated);
          border-radius: var(--radius-md);
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .feature-visual__tracking-referral svg {
          color: var(--visual-accent);
          flex-shrink: 0;
        }
        .feature-visual__tracking-metrics {
          display: flex;
          gap: var(--space-2);
        }
        .feature-visual__tracking-metric {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-2);
          background: var(--visual-surface-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__tracking-metric-value {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__tracking-metric-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .feature-visual__tracking-stages {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          position: relative;
          min-height: 0;
          max-height: 420px;
          overflow-y: auto;
          padding-right: var(--space-1);
        }
        .feature-visual__tracking-stage {
          display: flex;
          gap: var(--space-2);
          position: relative;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          transition: background-color 150ms ease;
        }
        .feature-visual__tracking-connector-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
          flex-shrink: 0;
        }
        .feature-visual__tracking-connector-line {
          width: 2px;
          flex: 1;
          background: var(--visual-border);
          margin-top: 8px;
          position: relative;
          overflow: visible;
          transition: background-color var(--transition-theme);
        }
        .feature-visual__tracking-connector-line.done {
          background: var(--visual-success);
        }
        .feature-visual__tracking-particles {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 100%;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: float-particle 3s ease-in-out infinite;
        }
        .particle-1 {
          left: 25%;
          animation-delay: 0s;
        }
        .particle-2 {
          right: 25%;
          animation-delay: 1.5s;
        }
        @keyframes float-particle {
          0%, 100% {
            top: 0;
            opacity: 0.3;
          }
          50% {
            top: calc(100% - 4px);
            opacity: 0.8;
          }
        }
        .feature-visual__tracking-stage-content {
          display: flex;
          gap: var(--space-2);
          flex: 1;
          min-width: 0;
          padding: var(--space-1) 0;
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: background-color 150ms ease;
        }
        .feature-visual__tracking-stage-content:hover {
          background: var(--visual-surface-elevated);
        }
        .feature-visual__tracking-dot {
          width: 22px;
          height: 22px;
          border-radius: var(--radius-full);
          background: var(--visual-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 300ms ease;
        }
        .feature-visual__tracking-dot.done {
          background: var(--visual-success);
          color: var(--visual-surface);
        }
        .feature-visual__tracking-dot.active {
          background: var(--visual-accent-soft);
          border: 2px solid var(--visual-accent);
          animation: active-pulse 2s ease-in-out infinite;
        }
        @keyframes active-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
          50% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0); }
        }
        .feature-visual__tracking-active-ring {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent);
        }
        .feature-visual__tracking-info {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
          min-width: 0;
        }
        .feature-visual__tracking-info-main {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .feature-visual__tracking-label {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__tracking-date {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          white-space: nowrap;
        }
        .feature-visual__tracking-time {
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-accent);
          background: var(--visual-accent-soft);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--visual-accent);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__tracking-detail {
          font-size: 10px;
          color: var(--visual-text-muted);
          opacity: 0.8;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          line-height: 1.4;
          margin-top: 2px;
        }
        .feature-visual__tracking-expanded {
          overflow: hidden;
          margin-top: var(--space-1);
        }
        .feature-visual__tracking-expanded-text {
          display: block;
          font-size: 10px;
          color: var(--visual-text-muted);
          line-height: 1.4;
          padding: var(--space-2);
          background: var(--visual-surface-elevated);
          border-radius: var(--radius-sm);
          border-left: 2px solid var(--visual-accent);
        }
        .feature-visual__tracking-expand-icon {
          flex-shrink: 0;
          color: var(--visual-text-muted);
          align-self: center;
          transition: transform 200ms ease;
        }
        .feature-visual__tracking-documents {
          padding: var(--space-2) var(--space-3);
          background: var(--visual-surface-elevated);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__tracking-documents-label {
          display: block;
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: var(--space-2);
        }
        .feature-visual__tracking-documents-list {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .feature-visual__tracking-document {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          color: var(--visual-text);
        }
        .feature-visual__tracking-document svg {
          color: var(--visual-text-muted);
        }
        .feature-visual__tracking-document-status {
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-success);
          background: rgba(74, 222, 128, 0.15);
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--visual-success);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__tracking-notes {
          padding: var(--space-2) var(--space-3);
          background: linear-gradient(135deg, var(--visual-accent-soft) 0%, var(--visual-surface-elevated) 100%);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-accent);
          border-left-width: 3px;
        }
        .feature-visual__tracking-notes-header {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          margin-bottom: var(--space-1);
        }
        .feature-visual__tracking-notes-header svg {
          color: var(--visual-accent);
        }
        .feature-visual__tracking-notes-header span {
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-accent);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__tracking-notes-text {
          font-size: 10px;
          color: var(--visual-text);
          line-height: 1.4;
          margin: 0;
        }
        .feature-visual__tracking-progress {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__tracking-progress-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__tracking-progress-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__tracking-progress-value {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__tracking-progress-bar {
          height: 8px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
          position: relative;
        }
        .feature-visual__tracking-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-success), var(--visual-accent));
          border-radius: var(--radius-full);
          position: relative;
          overflow: hidden;
        }
        .feature-visual__tracking-progress-shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .feature-visual__tracking-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__tracking-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__tracking-footer-value {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        @media (max-width: 640px) {
          .feature-visual__tracking-dot {
            width: 18px;
            height: 18px;
          }
          .feature-visual__tracking-connector-vertical {
            width: 16px;
          }
          .feature-visual__tracking-time {
            display: none;
          }
        }

        @media (max-width: 375px) {
          .feature-visual__tracking-body {
            padding: var(--space-3);
          }
          .feature-visual__tracking-metrics {
            gap: var(--space-1);
          }
          .feature-visual__tracking-metric {
            padding: var(--space-1);
          }
          .feature-visual__tracking-metric-value {
            font-size: var(--text-xs);
          }
          .feature-visual__tracking-referral {
            font-size: 9px;
          }
          .feature-visual__tracking-documents-list {
            flex-direction: column;
            gap: var(--space-1);
          }
          .feature-visual__tracking-footer-value {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export { ApplicationTrackingVisual };
