import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Opportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  match: number;
  salary: string;
  tags: string[];
  recommended?: boolean;
}

const OpportunityDiscoveryVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<'all' | 'remote' | 'fulltime'>('all');

  const opportunities: Opportunity[] = [
    { id: 1, title: 'Senior Frontend Developer', company: 'TechCorp Inc.', location: 'San Francisco, CA', type: 'Full-time', match: 95, salary: '$140K–$180K', tags: ['React', 'TypeScript', 'Node.js'], recommended: true },
    { id: 2, title: 'Frontend Engineer', company: 'InnovateTech', location: 'New York, NY', type: 'Full-time', match: 87, salary: '$120K–$150K', tags: ['Vue.js', 'GraphQL'] },
    { id: 3, title: 'UI Developer', company: 'DesignHub', location: 'Austin, TX', type: 'Remote', match: 78, salary: '$100K–$130K', tags: ['React', 'Figma'] },
    { id: 4, title: 'Full-stack Developer', company: 'CloudBase', location: 'Seattle, WA', type: 'Remote', match: 72, salary: '$110K–$140K', tags: ['Node.js', 'AWS'] },
  ];

  const filtered = filter === 'all' ? opportunities : opportunities.filter(o => o.type.toLowerCase() === filter);

  return (
    <div ref={ref} className="feature-visual feature-visual--discovery">
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
          <span className="feature-visual__bar-title">Opportunity Discovery</span>
          <span className="feature-visual__bar-badge">{filtered.length} results</span>
        </div>

        <div className="feature-visual__toolbar">
          <div className="feature-visual__toolbar-left">
            <span className="feature-visual__toolbar-label">Filters:</span>
            {(['all', 'remote', 'fulltime'] as const).map(f => (
              <button
                key={f}
                type="button"
                className={`feature-visual__filter-btn ${filter === f ? 'feature-visual__filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'remote' ? 'Remote' : 'Full-time'}
              </button>
            ))}
          </div>
          <div className="feature-visual__toolbar-right">
            <span className="feature-visual__sort-label">Sort by:</span>
            <select className="feature-visual__sort-select" defaultValue="match">
              <option value="match">Match %</option>
              <option value="salary">Salary</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>

        <div className="feature-visual__results">
          {filtered.map((opp, i) => (
            <motion.div
              key={opp.id}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.2 + i * 0.08 }}
              className={`feature-visual__opp-card ${opp.recommended ? 'feature-visual__opp-card--recommended' : ''}`}
            >
              {opp.recommended && (
                <div className="feature-visual__opp-recommended-badge">
                  <span className="feature-visual__opp-recommended-dot" />
                  Recommended
                </div>
              )}
              <div className="feature-visual__opp-header">
                <div className="feature-visual__opp-info">
                  <div className="feature-visual__opp-title">{opp.title}</div>
                  <div className="feature-visual__opp-company">{opp.company}</div>
                </div>
                <div className="feature-visual__opp-match">
                  <svg viewBox="0 0 48 48" className="feature-visual__opp-match-svg">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="var(--visual-border)" strokeWidth="4" />
                    <motion.circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke={opp.match >= 90 ? 'var(--visual-success)' : 'var(--visual-accent)'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      transform="rotate(-90 24 24)"
                      initial={reduceMotion ? false : { strokeDashoffset: 2 * Math.PI * 20 }}
                      animate={inView ? { strokeDashoffset: 2 * Math.PI * 20 - (opp.match / 100) * 2 * Math.PI * 20 } : { strokeDashoffset: 2 * Math.PI * 20 }}
                      transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.08 }}
                    />
                  </svg>
                  <span className="feature-visual__opp-match-text">{opp.match}%</span>
                </div>
              </div>
              <div className="feature-visual__opp-meta">
                <span className="feature-visual__opp-location">{opp.location}</span>
                <span className="feature-visual__opp-type">{opp.type}</span>
                <span className="feature-visual__opp-salary">{opp.salary}</span>
              </div>
              <div className="feature-visual__opp-tags">
                {opp.tags.map(tag => (
                  <span key={tag} className="feature-visual__opp-tag">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <style>{`
        .feature-visual--discovery {
          width: 100%;
          max-width: 520px;
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
        }
        .feature-visual__toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--visual-border);
          flex-wrap: wrap;
          transition: border-color var(--transition-theme);
        }
        .feature-visual__toolbar-left {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .feature-visual__toolbar-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__filter-btn {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          color: var(--visual-text-muted);
          cursor: pointer;
          transition: all 150ms ease;
        }
        .feature-visual__filter-btn:hover {
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .feature-visual__filter-btn--active {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .feature-visual__toolbar-right {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .feature-visual__sort-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__sort-select {
          font-size: var(--text-xs);
          font-weight: 600;
          padding: 4px 8px;
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          color: var(--visual-text);
          cursor: pointer;
        }
        .feature-visual__results {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          max-height: 380px;
          overflow-y: auto;
        }
        .feature-visual__opp-card {
          padding: var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          transition: all 150ms ease;
        }
        .feature-visual__opp-card:hover {
          border-color: var(--visual-accent);
          box-shadow: var(--visual-shadow);
        }
        .feature-visual__opp-card--recommended {
          border-color: var(--visual-success);
          background: linear-gradient(135deg, var(--visual-success-soft), var(--visual-surface));
        }
        .feature-visual__opp-recommended-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 700;
          color: var(--visual-success);
          margin-bottom: var(--space-2);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__opp-recommended-dot {
          width: 5px;
          height: 5px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: status-pulse 2s ease-in-out infinite;
        }
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .feature-visual__opp-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }
        .feature-visual__opp-info {
          flex: 1;
          min-width: 0;
        }
        .feature-visual__opp-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1.2;
        }
        .feature-visual__opp-company {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          margin-top: 2px;
        }
        .feature-visual__opp-match {
          position: relative;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
        }
        .feature-visual__opp-match-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }
        .feature-visual__opp-match-text {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__opp-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-bottom: var(--space-2);
        }
        .feature-visual__opp-location {
          font-size: 11px;
          color: var(--visual-text-muted);
        }
        .feature-visual__opp-type {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .feature-visual__opp-salary {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
          margin-left: auto;
        }
        .feature-visual__opp-tags {
          display: flex;
          gap: var(--space-1);
          flex-wrap: wrap;
        }
        .feature-visual__opp-tag {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
          border: 1px solid var(--visual-border);
        }

        @media (max-width: 640px) {
          .feature-visual__toolbar {
            flex-direction: column;
            align-items: flex-start;
          }
          .feature-visual__opp-match {
            width: 36px;
            height: 36px;
          }
          .feature-visual__opp-match-text {
            font-size: 9px;
          }
          .feature-visual__opp-title {
            font-size: var(--text-xs);
          }
        }
      `}</style>
    </div>
  );
};

export { OpportunityDiscoveryVisual };
