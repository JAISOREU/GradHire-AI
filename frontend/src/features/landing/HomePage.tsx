import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { MorphingText } from '../../components/MorphingText';

const FEATURES = [
  { icon: '🤖', title: 'AI-guided matches', text: 'Get career recommendations tailored to your focus area.' },
  { icon: '📄', title: 'Resume parsing', text: 'Upload your resume and auto-fill your profile instantly.' },
  { icon: '🗂️', title: 'Job & internship hub', text: 'Browse hiring roles and internships from top companies.' },
  { icon: '🔔', title: 'Real-time notifications', text: 'Never miss an application update or interview invite.' },
];

export const HomePage = () => (
  <div className="page fade-in">
    <section className="hero-wrapper hero-glow">
      <div className="app-hero">
        <div className="text-3d">
          <MorphingText text="GradHire AI" as="span" />
        </div>
        <p className="hero-subtitle morph-word" style={{ animationDelay: '0.3s' }}>
          Build a stronger profile and let AI connect you with the right opportunities.
        </p>
        <div className="hero-actions" style={{ animationDelay: '0.5s' }}>
          <Link to="/jobs"><Button>Browse jobs</Button></Link>
          <Link to="/register"><Button variant="secondary">Create account</Button></Link>
        </div>
      </div>
    </section>

    <section className="section">
      <h2 className="section-title">Why GradHire?</h2>
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
  </div>
);
