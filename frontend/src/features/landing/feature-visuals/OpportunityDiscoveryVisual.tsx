import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';
import { PhosphorIcon } from '../../../components/PhosphorIcon';

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
  isNew?: boolean;
  featured?: boolean;
  postedDays?: number;
  logo?: { initials: string; color: string };
}

const OpportunityDiscoveryVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<'all' | 'remote' | 'fulltime'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [salaryFilter, setSalaryFilter] = useState<string>('all');
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set([1]));
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const opportunities: Opportunity[] = [
    { id: 1, title: 'Senior Frontend Developer', company: 'TechCorp Inc.', location: 'San Francisco, CA', type: 'Full-time', match: 95, salary: '$140K–$180K', tags: ['React', 'TypeScript', 'Node.js'], recommended: true, isNew: true, postedDays: 2, logo: { initials: 'TC', color: 'var(--color-primary)' } },
    { id: 2, title: 'Frontend Engineer', company: 'InnovateTech', location: 'New York, NY', type: 'Full-time', match: 87, salary: '$120K–$150K', tags: ['Vue.js', 'GraphQL'], featured: true, postedDays: 1, logo: { initials: 'IT', color: 'var(--color-primary)' } },
    { id: 3, title: 'UI Developer', company: 'DesignHub', location: 'Austin, TX', type: 'Remote', match: 78, salary: '$100K–$130K', tags: ['React', 'Figma'], isNew: true, postedDays: 3, logo: { initials: 'DH', color: 'var(--color-warning)' } },
    { id: 4, title: 'Full-stack Developer', company: 'CloudBase', location: 'Seattle, WA', type: 'Remote', match: 72, salary: '$110K–$140K', tags: ['Node.js', 'AWS'], postedDays: 5, logo: { initials: 'CB', color: 'var(--color-success)' } },
    { id: 5, title: 'React Developer', company: 'DataFlow', location: 'Denver, CO', type: 'Full-time', match: 68, salary: '$95K–$125K', tags: ['React', 'Redux'], isNew: true, postedDays: 1, logo: { initials: 'DF', color: 'var(--color-primary)' } },
    { id: 6, title: 'Software Engineer', company: 'NextGen Labs', location: 'Chicago, IL', type: 'Hybrid', match: 65, salary: '$105K–$135K', tags: ['Python', 'Django'], postedDays: 7, logo: { initials: 'NG', color: 'var(--color-primary)' } },
  ];

  const locations = ['all', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Denver, CO', 'Chicago, IL'];

  const salaryOptions = [
    { value: 'all', label: 'Any Salary' },
    { value: '100', label: '$100K+' },
    { value: '120', label: '$120K+' },
    { value: '140', label: '$140K+' },
  ];

  let filtered = filter === 'all' ? opportunities : opportunities.filter(o => o.type.toLowerCase().replace('-', '') === filter);
  if (locationFilter !== 'all') {
    filtered = filtered.filter(o => o.location === locationFilter);
  }
  if (salaryFilter !== 'all') {
    const minSalary = Number(salaryFilter);
    filtered = filtered.filter(o => {
      const match = o.salary.match(/\$(\d+(?:\.\d+)?)K/);
      return match ? Number(match[1]) >= minSalary : true;
    });
  }

  const toggleBookmark = (id: number) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div ref={ref} className="feature-visual feature-visual--discovery">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        <div className="discovery-floating-bg">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="discovery-floating-orb"
              initial={reduceMotion ? false : { opacity: 0, scale: 0 }}
              animate={inView ? { opacity: [0, 0.15, 0], scale: [0, 1.2, 1.5] } : { opacity: 0, scale: 0 }}
              transition={{ duration: 3, ease: EASE, delay: i * 0.4, repeat: Infinity, repeatDelay: 2 }}
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 30}%`,
                background: i % 2 === 0 ? 'var(--visual-accent)' : 'var(--visual-success)'
              }}
            />
          ))}
        </div>

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
            <span className="feature-visual__toolbar-label">Type:</span>
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
            <span className="feature-visual__sort-label">Sort:</span>
            <select className="feature-visual__sort-select" defaultValue="match">
              <option value="match">Match %</option>
              <option value="salary">Salary</option>
              <option value="recent">Recent</option>
            </select>
          </div>
        </div>

        <div className="discovery-filters-row">
          <div className="discovery-location-pills">
            {locations.slice(0, 4).map(loc => (
              <button
                key={loc}
                type="button"
                className={`discovery-location-pill ${locationFilter === loc ? 'discovery-location-pill--active' : ''}`}
                onClick={() => setLocationFilter(loc)}
              >
                {loc === 'all' ? <><PhosphorIcon name="Globe" size={10} /> All</> : loc.split(',')[0]}
              </button>
            ))}
          </div>
          <div className="discovery-salary-filter">
            <select
              className="discovery-salary-select"
              value={salaryFilter}
              onChange={e => setSalaryFilter(e.target.value)}
            >
              {salaryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="feature-visual__results">
          {filtered.map((opp, i) => (
            <motion.div
              key={opp.id}
              initial={reduceMotion ? false : { opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }}
              className={`feature-visual__opp-card ${opp.recommended ? 'feature-visual__opp-card--recommended' : ''} ${opp.featured ? 'feature-visual__opp-card--featured' : ''}`}
              onMouseEnter={() => setHoveredCard(opp.id)}
              onMouseLeave={() => setHoveredCard(null)}
              whileHover={reduceMotion ? {} : { scale: 1.02, y: -2 }}
            >
              {opp.featured && (
                <div className="discovery-featured-banner">
                  <span className="discovery-featured-icon"><PhosphorIcon name="Star" size={13} weight="fill" /></span>
                  Featured Opportunity
                </div>
              )}
              
              <div className="feature-visual__opp-header">
                <motion.div
                  className="discovery-company-logo"
                  style={{ background: opp.logo?.color || 'var(--visual-accent)' }}
                  whileHover={reduceMotion ? {} : { scale: 1.1, rotate: 5 }}
                >
                  {opp.logo?.initials || opp.company.slice(0, 2).toUpperCase()}
                </motion.div>
                <div className="feature-visual__opp-info">
                  <div className="feature-visual__opp-title">{opp.title}</div>
                  <div className="feature-visual__opp-company">{opp.company}</div>
                </div>
                <motion.button
                  type="button"
                  className={`discovery-bookmark ${bookmarked.has(opp.id) ? 'discovery-bookmark--active' : ''}`}
                  onClick={() => toggleBookmark(opp.id)}
                  whileTap={reduceMotion ? {} : { scale: 0.8 }}
                >
                  <motion.svg
                    viewBox="0 0 24 24"
                    fill={bookmarked.has(opp.id) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    animate={bookmarked.has(opp.id) && !reduceMotion ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, -10, 10, 0]
                    } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </motion.svg>
                </motion.button>
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
                      transition={{ duration: 1.2, ease: EASE, delay: 0.4 + i * 0.08 }}
                    />
                  </svg>
                  <span className="feature-visual__opp-match-text">{opp.match}%</span>
                </div>
              </div>

              <motion.div
                className="discovery-card-badges"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={inView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
              >
                {opp.isNew && (
                  <motion.span
                    className="discovery-badge discovery-badge--new"
                    animate={reduceMotion ? {} : {
                      boxShadow: ['0 0 0 0 var(--color-success-pulse)', '0 0 0 8px transparent', '0 0 0 0 var(--color-success-pulse)']
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="discovery-badge-shimmer" />
                    New this week
                  </motion.span>
                )}
                <span className={`discovery-badge ${opp.match >= 85 ? 'discovery-badge--hot' : ''}`}>
                  {opp.match >= 85 && <span className="discovery-badge-shimmer" />}
                  {opp.salary}
                </span>
                <span className="discovery-badge discovery-badge--days">
                  {opp.postedDays}d ago
                </span>
              </motion.div>

              <div className="feature-visual__opp-meta">
                <span className="feature-visual__opp-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="discovery-meta-icon">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {opp.location}
                </span>
                <span className="feature-visual__opp-type">{opp.type}</span>
              </div>

              <div className="feature-visual__opp-tags">
                {opp.tags.map(tag => (
                  <span key={tag} className="feature-visual__opp-tag">{tag}</span>
                ))}
              </div>

              <motion.div
                className="discovery-hover-preview"
                initial={false}
                animate={{ opacity: hoveredCard === opp.id ? 1 : 0, height: hoveredCard === opp.id ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="discovery-preview-content">
                  <div className="discovery-preview-row">
                    <span className="discovery-preview-label">Experience</span>
                    <span className="discovery-preview-value">{opp.match >= 85 ? '3-5 years' : '2-4 years'}</span>
                  </div>
                  <div className="discovery-preview-row">
                    <span className="discovery-preview-label">Posted</span>
                    <span className="discovery-preview-value">{opp.postedDays} days ago</span>
                  </div>
                  <div className="discovery-preview-row">
                    <span className="discovery-preview-label">Benefits</span>
                    <span className="discovery-preview-value">Health, 401k, Equity</span>
                  </div>
                </div>
                <motion.button
                  type="button"
                  className="discovery-preview-btn"
                  whileHover={reduceMotion ? {} : { scale: 1.05 }}
                  whileTap={reduceMotion ? {} : { scale: 0.95 }}
                >
                  View Details
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <style>{`
        .feature-visual--discovery {
          width: 100%;
          max-width: 900px;
          position: relative;
        }
        .discovery-floating-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .discovery-floating-orb {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          filter: blur(40px);
        }
        .feature-visual__card {
          position: relative;
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
          z-index: 1;
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
        .feature-visual__dot--red { background: var(--color-danger); }
        .feature-visual__dot--yellow { background: var(--color-warning); }
        .feature-visual__dot--green { background: var(--color-success); }
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
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
        .discovery-filters-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          border-bottom: 1px solid var(--visual-border);
          background: linear-gradient(90deg, var(--visual-surface-elevated), var(--visual-surface));
          flex-wrap: wrap;
        }
        .discovery-location-pills {
          display: flex;
          gap: var(--space-1);
          flex-wrap: wrap;
        }
        .discovery-location-pill {
          font-size: 9px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          color: var(--visual-text-muted);
          cursor: pointer;
          transition: all 150ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .discovery-location-pill:hover {
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .discovery-location-pill--active {
          background: var(--visual-accent);
          border-color: var(--visual-accent);
          color: var(--visual-surface);
        }
        .discovery-salary-filter {
          display: flex;
          align-items: center;
        }
        .discovery-salary-select {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 6px;
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
          flex: 1;
          overflow-y: auto;
          min-height: 300px;
        }
        .feature-visual__opp-card {
          position: relative;
          padding: var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          transition: all 200ms ease;
          cursor: pointer;
        }
        .feature-visual__opp-card:hover {
          border-color: var(--visual-accent);
          box-shadow: var(--visual-shadow), 0 0 20px var(--visual-accent-glow);
        }
        .feature-visual__opp-card--recommended {
          border-color: var(--visual-success);
        }
        .feature-visual__opp-card--featured {
          border-color: var(--visual-accent);
          background: linear-gradient(135deg, var(--visual-accent-soft), var(--visual-surface));
        }
        .discovery-featured-banner {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-accent);
          margin-bottom: var(--space-2);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .discovery-featured-icon {
          font-size: 14px;
        }
        .discovery-company-logo {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: var(--visual-surface);
          flex-shrink: 0;
          box-shadow: var(--visual-shadow);
        }
        .discovery-bookmark {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--visual-text-muted);
          cursor: pointer;
          transition: color 150ms ease;
          padding: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .discovery-bookmark:hover {
          color: var(--visual-accent);
        }
        .discovery-bookmark--active {
          color: var(--visual-accent);
        }
        .discovery-bookmark svg {
          width: 18px;
          height: 18px;
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
          align-items: center;
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
        .discovery-card-badges {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-bottom: var(--space-2);
        }
        .discovery-badge {
          position: relative;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
          border: 1px solid var(--visual-border);
          overflow: hidden;
        }
        .discovery-badge--new {
          background: var(--visual-success-soft);
          border-color: var(--visual-success);
          color: var(--visual-success);
        }
        .discovery-badge--hot {
          background: var(--visual-danger-soft);
          border-color: var(--visual-danger);
          color: var(--visual-danger);
        }
        .discovery-badge--days {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
          opacity: 0.7;
        }
        .discovery-badge-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(var(--visual-surface-rgb), 0.4), transparent);
          animation: shimmer 2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .feature-visual__opp-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-bottom: var(--space-2);
        }
        .discovery-meta-icon {
          width: 12px;
          height: 12px;
          margin-right: 4px;
          vertical-align: middle;
        }
        .feature-visual__opp-location {
          display: flex;
          align-items: center;
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
        .discovery-hover-preview {
          overflow: hidden;
          margin-top: var(--space-2);
          border-top: 1px dashed var(--visual-border);
          padding-top: var(--space-2);
        }
        .discovery-preview-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          margin-bottom: var(--space-2);
        }
        .discovery-preview-row {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
        }
        .discovery-preview-label {
          color: var(--visual-text-muted);
          font-weight: 600;
        }
        .discovery-preview-value {
          color: var(--visual-text);
          font-weight: 600;
        }
        .discovery-preview-btn {
          width: 100%;
          padding: var(--space-2);
          border: none;
          border-radius: var(--radius-md);
          background: var(--visual-accent);
          color: var(--visual-surface);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: background 150ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .discovery-preview-btn:hover {
          background: var(--visual-accent-hover, var(--visual-accent));
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
          .discovery-company-logo {
            width: 32px;
            height: 32px;
            font-size: 10px;
          }
        }

        @media (max-width: 767px) {
          .feature-visual--discovery {
            max-width: 100%;
          }
        }

        @media (max-width: 375px) {
          .discovery-filters-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .discovery-location-pills {
            width: 100%;
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: var(--space-1);
          }
          .discovery-location-pill {
            flex-shrink: 0;
          }
          .feature-visual__opp-card {
            padding: var(--space-3);
          }
          .discovery-card-badges {
            gap: var(--space-1);
          }
          .feature-visual__results {
            padding: var(--space-2) var(--space-3);
          }
          .discovery-bookmark {
            width: 24px;
            height: 24px;
          }
          .discovery-bookmark svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export { OpportunityDiscoveryVisual };
