import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { PhosphorIcon } from '../../../components/PhosphorIcon';

const EASE = [0.22, 1, 0.36, 1] as const;

interface PipelineStage {
  id: string;
  label: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface ActivityItem {
  id: number;
  type: 'hire' | 'interview' | 'application' | 'match';
  text: string;
  time: string;
  candidate?: string;
  company?: string;
}

const TalentPipelineVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const [activeStage, setActiveStage] = useState<string>('all');

  const pipelineStages: PipelineStage[] = [
    { id: 'candidates', label: 'Candidates', count: 1247, trend: 'up', color: 'var(--visual-accent)' },
    { id: 'matched', label: 'Matched', count: 342, trend: 'up', color: 'var(--visual-accent)' },
    { id: 'applied', label: 'Applied', count: 89, trend: 'stable', color: 'var(--visual-warning)' },
    { id: 'screening', label: 'Screening', count: 45, trend: 'down', color: 'var(--visual-warning)' },
    { id: 'interview', label: 'Interview', count: 18, trend: 'up', color: 'var(--visual-success)' },
    { id: 'offer', label: 'Offer', count: 5, trend: 'stable', color: 'var(--visual-success)' },
    { id: 'hired', label: 'Hired', count: 3, trend: 'up', color: 'var(--visual-success)' },
  ];

  const activities: ActivityItem[] = [
    { id: 1, type: 'hire', text: 'New hire completed onboarding', candidate: 'Alex Thompson', time: '2h ago' },
    { id: 2, type: 'interview', text: 'Interview scheduled', candidate: 'Maria Garcia', company: 'TechCorp', time: '4h ago' },
    { id: 3, type: 'application', text: '12 new applications received', time: '6h ago' },
    { id: 4, type: 'match', text: '8 candidates matched to roles', time: '1d ago' },
    { id: 5, type: 'interview', text: 'Final round completed', candidate: 'James Wilson', time: '1d ago' },
  ];

  const metrics = [
    { label: 'Time to Hire', value: '18', unit: 'days', trend: '-3' },
    { label: 'Match Rate', value: '87%', trend: '+5%' },
    { label: 'Active Roles', value: '24', trend: '+2' },
    { label: 'Conversion', value: '3.4%', trend: '+0.8%' },
  ];

  const maxCount = Math.max(...pipelineStages.map(s => s.count));

