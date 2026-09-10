import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { PhosphorIcon, type PhosphorIconName } from '../../components/PhosphorIcon';

const VALUE_PROPS: Array<{ icon: PhosphorIconName; title: string; text: string }> = [
  {
    icon: 'Brain',
    title: 'Match-first design',
    text: 'Skill-based matching surfaces the right roles fast, so you spend less time scrolling and more time applying.',
  },
  {
    icon: 'GraduationCap',
    title: 'Made for graduates',
    text: 'Built around the realities of fresh graduates — internships, entry-level roles, and honest guidance on what is realistic.',
  },
  {
    icon: 'Handshake',
    title: 'Two sides, one platform',
    text: 'Job seekers browse and apply; employers post roles, screen candidates, and build pipelines in one connected workspace.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Reliable by default',
    text: 'A clean, secure, and responsive experience on every device — engineered with modern practices and tested before release.',
  },
];

export const AboutPage = () => (
  <div className="public-page">
    <section className="section-full">
      <div className="section-inner">
        <div className="public-hero public-hero--center">
          <PageHeader
            title="About Gradture"
            subtitle="Gradture is where emerging talent meets real opportunity — a matching-first job platform built for graduates, students, and the employers who want to hire them."
          />
          <div className="public-hero__chips">
            <span className="public-hero__chip"><PhosphorIcon name="Brain" size={14} /> AI-powered matching</span>
            <span className="public-hero__chip"><PhosphorIcon name="GraduationCap" size={14} /> Graduate-first</span>
            <span className="public-hero__chip"><PhosphorIcon name="Handshake" size={14} /> Built for both sides</span>
          </div>
          <div className="public-hero__actions">
            <Link to="/jobs">
              <Button>Browse jobs</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Create an account</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="section-full">
      <div className="section-inner">
        <section className="section">
          <div className="grid-2">
            <div className="card">
              <h2 className="card__title">Our mission</h2>
              <p className="card__subtitle">
                Reduce the time-to-match between talent and employers through intelligent, honest workflows — no guessing games, no dead ends, just the right fit for both sides.
              </p>
            </div>
            <div className="card">
              <h2 className="card__title">Our approach</h2>
              <p className="card__subtitle">
                A clean, secure, and scalable platform built on modern engineering principles — with a strong focus on user experience and the needs of early-career talent.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>

    <section className="section-full">
      <div className="section-inner">
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">What we bring</h2>
            </div>
          </div>
          <div className="value-grid">
            {VALUE_PROPS.map((v) => (
              <div key={v.title} className="card value-card">
                <div className="value-card__icon" aria-hidden="true">
                  <PhosphorIcon name={v.icon} size={22} weight="duotone" />
                </div>
                <h3 className="card__title">{v.title}</h3>
                <p className="card__subtitle">{v.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>

    <section className="section-full">
      <div className="section-inner">
        <section className="section">
          <div className="card text-center">
            <h2 className="card__title">Built with care</h2>
            <p className="card__subtitle">
              Gradture was designed and built by a single developer who believes great tools can come from focused, thoughtful work. Every part of the platform — from the matching engine to the responsive interface — was crafted to keep things simple, reliable, and genuinely useful for both talent and employers.
            </p>
            <p className="card__subtitle mt-3">
              You can view my background and experience here:{' '}
              <a href="https://drive.google.com/file/d/1s-B5VpM5q9Xp5vX9xYzZ8w7x6c5v4b3n2m1/view" target="_blank" rel="noopener noreferrer">My CV</a>
            </p>
          </div>
        </section>
      </div>
    </section>

    <section className="section-full">
      <div className="section-inner">
        <section className="section">
          <div className="cta-band">
            <h2 className="cta-band__title">Ready to find your match?</h2>
            <p className="cta-band__text">
              Create a free account and start discovering opportunities tailored to your skills.
            </p>
            <div className="cta-band__actions">
              <Link to="/register">
                <Button>Create an account</Button>
              </Link>
              <Link to="/jobs">
                <Button variant="secondary">Explore jobs</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
);