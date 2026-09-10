import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

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

const SIDEBAR_ITEMS = [
  { id: 'overview', label: 'Overview', icon: 'home' },
  { id: 'jobs', label: 'Jobs', icon: 'briefcase' },
  { id: 'matches', label: 'Matches', icon: 'star' },
  { id: 'apps', label: 'Applications', icon: 'file' },
  { id: 'messages', label: 'Messages', icon: 'message' },
] as const;

const sidebarIcons = {
  home: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  briefcase: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  star: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  file: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  message: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
} as const;

const JOBS = [
  { company: 'Nova Labs', title: 'Junior Frontend Developer', logo: 'NL', match: 94, salary: '$60k–$75k', type: 'Full-time', remote: true },
  { company: 'Cortexly', title: 'Graduate Software Engineer', logo: 'CX', match: 88, salary: '$55k–$68k', type: 'Graduate program', remote: false },
  { company: 'Beamworks', title: 'Data Analyst Intern', logo: 'BW', match: 82, salary: '$25/hr', type: 'Internship', remote: true },
];

const MATCHES = [
  { name: 'Priya Sharma', role: 'UI Design Graduate', avatar: 'PS', score: 91 },
  { name: 'Marcus Lee', role: 'Engineering Grad Coach', avatar: 'ML', score: 86 },
  { name: 'Ava Chen', role: 'Data Analytics Grad', avatar: 'AC', score: 79 },
  { name: 'Diego Ortiz', role: 'DevOps Graduate', avatar: 'DO', score: 74 },
];

const APPS = [
  { company: 'Nova Labs', role: 'Junior Frontend Developer', status: 'Interview scheduled', date: 'Oct 12' },
  { company: 'Beamworks', role: 'Data Analyst Intern', status: 'Under review', date: 'Sep 28' },
];

const MESSAGES = [
  { name: 'Nova Labs — Maya', avatar: 'NM', time: '2h ago', preview: 'Thanks for the interview — we would love to move forward...', unread: true },
  { name: 'Cortexly — Tom', avatar: 'CT', time: 'Yesterday', preview: 'Contract terms attached, please review when ready.', unread: false },
];

export const ProductMatchVisual = ({
  role = 'Junior Frontend Developer',
  matchScore = 87,
  skills = [{ label: 'React', matched: true }, { label: 'TypeScript', matched: true }, { label: 'PostgreSQL', matched: true }, { label: 'Docker', matched: false }],
  className = '',
}: ProductMatchVisualProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setSelectedId(null);
  };