  return (
    <div ref={ref} className="feature-visual feature-visual--pipeline">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        {/* Floating particles */}
        <div className="feature-visual__particles" aria-hidden="true">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="feature-visual__particle"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={inView ? {
                opacity: [0, 0.4, 0],
                y: [0, -30, 0],
                scale: [0.5, 1.2, 0.5]
              } : { opacity: 0 }}
              transition={{ duration: 4, delay: i * 0.3, repeat: Infinity }}
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
          <span className="feature-visual__bar-title">Talent Pipeline</span>
          <span className="feature-visual__bar-badge">{pipelineStages.length} stages</span>
        </div>

        <div className="feature-visual__pipeline-body">
          {/* Header Metrics */}
          <div className="feature-visual__pipeline-metrics">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.1 + i * 0.08 }}
                className="feature-visual__pipeline-metric"
              >
                <span className="feature-visual__pipeline-metric-value">{metric.value}</span>
                {metric.unit && <span className="feature-visual__pipeline-metric-unit">{metric.unit}</span>}
                <span className="feature-visual__pipeline-metric-label">{metric.label}</span>
                <span className="feature-visual__pipeline-metric-trend">{metric.trend}</span>
              </motion.div>
            ))}
          </div>

          {/* Pipeline Funnel */}
          <div className="feature-visual__pipeline-funnel">
            <div className="feature-visual__funnel-header">
              <span className="feature-visual__funnel-title">Pipeline Overview</span>
              <span className="feature-visual__funnel-subtitle">Click a stage to filter</span>
            </div>

            <div className="feature-visual__funnel-stages">
              {pipelineStages.map((stage, i) => (
                <motion.div
                  key={stage.id}
                  initial={reduceMotion ? false : { opacity: 0, scaleY: 0 }}
                  animate={inView ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.2 + i * 0.06 }}
                  className={`feature-visual__funnel-stage ${activeStage === stage.id ? 'active' : ''}`}
                  onClick={() => setActiveStage(activeStage === stage.id ? 'all' : stage.id)}
                  style={{ height: `${40 + (stage.count / maxCount) * 60}%` }}
                >
                  <div className="feature-visual__funnel-bar" style={{ background: stage.color }} />
                  <div className="feature-visual__funnel-info">
                    <span className="feature-visual__funnel-count">{stage.count}</span>
                    <span className="feature-visual__funnel-label">{stage.label}</span>
                    {stage.trend === 'up' && (
                      <span className="feature-visual__funnel-trend up"><PhosphorIcon name="ArrowUp" size={10} weight="bold" /></span>
                    )}
                    {stage.trend === 'down' && (
                      <span className="feature-visual__funnel-trend down"><PhosphorIcon name="ArrowDown" size={10} weight="bold" /></span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Flow Arrows */}
            <div className="feature-visual__funnel-flow">
              {pipelineStages.slice(0, -1).map((_, i) => (
                <motion.div
                  key={i}
                  className="feature-visual__funnel-arrow"
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.08 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="feature-visual__pipeline-activity">
            <div className="feature-visual__activity-header">
              <span className="feature-visual__activity-title">Recent Activity</span>
              <button type="button" className="feature-visual__activity-view-all">View all</button>
            </div>

            <div className="feature-visual__activity-list">
              {activities.map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={reduceMotion ? false : { opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.4 + i * 0.1 }}
                  className="feature-visual__activity-item"
                >
                  <div className={`feature-visual__activity-icon ${activity.type}`}>
                    {activity.type === 'hire' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                      </svg>
                    )}
                    {activity.type === 'interview' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    )}
                    {activity.type === 'application' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                    )}
                    {activity.type === 'match' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                    )}
                  </div>
                  <div className="feature-visual__activity-content">
                    <span className="feature-visual__activity-text">{activity.text}</span>
                    {activity.candidate && (
                      <span className="feature-visual__activity-meta">
                        {activity.candidate}
                        {activity.company && ` at ${activity.company}`}
                      </span>
                    )}
                  </div>
                  <span className="feature-visual__activity-time">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="feature-visual__pipeline-actions">
            <motion.button
              type="button"
              className="feature-visual__pipeline-action primary"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.9 }}
              whileHover={reduceMotion ? {} : { scale: 1.02 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Search Candidates
            </motion.button>
            <motion.button
              type="button"
              className="feature-visual__pipeline-action"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: EASE, delay: 1 }}
              whileHover={reduceMotion ? {} : { scale: 1.02 }}
              whileTap={reduceMotion ? {} : { scale: 0.98 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Export Report
            </motion.button>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--pipeline {
          width: 100%;
          max-width: 900px;
        }
        @media (max-width: 767px) {
          .feature-visual--pipeline {
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
        .feature-visual__particle:nth-child(1) { top: 15%; left: 8%; }
        .feature-visual__particle:nth-child(2) { top: 25%; left: 90%; }
        .feature-visual__particle:nth-child(3) { top: 45%; left: 15%; }
        .feature-visual__particle:nth-child(4) { top: 55%; left: 85%; }
        .feature-visual__particle:nth-child(5) { top: 75%; left: 25%; }
        .feature-visual__particle:nth-child(6) { top: 85%; left: 75%; }
        .feature-visual__particle:nth-child(7) { top: 35%; left: 50%; }
        .feature-visual__particle:nth-child(8) { top: 65%; left: 60%; }
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
        .feature-visual__pipeline-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-4);
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          position: relative;
          z-index: 1;
        }
        .feature-visual__pipeline-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-2);
        }
        .feature-visual__pipeline-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          position: relative;
          transition: transform 150ms ease, box-shadow 150ms ease;
        }
        .feature-visual__pipeline-metric:hover {
          transform: translateY(-2px);
          box-shadow: var(--visual-shadow);
        }
        .feature-visual__pipeline-metric-value {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1;
        }
        .feature-visual__pipeline-metric-unit {
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .feature-visual__pipeline-metric-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .feature-visual__pipeline-metric-trend {
          position: absolute;
          top: 6px;
          right: 6px;
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-success);
        }
        .feature-visual__pipeline-funnel {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3);
          background: var(--visual-surface-muted);
          border-radius: var(--radius-lg);
          border: 1px solid var(--visual-border);
        }
        .feature-visual__funnel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__funnel-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__funnel-subtitle {
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .feature-visual__funnel-stages {
          display: flex;
          align-items: flex-end;
          gap: var(--space-1);
          height: 140px;
        }
        .feature-visual__funnel-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          cursor: pointer;
          transition: transform 150ms ease;
          position: relative;
        }
        .feature-visual__funnel-stage:hover {
          transform: scale(1.05);
        }
        .feature-visual__funnel-stage.active {
          transform: scale(1.08);
        }
        .feature-visual__funnel-bar {
          width: 100%;
          flex: 1;
          min-height: 4px;
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          opacity: 0.8;
          transition: opacity 150ms ease;
        }
        .feature-visual__funnel-stage:hover .feature-visual__funnel-bar,
        .feature-visual__funnel-stage.active .feature-visual__funnel-bar {
          opacity: 1;
        }
        .feature-visual__funnel-info {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: var(--space-2) 0;
          width: 100%;
        }
        .feature-visual__funnel-count {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__funnel-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .feature-visual__funnel-trend {
          font-size: 10px;
          font-weight: 700;
        }
        .feature-visual__funnel-trend.up { color: var(--visual-success); }
        .feature-visual__funnel-trend.down { color: var(--visual-danger); }
        .feature-visual__funnel-flow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: var(--space-1) 0;
        }
        .feature-visual__funnel-arrow {
          color: var(--visual-text-muted);
          opacity: 0.5;
        }
        .feature-visual__pipeline-activity {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }
        .feature-visual__activity-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .feature-visual__activity-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__activity-view-all {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-accent);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
          transition: background-color 150ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__activity-view-all:hover {
          background: var(--visual-accent-soft);
        }
        .feature-visual__activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__activity-item {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          background: var(--visual-surface);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }
        .feature-visual__activity-item:hover {
          border-color: var(--visual-accent);
          box-shadow: var(--visual-shadow);
        }
        .feature-visual__activity-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .feature-visual__activity-icon.hire {
          background: var(--visual-success-soft);
          color: var(--visual-success);
        }
        .feature-visual__activity-icon.interview {
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .feature-visual__activity-icon.application {
          background: var(--visual-warning-soft);
          color: var(--visual-warning);
        }
        .feature-visual__activity-icon.match {
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .feature-visual__activity-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .feature-visual__activity-text {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__activity-meta {
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .feature-visual__activity-time {
          font-size: 10px;
          color: var(--visual-text-muted);
          white-space: nowrap;
        }
        .feature-visual__pipeline-actions {
          display: flex;
          gap: var(--space-2);
          padding-top: var(--space-2);
        }
        .feature-visual__pipeline-action {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 150ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__pipeline-action:hover {
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .feature-visual__pipeline-action.primary {
          background: var(--visual-accent);
          color: var(--visual-surface);
          border-color: var(--visual-accent);
        }
        .feature-visual__pipeline-action.primary:hover {
          opacity: 0.9;
        }

        @media (max-width: 640px) {
          .feature-visual__pipeline-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
          .feature-visual__funnel-stages {
            height: 120px;
          }
          .feature-visual__funnel-label {
            font-size: 8px;
          }
          .feature-visual__pipeline-actions {
            flex-direction: column;
          }
        }
        @media (max-width: 375px) {
          .feature-visual__pipeline-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
          .feature-visual__pipeline-metric {
            padding: var(--space-2);
          }
          .feature-visual__pipeline-metric-value {
            font-size: var(--text-lg);
          }
          .feature-visual__funnel-stages {
            height: 100px;
            gap: 2px;
          }
          .feature-visual__activity-item {
            flex-wrap: wrap;
          }
          .feature-visual__activity-time {
            width: 100%;
            margin-top: var(--space-1);
            padding-left: calc(32px + var(--space-3));
          }
        }
      `}</style>
    </div>
  );
};

export { TalentPipelineVisual };
