import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

const FILTERS = ['Remote', 'Full-time', 'Internship'];

const JOBS = [
  { company: 'Nova Labs', title: 'Junior Frontend Developer', logo: 'NL', match: 94, remote: true },
  { company: 'Cortexly', title: 'Graduate Software Engineer', logo: 'CX', match: 88, remote: false },
  { company: 'Beamworks', title: 'Data Analyst Intern', logo: 'BW', match: 82, remote: true },
];

const OpportunityDiscoveryInline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState('Remote');

  const visible = activeFilter === 'Remote' || activeFilter === 'Full-time'
    ? JOBS.filter((job) => (activeFilter === 'Remote' ? job.remote : !job.remote))
    : [JOBS[2]];

  return (
    <div ref={ref} className="inline-ui inline-ui--discover">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="inline-ui__discover"
      >
        <div className="inline-ui__discover-bar">
          <div className="inline-ui__discover-dots">
            <span className="inline-ui__discover-dot inline-ui__discover-dot--red" />
            <span className="inline-ui__discover-dot inline-ui__discover-dot--yellow" />
            <span className="inline-ui__discover-dot inline-ui__discover-dot--green" />
          </div>
          <span className="inline-ui__discover-bar-title">Opportunity Discovery</span>
          <span className="inline-ui__discover-bar-badge">{JOBS.length} open</span>
        </div>

        <div className="inline-ui__discover-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`inline-ui__discover-chip ${activeFilter === filter ? 'inline-ui__discover-chip--active' : ''}`}
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="inline-ui__discover-list">
          {visible.map((job, i) => (
            <motion.div
              key={job.company}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.08 }}
              className="inline-ui__discover-job"
            >
              <span className="inline-ui__discover-logo">{job.logo}</span>
              <span className="inline-ui__discover-info">
                <span className="inline-ui__discover-title">{job.title}</span>
                <span className="inline-ui__discover-company">
                  {job.company}
                  {job.remote && <span className="inline-ui__discover-tag">Remote</span>}
                </span>
              </span>
              <span className="inline-ui__discover-match">
                <span className="inline-ui__discover-match-value">{job.match}%</span>
                <span className="inline-ui__discover-match-label">match</span>
              </span>
            </motion.div>
          ))}
        </div>

        <div className="inline-ui__discover-footer">
          <span className="inline-ui__discover-footer-label">24 matching roles</span>
          <span className="inline-ui__discover-footer-value">Browse all &rarr;</span>
        </div>
      </motion.div>
      <style>{`
        .inline-ui--discover {
          width: 100%;
          max-width: 480px;
        }
        .inline-ui__discover {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .inline-ui__discover-bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__discover-dots {
          display: flex;
          gap: 6px;
        }
        .inline-ui__discover-dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .inline-ui__discover-dot--red { background: #f87171; }
        .inline-ui__discover-dot--yellow { background: #fbbf24; }
        .inline-ui__discover-dot--green { background: #4ade80; }
        .inline-ui__discover-bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
          flex: 1;
        }
        .inline-ui__discover-bar-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          white-space: nowrap;
        }
        .inline-ui__discover-filters {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4) 0;
          flex-wrap: wrap;
        }
        .inline-ui__discover-chip {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
        }
        .inline-ui__discover-chip--active {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .inline-ui__discover-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4) var(--space-4);
        }
        .inline-ui__discover-job {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3);
          border-radius: var(--radius-md);
          background: var(--visual-surface-muted);
          border: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__discover-logo {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          background: var(--visual-accent);
          color: var(--visual-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 700;
        }
        .inline-ui__discover-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .inline-ui__discover-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .inline-ui__discover-company {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .inline-ui__discover-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: var(--radius-full);
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          color: var(--visual-text-muted);
        }
        .inline-ui__discover-match {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .inline-ui__discover-match-value {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-accent);
          line-height: 1;
        }
        .inline-ui__discover-match-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .inline-ui__discover-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .inline-ui__discover-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .inline-ui__discover-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-accent);
        }
      `}</style>
    </div>
  );
};

export { OpportunityDiscoveryInline };