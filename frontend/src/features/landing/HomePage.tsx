import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { AnimatedLogo } from '../../components/AnimatedLogo';

const FEATURES = [
  { icon: '🤖', title: 'AI-guided matches', text: 'Get career recommendations tailored to your focus area.' },
  { icon: '📄', title: 'Resume parsing', text: 'Upload your resume and auto-fill your profile instantly.' },
  { icon: '🗂️', title: 'Job & internship hub', text: 'Browse hiring roles and internships from top companies.' },
  { icon: '🔔', title: 'Real-time notifications', text: 'Never miss an application update or interview invite.' },
  { icon: '💬', title: 'Direct messaging', text: 'Chat with employers and get answers faster.' },
  { icon: '📊', title: 'Application tracking', text: 'See every application status in one clean dashboard.' },
  { icon: '🎯', title: 'Skill matching', text: 'We match you to roles based on real skills, not just keywords.' },
  { icon: '🔒', title: 'Privacy first', text: 'Your data stays secure with encrypted storage and access controls.' },
];

const STEPS = [
  { title: 'Create account', text: 'Sign up as a student or employer in under a minute.' },
  { title: 'Build profile', text: 'Add your details, upload your resume, or publish your company.' },
  { title: 'Get matched', text: 'AI suggests the best jobs and candidates automatically.' },
  { title: 'Move forward', text: 'Apply, schedule interviews, and track progress.' },
];

export const HomePage = () => (
  <div className="page fade-in">
    <section className="hero-wrapper hero-glow">
      <div className="app-hero">
        <AnimatedLogo size={64} showText={true} />
        <p className="hero-subtitle" style={{ animationDelay: '0.3s' }}>
          Build a stronger profile and let AI connect you with the right opportunities.
        </p>
        <div className="hero-actions" style={{ animationDelay: '0.5s' }}>
          <Link to="/jobs"><Button>Browse jobs</Button></Link>
          <Link to="/register"><Button variant="secondary">Create account</Button></Link>
        </div>
      </div>
    </section>

    <section className="section">
      <h2 className="section-title">Why Gradture?</h2>
      <div className="grid-4">
        {FEATURES.map((f, index) => (
          <div key={f.title} className={`feature-card mask-reveal mask-reveal--delay-${index + 1}`}>
            <div className="feature-icon" aria-hidden="true">{f.icon}</div>
            <h3 className="card__title">{f.title}</h3>
            <p className="card__subtitle">{f.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section">
      <h2 className="section-title">How it works</h2>
      <div className="grid-4">
        {STEPS.map((s, index) => (
          <div key={s.title} className={`feature-card mask-reveal mask-reveal--delay-${index + 1}`}>
            <div className="feature-icon" aria-hidden="true">{index + 1}</div>
            <h3 className="card__title">{s.title}</h3>
            <p className="card__subtitle">{s.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="section">
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginBottom: 'var(--space-3)' }}>Ready to get started?</h2>
        <p className="card__subtitle" style={{ marginBottom: 'var(--space-4)' }}>
          Join students and employers already using Gradture AI.
        </p>
        <div style={{ display: 'inline-flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register"><Button>Create account</Button></Link>
          <Link to="/jobs"><Button variant="secondary">Browse jobs</Button></Link>
        </div>
      </div>
    </section>
  </div>
);
