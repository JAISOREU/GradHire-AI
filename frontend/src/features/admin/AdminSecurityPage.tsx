import { PhosphorIcon } from '../../components/PhosphorIcon';

const COMPLIANCE_BADGES = ['SOC 2', 'GDPR', 'CCPA', 'HIPAA'];

const PROTECTION_STEPS = [
  { title: 'Role-based access control', text: 'Admins, employers, and students only see what their role permits.' },
  { title: 'Encryption at rest and in transit', text: 'TLS for all traffic; sensitive records stored encrypted.' },
  { title: 'Controlled data access', text: 'All requests are cookie-authenticated with CSRF protection.' },
  { title: 'Audit logging', text: 'Platform actions are recorded in the audit log for every role.' },
  { title: 'Private by default', text: 'Profiles and applications are only visible to intended parties.' },
];

const SETTINGS = [
  { label: 'Maintenance mode', status: 'Disabled', healthy: true },
  { label: 'Registration', status: 'Open', healthy: true },
  { label: 'Session policy', status: 'Token refresh + 30s timeout', healthy: true },
  { label: 'Offline gate', status: 'Fail-fast dedupe enabled', healthy: true },
];

export const AdminSecurityPage = () => {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const score = 92;

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Security</h1>
      <p className="card__subtitle card__subtitle--mt">Platform security posture, compliance, and data protection.</p>

      <div className="resume-intelligence section--mt">
        <div className="resume-intelligence__ring" aria-label={`Security score ${score}%`}>
          <svg viewBox="0 0 100 100" className="resume-intelligence__svg">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-surface-muted)" strokeWidth="10" />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - (score / 100) * circumference}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="resume-intelligence__number">{score}%</div>
        </div>
        <div className="resume-intelligence__body">
          <div className="resume-intelligence__header">
            <span className="match-result-card__tag"><PhosphorIcon name="Shield" size={11} weight="fill" /> Secure</span>
            <span className="resume-intelligence__title">Security posture</span>
          </div>
          <p className="text-muted text-sm">GradTure enforces authentication, authorization, and data protection across every role.</p>
          <div className="resume-intelligence__metrics">
            {COMPLIANCE_BADGES.map((badge) => (
              <span key={badge} className="badge badge--card-skill">{badge}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid--2 section--mt">
        <div className="card">
          <h2 className="card__title">Data protection</h2>
          <p className="card__subtitle">How candidate and employer data is handled.</p>
          <ul className="list">
            {PROTECTION_STEPS.map((step, idx) => (
              <li key={step.title} className="list-item">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{String(idx + 1).padStart(2, '0')} · {step.title}</h3>
                    <p className="text-muted text-sm mt-1">{step.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="card__title">Platform controls</h2>
          <p className="card__subtitle">Current security-relevant settings.</p>
          <div className="stack mt-4">
            {SETTINGS.map((setting) => (
              <div key={setting.label} className="flex items-center justify-between gap-4 py-2 border-t border-border">
                <span className="text-sm font-medium">{setting.label}</span>
                <span className="text-sm text-success">{setting.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};