import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Candidate {
  id: number;
  name: string;
  role: string;
  location: string;
  score: number;
  experience: string;
  status: 'New' | 'Screening' | 'Interview' | 'Shortlisted';
  skills: string[];
  availability: 'Immediate' | '2 weeks' | '1 month' | '2 months';
  inNetwork: boolean;
  salaryRange: string;
}

const EmployerCandidateVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'shortlisted'>('all');
  const [activeCandidate, setActiveCandidate] = useState<number>(1);

  const candidates: Candidate[] = [
    { id: 1, name: 'Sarah Chen', role: 'Senior Frontend Developer', location: 'San Francisco, CA', score: 94, experience: '5 yrs', status: 'Shortlisted', skills: ['React', 'TypeScript', 'Node.js'], availability: 'Immediate', inNetwork: true, salaryRange: '$120K - $150K' },
    { id: 2, name: 'Michael Ross', role: 'Full-stack Engineer', location: 'New York, NY', score: 89, experience: '4 yrs', status: 'Interview', skills: ['Next.js', 'GraphQL', 'AWS'], availability: '2 weeks', inNetwork: false, salaryRange: '$110K - $140K' },
    { id: 3, name: 'John Park', role: 'Frontend Developer', location: 'Austin, TX', score: 83, experience: '3 yrs', status: 'Screening', skills: ['React', 'Docker', 'CSS'], availability: '1 month', inNetwork: true, salaryRange: '$85K - $105K' },
    { id: 4, name: 'Emma Williams', role: 'UI Engineer', location: 'Remote', score: 81, experience: '2 yrs', status: 'New', skills: ['Vue', 'CSS', 'Figma'], availability: '2 weeks', inNetwork: false, salaryRange: '$75K - $95K' },
    { id: 5, name: 'David Kim', role: 'Senior React Developer', location: 'Seattle, WA', score: 78, experience: '6 yrs', status: 'New', skills: ['React', 'Redux', 'TypeScript'], availability: 'Immediate', inNetwork: false, salaryRange: '$140K - $170K' },
    { id: 6, name: 'Lisa Zhang', role: 'Frontend Architect', location: 'Los Angeles, CA', score: 76, experience: '7 yrs', status: 'Screening', skills: ['Angular', 'RxJS', 'TypeScript'], availability: '1 month', inNetwork: true, salaryRange: '$160K - $190K' },
  ];

  const radius = 18;
  const circumference = 2 * Math.PI * radius;

  const tabs: Array<{ id: 'all' | 'new' | 'shortlisted'; label: string; count: number }> = [
    { id: 'all', label: 'All', count: candidates.length },
    { id: 'new', label: 'New', count: candidates.filter(c => c.status === 'New').length },
    { id: 'shortlisted', label: 'Shortlisted', count: candidates.filter(c => c.status === 'Shortlisted' || c.status === 'Interview').length },
  ];

  const visibleCandidates = candidates.filter((c) => {
    if (activeTab === 'new') return c.status === 'New';
    if (activeTab === 'shortlisted') return c.status === 'Shortlisted' || c.status === 'Interview';
    return true;
  });

  const selectedCandidate = candidates.find(c => c.id === activeCandidate);

  useEffect(() => {
    if (visibleCandidates.some(c => c.id === activeCandidate)) return;
    if (visibleCandidates[0]) setActiveCandidate(visibleCandidates[0].id);
  }, [activeTab, visibleCandidates, activeCandidate]);

  const availabilityBadgeClass = (avail: Candidate['availability']) => {
    switch (avail) {
      case 'Immediate': return 'visual-badge--success';
      case '2 weeks': return 'visual-badge--info';
      case '1 month': return 'visual-badge--warning';
      case '2 months': return 'visual-badge--purple';
    }
  };

  return (
    <div ref={ref} className="feature-visual feature-visual--employer-candidate">
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
          <span className="feature-visual__bar-title">Candidates</span>
          <span className="feature-visual__bar-badge visual-badge visual-badge--accent">{candidates.filter(c => c.status === 'New').length} new</span>
        </div>

        <div className="feature-visual__employer-toolbar">
          <motion.div className="feature-visual__employer-tabs" layout>
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                type="button"
                className={`feature-visual__employer-tab ${activeTab === tab.id ? 'feature-visual__employer-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.97 }}
              >
                <span>{tab.label}</span>
                <span className="feature-visual__employer-tab-count visual-badge">{tab.count}</span>
              </motion.button>
            ))}
          </motion.div>
          <div className="feature-visual__employer-search">
            <svg viewBox="0 0 24 24" className="feature-visual__employer-search-icon" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="feature-visual__employer-search-text">Search</span>
          </div>
        </div>

        <div className="feature-visual__body">
          <div className="feature-visual__candidate-list">
            <AnimatePresence mode="popLayout">
              {visibleCandidates.map((candidate, i) => {
                 const isActive = activeCandidate === candidate.id;
                 const avc = availabilityBadgeClass(candidate.availability);
                return (
                  <motion.div
                    key={candidate.id}
                    layout
                    initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.4, ease: EASE, delay: i * 0.06 }}
                    className={`feature-visual__candidate-row ${isActive ? 'feature-visual__candidate-row--active' : ''}`}
                    onClick={() => setActiveCandidate(candidate.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setActiveCandidate(candidate.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <motion.div
                      className="feature-visual__candidate-avatar"
                      whileHover={reduceMotion ? {} : { scale: 1.05 }}
                    >
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </motion.div>

                    <div className="feature-visual__candidate-info">
                      <div className="feature-visual__candidate-name">{candidate.name}</div>
                      <div className="feature-visual__candidate-role">{candidate.role}</div>
                      <div className="feature-visual__candidate-meta">
                        <span>{candidate.location}</span>
                        <span className="feature-visual__candidate-dot">•</span>
                        <span>{candidate.experience}</span>
                        <span className="feature-visual__candidate-dot">•</span>
                        <span className={`feature-visual__candidate-availability visual-badge ${avc}`}>
                          {candidate.availability}
                        </span>
                      </div>
                      <div className="feature-visual__candidate-skills">
                        {candidate.skills.map(skill => (
                          <span key={skill} className="feature-visual__candidate-skill visual-badge">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      className="feature-visual__candidate-score-ring"
                      whileHover={reduceMotion ? {} : { scale: 1.1 }}
                      aria-label={`Match score ${candidate.score} percent`}
                    >
                      <svg viewBox="0 0 48 48" className="feature-visual__candidate-svg">
                        <circle cx="24" cy="24" r={radius} fill="none" stroke="var(--visual-border)" strokeWidth="4" />
                        <motion.circle
                          cx="24" cy="24" r={radius} fill="none" stroke="var(--visual-accent)" strokeWidth="4" strokeLinecap="round"
                          transform="rotate(-90 24 24)"
                          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: circumference - (candidate.score / 100) * circumference }}
                          transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.1 }}
                        />
                      </svg>
                      <span className="feature-visual__candidate-score">{candidate.score}</span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {selectedCandidate && (
              <motion.div
                key={selectedCandidate.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="feature-visual__candidate-panel"
              >
                <div className="feature-visual__panel-header">
                  <div className="feature-visual__panel-avatar">
                    {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="feature-visual__panel-header-info">
                    <h4 className="feature-visual__panel-name">{selectedCandidate.name}</h4>
                    <p className="feature-visual__panel-role">{selectedCandidate.role}</p>
                    <p className="feature-visual__panel-location">{selectedCandidate.location} · {selectedCandidate.salaryRange}</p>
                  </div>
                </div>

                <div className="feature-visual__panel-section">
                  <h5 className="feature-visual__panel-section-title">Top Skills</h5>
                  <div className="feature-visual__skills-tags">
                    {selectedCandidate.skills.map(skill => (
                      <span key={skill} className="feature-visual__skill-tag feature-visual__skill-tag--match">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="feature-visual__panel-section">
                  <h5 className="feature-visual__panel-section-title">Availability</h5>
                   <span className={`feature-visual__panel-availability visual-badge ${availabilityBadgeClass(selectedCandidate.availability)}`}>
                     {selectedCandidate.availability}
                   </span>
                </div>

                <div className="feature-visual__panel-actions">
                  <motion.button
                    type="button"
                    className="feature-visual__panel-btn feature-visual__panel-btn--primary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Schedule Interview
                  </motion.button>
                  <motion.button
                    type="button"
                    className="feature-visual__panel-btn feature-visual__panel-btn--secondary"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Profile
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="feature-visual__employer-footer">
          <div className="feature-visual__employer-footer-info">
            <span className="feature-visual__employer-footer-label">Sort by</span>
            <span className="feature-visual__employer-footer-value">Match score</span>
          </div>
          <div className="feature-visual__employer-footer-actions">
            <button type="button" className="feature-visual__employer-action feature-visual__employer-action--secondary">View all</button>
            <button type="button" className="feature-visual__employer-action feature-visual__employer-action--primary">Review</button>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--employer-candidate {
          width: 100%;
          max-width: 900px;
        }
        .feature-visual__card {
          overflow: hidden;
          width: 100%;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
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
          background: var(--visual-success-soft);
          border-color: var(--visual-success);
          color: var(--visual-success);
        }
        .visual-badge--accent {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .visual-badge--info {
          background: var(--visual-accent-soft);
          border-color: var(--visual-accent);
          color: var(--visual-accent);
        }
        .visual-badge--warning {
          background: var(--visual-warning-soft);
          border-color: var(--visual-warning);
          color: var(--visual-warning);
        }
        .visual-badge--purple {
          background: var(--color-primary-soft);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }
        .feature-visual__employer-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--visual-border);
          transition: border-color var(--transition-theme);
        }
        .feature-visual__employer-tabs {
          display: flex;
          gap: 4px;
          background: var(--visual-surface-muted);
          padding: 3px;
          border-radius: var(--radius-md);
        }
        .feature-visual__employer-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--visual-text-muted);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease;
        }
        .feature-visual__employer-tab:hover { color: var(--visual-text); }
        .feature-visual__employer-tab--active {
          background: var(--visual-surface);
          color: var(--visual-text);
          box-shadow: var(--shadow-xs);
        }
        .feature-visual__employer-tab-count {
          font-size: 9px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: var(--radius-full);
        }
        .feature-visual__employer-tab--active .feature-visual__employer-tab-count {
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          border-color: var(--visual-accent);
        }
        .feature-visual__employer-search {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: var(--radius-md);
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
          font-size: 11px;
        }
        .feature-visual__employer-search-icon { width: 12px; height: 12px; }
        .feature-visual--employer-candidate .feature-visual__body {
          display: flex;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }
        .feature-visual__candidate-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          padding: var(--space-4);
          overflow-y: auto;
          min-width: 0;
        }
        .feature-visual__candidate-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background-color 150ms ease, border-color 150ms ease;
        }
        .feature-visual__candidate-row:hover {
          background: var(--visual-surface-muted);
          border-color: var(--visual-border);
        }
        .feature-visual__candidate-row--active {
          background: var(--visual-surface-muted);
          border-color: var(--visual-accent-soft);
        }
        .feature-visual__candidate-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .feature-visual__candidate-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .feature-visual__candidate-name {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
          line-height: 1.2;
        }
        .feature-visual__candidate-role {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          line-height: 1.3;
        }
        .feature-visual__candidate-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
        }
        .feature-visual__candidate-dot { opacity: 0.5; }
        .feature-visual__candidate-availability {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
        }
        .feature-visual__candidate-skills {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .feature-visual__candidate-skill {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
        }
        .feature-visual__candidate-score-ring {
          position: relative;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
        }
        .feature-visual__candidate-svg {
          width: 100%;
          height: 100%;
        }
        .feature-visual__candidate-score {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: var(--visual-text);
        }
        .feature-visual__candidate-panel {
          width: 260px;
          flex-shrink: 0;
          padding: var(--space-4);
          border-left: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .feature-visual__panel-header {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
        }
        .feature-visual__panel-avatar {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .feature-visual__panel-header-info {
          flex: 1;
          min-width: 0;
        }
        .feature-visual__panel-name {
          font-size: var(--text-base);
          font-weight: 700;
          color: var(--visual-text);
          margin: 0;
        }
        .feature-visual__panel-role {
          font-size: var(--text-sm);
          color: var(--visual-text-muted);
          margin: 2px 0 0;
        }
        .feature-visual__panel-location {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          margin: 2px 0 0;
        }
        .feature-visual__panel-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .feature-visual__panel-section-title {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .feature-visual__skills-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .feature-visual__skill-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .feature-visual__skill-tag--match {
          background: var(--visual-success-soft);
          color: var(--visual-success);
        }
        .feature-visual__skill-tag--missing {
          background: var(--visual-surface-muted);
          color: var(--visual-text-muted);
        }
        .feature-visual__panel-availability {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          display: inline-block;
        }
        .feature-visual__panel-actions {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-top: auto;
        }
        .feature-visual__panel-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__panel-btn--primary {
          background: var(--visual-accent);
          color: var(--visual-surface);
        }
        .feature-visual__panel-btn--primary:hover {
          opacity: 0.9;
        }
        .feature-visual__panel-btn--secondary {
          background: var(--visual-surface);
          color: var(--visual-text-secondary);
          border-color: var(--visual-border);
        }
        .feature-visual__panel-btn--secondary:hover {
          color: var(--visual-text);
          border-color: var(--visual-text-muted);
        }
        .feature-visual__employer-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          background: var(--visual-surface-elevated);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__employer-footer-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .feature-visual__employer-footer-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__employer-footer-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__employer-footer-actions {
          display: flex;
          gap: 6px;
        }
        .feature-visual__employer-action {
          padding: 6px 14px;
          font-size: var(--text-sm);
          font-weight: 600;
          border-radius: var(--radius-md);
          border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 150ms ease, color 150ms ease, border-color 150ms ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__employer-action--secondary {
          background: var(--visual-surface);
          color: var(--visual-text-secondary);
          border-color: var(--visual-border);
        }
        .feature-visual__employer-action--secondary:hover {
          color: var(--visual-text);
          border-color: var(--visual-text-muted);
        }
        .feature-visual__employer-action--primary {
          background: var(--visual-accent);
          color: var(--visual-surface);
        }
        .feature-visual__employer-action--primary:hover { opacity: 0.9; }

        @media (max-width: 640px) {
          .feature-visual--employer-candidate { max-width: 100%; }
          .feature-visual--employer-candidate .feature-visual__body { flex-direction: column; }
          .feature-visual__candidate-list { flex: 1; min-height: 0; }
          .feature-visual__candidate-panel {
            width: 100%;
            border-left: none;
            border-top: 1px solid var(--visual-border);
            flex: 1;
            min-height: 0;
          }
          .feature-visual__employer-toolbar { flex-direction: column; align-items: stretch; gap: var(--space-2); }
          .feature-visual__employer-search { width: 100%; }
          .feature-visual__candidate-row { flex-wrap: wrap; gap: var(--space-2); }
          .feature-visual__candidate-info { flex: 1 1 0; min-width: 0; }
          .feature-visual__candidate-score-ring { width: 40px; height: 40px; margin-left: auto; }
          .feature-visual__employer-footer { flex-direction: column; align-items: flex-start; gap: var(--space-2); }
          .feature-visual__employer-footer-actions { width: 100%; }
          .feature-visual__employer-action { flex: 1; text-align: center; }
        }
        @media (max-width: 375px) {
          .feature-visual__candidate-meta { font-size: 9px; }
          .feature-visual__panel-actions { flex-direction: row; flex-wrap: wrap; }
          .feature-visual__panel-btn { flex: 1; min-width: 80px; }
          .feature-visual__candidate-row { padding: var(--space-2); }
        }
      `}</style>
    </div>
  );
};

export { EmployerCandidateVisual };