const scoreRadius = 54;
  const scoreCircumference = 2 * Math.PI * scoreRadius;

  const renderPanel = (tab: string) => {
    switch (tab) {
      case 'jobs':
        return (
          <div className="product-match-visual__panels">
            <div className="product-match-visual__panel-header">
              <span className="product-match-visual__panel-title">Recommended Jobs</span>
              <span className="product-match-visual__panel-count">{JOBS.length}</span>
            </div>
            <div className="product-match-visual__panel-list">
              {JOBS.map((job) => (
                <button
                  key={job.company}
                  type="button"
                  className={`product-match-visual__job-item ${selectedId === job.company ? 'product-match-visual__job-item--selected' : ''}`}
                  onClick={() => setSelectedId(selectedId === job.company ? null : job.company)}
                  aria-pressed={selectedId === job.company}
                >
                  <div className="product-match-visual__job-header">
                    <div className="product-match-visual__job-logo">{job.logo}</div>
                    <div className="product-match-visual__job-info">
                      <div className="product-match-visual__job-title">{job.title}</div>
                      <div className="product-match-visual__job-company">{job.company}</div>
                    </div>
                    <div className="product-match-visual__job-match">
                      <span className="product-match-visual__job-match-text">{job.match}%</span>
                    </div>
                  </div>
                  <div className="product-match-visual__job-match-bar">
                    <div
                      className="product-match-visual__job-match-fill"
                      style={{ width: `${job.match}%` }}
                    />
                  </div>
                  <div className="product-match-visual__job-meta">
                    <span className="product-match-visual__job-salary">{job.salary}</span>
                    <span className="product-match-visual__job-type">{job.type}</span>
                    {job.remote && <span className="product-match-visual__job-remote">Remote</span>}
                  </div>
                  <span className="product-match-visual__row-action">
                    {selectedId === job.company ? 'Selected' : 'View details'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'matches':
        return (
          <div className="product-match-visual__panels">
            <div className="product-match-visual__panel-header">
              <span className="product-match-visual__panel-title">Top Matches</span>
              <span className="product-match-visual__panel-count">{MATCHES.length}</span>
            </div>
            <div className="product-match-visual__panel-list">
              {MATCHES.map((m) => (
                <button
                  key={m.name}
                  type="button"
                  className={`product-match-visual__match-item ${selectedId === m.name ? 'product-match-visual__match-item--selected' : ''}`}
                  onClick={() => setSelectedId(selectedId === m.name ? null : m.name)}
                  aria-pressed={selectedId === m.name}
                >
                  <div className="product-match-visual__match-avatar">{m.avatar}</div>
                  <div className="product-match-visual__match-info">
                    <div className="product-match-visual__match-name">{m.name}</div>
                    <div className="product-match-visual__match-role">{m.role}</div>
                  </div>
                  <div className="product-match-visual__match-right">
                    <span className="product-match-visual__match-score">{m.score}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'apps':
        return (
          <div className="product-match-visual__panels">
            <div className="product-match-visual__panel-header">
              <span className="product-match-visual__panel-title">Applications</span>
              <span className="product-match-visual__panel-count">{APPS.length}</span>
            </div>
            <div className="product-match-visual__panel-list">
              {APPS.map((app) => (
                <button
                  key={app.company}
                  type="button"
                  className={`product-match-visual__app-item ${selectedId === app.company ? 'product-match-visual__app-item--selected' : ''}`}
                  onClick={() => setSelectedId(selectedId === app.company ? null : app.company)}
                  aria-pressed={selectedId === app.company}
                >
                  <div className="product-match-visual__app-header">
                    <div>
                      <div className="product-match-visual__app-company">{app.company}</div>
                      <div className="product-match-visual__app-role">{app.role}</div>
                    </div>
                  </div>
                  <div className="product-match-visual__app-footer">
                    <span className="product-match-visual__app-status">{app.status}</span>
                    <span className="product-match-visual__app-date">{app.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="product-match-visual__panels">
            <div className="product-match-visual__panel-header">
              <span className="product-match-visual__panel-title">Messages</span>
              <span className="product-match-visual__panel-count">{MESSAGES.filter(m => m.unread).length} unread</span>
            </div>
            <div className="product-match-visual__panel-list">
              {MESSAGES.map((msg) => (
                <button
                  key={msg.name}
                  type="button"
                  className={`product-match-visual__msg-item ${msg.unread ? 'product-match-visual__msg-item--unread' : ''} ${selectedId === msg.name ? 'product-match-visual__msg-item--selected' : ''}`}
                  onClick={() => setSelectedId(selectedId === msg.name ? null : msg.name)}
                  aria-pressed={selectedId === msg.name}
                >
                  <div className="product-match-visual__msg-avatar">{msg.avatar}</div>
                  <div className="product-match-visual__msg-body">
                    <div className="product-match-visual__msg-header">
                      <span className="product-match-visual__msg-name">{msg.name}</span>
                      <span className="product-match-visual__msg-time">{msg.time}</span>
                    </div>
                    <p className="product-match-visual__msg-preview">{msg.preview}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
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

        {/* Mobile tab bar (sidebar is hidden below 640px) */}
        <nav className="product-match-visual__tabs" aria-label="Simulated navigation">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`product-match-visual__tab ${activeTab === item.id ? 'product-match-visual__tab--active' : ''}`}
              onClick={() => selectTab(item.id)}
              aria-current={activeTab === item.id ? 'page' : undefined}
            >
              <span className="product-match-visual__sidebar-icon" aria-hidden="true">
                {sidebarIcons[item.icon]}
              </span>
              <span className="product-match-visual__tab-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Window body */}
        <div className="product-match-visual__body">
          <div className="product-match-visual__layout">
{/* Sidebar */}
            <div className="product-match-visual__sidebar">
              <button
                type="button"
                className="product-match-visual__sidebar-brand"
                onClick={() => selectTab('overview')}
                aria-label="Go to overview"
              >
                <span className="product-match-visual__sidebar-logo" aria-hidden="true">G</span>
                <span className="product-match-visual__sidebar-name">Gradture</span>
              </button>
              <nav className="product-match-visual__sidebar-nav" aria-label="Simulated navigation">
                {SIDEBAR_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`product-match-visual__sidebar-item ${activeTab === item.id ? 'product-match-visual__sidebar-item--active' : ''}`}
                      onClick={() => selectTab(item.id)}
                      aria-current={activeTab === item.id ? 'page' : undefined}
                    >
                    <span className="product-match-visual__sidebar-icon" aria-hidden="true">
                      {sidebarIcons[item.icon]}
                    </span>
                    <span className="product-match-visual__sidebar-label">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Main content */}
            <motion.div
              key={activeTab}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="product-match-visual__content"
            >
              {activeTab === 'overview' ? (
                <div className="product-match-visual__panels">
                  <div className="product-match-visual__status-bar">
                    <span className="product-match-visual__status-text product-match-visual__status-text--success">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 6, verticalAlign: -1 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Best match found
                    </span>
                  </div>

                  <div className="product-match-visual__role">
                    <span className="product-match-visual__role-label">Recommended Role</span>
                    <span className="product-match-visual__role-title">{role}</span>
                  </div>

                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                    animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
                    className="product-match-visual__score"
                  >
                    <div className="product-match-visual__score-ring">
                      <svg viewBox="0 0 120 120" className="product-match-visual__score-svg">
                        <circle cx="60" cy="60" r={scoreRadius} fill="none" stroke="var(--visual-border)" strokeWidth="6" />
                        <motion.circle
                          cx="60" cy="60" r={scoreRadius} fill="none"
                          stroke="var(--color-primary)" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={scoreCircumference}
                          transform="rotate(-90 60 60)"
                          initial={reduceMotion ? false : { strokeDashoffset: scoreCircumference }}
                          animate={inView ? { strokeDashoffset: scoreCircumference - (matchScore / 100) * scoreCircumference } : { strokeDashoffset: scoreCircumference }}
                          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
                        />
                      </svg>
                      <div className="product-match-visual__score-text">
                        <span>{matchScore}</span>
                        <span className="product-match-visual__score-percent">%</span>
                      </div>
                    </div>
                    <div className="product-match-visual__score-label">Match Score</div>
                  </motion.div>

                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.4 }}
                    className="product-match-visual__skills"
                  >
                    <div className="product-match-visual__skills-header">
                      <span className="product-match-visual__skills-label">Skill Analysis</span>
                    </div>
                    <div className="product-match-visual__skills-list">
                      {skills.map((skill) => (
                        <div
                          key={skill.label}
                          className={`product-match-visual__skill ${skill.matched ? 'product-match-visual__skill--matched' : 'product-match-visual__skill--missing'}`}
                        >
<span className="product-match-visual__skill-icon">
                             {skill.matched ? (
                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                 <polyline points="20 6 9 17 4 12" />
                               </svg>
                             ) : (
                               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                 <line x1="12" y1="5" x2="12" y2="19" />
                                 <line x1="5" y1="12" x2="19" y2="12" />
                               </svg>
                             )}
                           </span>
                          <span className="product-match-visual__skill-label">{skill.label}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
                    className="product-match-visual__footer"
                  >
                    <p className="product-match-visual__insight-text">
                      Strong alignment with entry-level React roles. Your education and projects cover the core stack well — adding a Docker certificate and live project links would strengthen your candidacy for graduate programs.
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="product-match-visual__panels">
                  {renderPanel(activeTab)}
                </div>
              )}
            </motion.div>

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

        .product-match-visual__dot--red { background: var(--color-danger); }
        .product-match-visual__dot--yellow { background: var(--color-warning); }
        .product-match-visual__dot--green { background: var(--color-success); }

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
          border: 0;
          background: transparent;
          text-align: left;
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
          color: var(--color-primary-text);
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

        .product-match-visual__job-match {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .product-match-visual__job-match-text {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
        }

        .product-match-visual__job-match-bar {
          height: 4px;
          background: var(--visual-border);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-top: var(--space-1);
        }

        .product-match-visual__job-match-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--visual-accent), var(--visual-success));
          border-radius: var(--radius-full);
          transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
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

        /* Mobile tab bar (hidden on desktop where the sidebar shows) */
        .product-match-visual__tabs {
          display: none;
        }

        /* Panels */
        .product-match-visual__panels {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          width: 100%;
        }
        .product-match-visual__panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .product-match-visual__panel-title {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--visual-text);
        }
        .product-match-visual__panel-count {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          white-space: nowrap;
        }
        .product-match-visual__panel-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        /* Row base (all panel items are buttons) */
        .product-match-visual__job-item,
        .product-match-visual__match-item,
        .product-match-visual__app-item,
        .product-match-visual__msg-item {
          display: block;
          width: 100%;
          margin: 0;
          padding: var(--space-3);
          border: 1px solid var(--visual-border);
          border-radius: var(--radius-md);
          background: var(--visual-surface-muted);
          color: var(--visual-text);
          font: inherit;
          text-align: left;
          cursor: pointer;
          position: relative;
          transition: border-color var(--transition-fast), background-color var(--transition-theme), box-shadow var(--transition-fast), transform var(--transition-fast);
        }
        .product-match-visual__job-item:hover,
        .product-match-visual__match-item:hover,
        .product-match-visual__app-item:hover,
        .product-match-visual__msg-item:hover {
          border-color: var(--visual-accent);
          box-shadow: var(--visual-shadow);
        }
        .product-match-visual__job-item:active,
        .product-match-visual__match-item:active,
        .product-match-visual__app-item:active,
        .product-match-visual__msg-item:active {
          transform: translateY(1px);
        }
        .product-match-visual__job-item--selected,
        .product-match-visual__match-item--selected,
        .product-match-visual__app-item--selected,
        .product-match-visual__msg-item--selected {
          border-color: var(--visual-accent);
          background: var(--visual-accent-soft);
          box-shadow: 0 0 0 3px var(--visual-accent-soft);
        }
        .product-match-visual__job-item:focus-visible,
        .product-match-visual__match-item:focus-visible,
        .product-match-visual__app-item:focus-visible,
        .product-match-visual__msg-item:focus-visible,
        .product-match-visual__sidebar-item:focus-visible,
        .product-match-visual__tab:focus-visible {
          outline: 2px solid var(--visual-accent);
          outline-offset: 2px;
        }

        /* Job rows */
        .product-match-visual__job-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .product-match-visual__job-logo {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          background: var(--color-primary);
          color: var(--color-primary-text);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 700;
        }
        .product-match-visual__job-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .product-match-visual__job-title {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-match-visual__job-company {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
        }
        .product-match-visual__job-match {
          flex-shrink: 0;
        }
        .product-match-visual__job-match-text {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
        }
        .product-match-visual__job-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: var(--space-2);
          margin-top: var(--space-2);
        }
        .product-match-visual__job-salary {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text);
        }
        .product-match-visual__job-type,
        .product-match-visual__job-remote {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          color: var(--visual-text-muted);
        }
        .product-match-visual__row-action {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          font-size: 10px;
          font-weight: 700;
          color: var(--visual-accent);
        }

        /* Match rows */
        .product-match-visual__match-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .product-match-visual__match-avatar {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--visual-accent), var(--visual-accent-soft));
          color: var(--visual-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 700;
        }
        .product-match-visual__match-info {
          flex: 1;
          min-width: 0;
        }
        .product-match-visual__match-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .product-match-visual__match-role {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
        }
        .product-match-visual__match-right {
          flex-shrink: 0;
        }
        .product-match-visual__match-score {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-primary);
        }

        /* Application rows */
        .product-match-visual__app-header {
          display: flex;
          align-items: center;
        }
        .product-match-visual__app-company {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .product-match-visual__app-role {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          margin-top: 1px;
        }
        .product-match-visual__app-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: var(--space-2);
        }
        .product-match-visual__app-status {
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
        }
        .product-match-visual__app-date {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
        }

        /* Message rows */
        .product-match-visual__msg-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .product-match-visual__msg-item--unread {
          border-left: 3px solid var(--visual-accent);
        }
        .product-match-visual__msg-avatar {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: var(--radius-full);
          background: var(--visual-surface-elevated);
          border: 1px solid var(--visual-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text);
        }
        .product-match-visual__msg-body {
          flex: 1;
          min-width: 0;
        }
        .product-match-visual__msg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
        }
        .product-match-visual__msg-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .product-match-visual__msg-time {
          font-size: 10px;
          color: var(--visual-text-muted);
          flex-shrink: 0;
        }
        .product-match-visual__msg-preview {
          margin: 2px 0 0;
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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

          .product-match-visual__tabs {
            display: flex;
            gap: var(--space-2);
            padding: var(--space-3) var(--space-4);
            border-bottom: 1px solid var(--visual-border);
            background: var(--visual-surface-muted);
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .product-match-visual__tab {
            display: inline-flex;
            align-items: center;
            gap: var(--space-2);
            flex-shrink: 0;
            padding: var(--space-2) var(--space-3);
            border-radius: var(--radius-full);
            border: 1px solid var(--visual-border);
            background: var(--visual-surface);
            color: var(--visual-text-secondary);
            font-size: var(--text-xs);
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
          }

          .product-match-visual__tab--active {
            background: var(--visual-accent-soft);
            border-color: var(--visual-accent);
            color: var(--visual-accent);
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
