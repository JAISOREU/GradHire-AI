import { PageHeader } from '../../components/PageHeader';

export const AboutPage = () => (
  <div className="page fade-in">
    <PageHeader title="About Gradture AI" subtitle="We help talent discover opportunities and help employers find great people." />

    <section className="section">
      <div className="grid-2">
        <div className="card">
          <h3 className="card__title">Our mission</h3>
          <p className="card__subtitle">
            Reduce the time-to-match between talent and employers through intelligent, AI-assisted workflows.
          </p>
        </div>
        <div className="card">
          <h3 className="card__title">Our approach</h3>
          <p className="card__subtitle">
            A clean, secure, and scalable platform built on modern engineering principles — with a strong focus on user experience.
          </p>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="card text-center">
        <h3 className="card__title">Built with care</h3>
        <p className="card__subtitle">
          Gradture AI was designed and built by a single developer who believes great tools can come from focused, thoughtful work. Every part of the platform — from the AI matching engine to the responsive interface — was crafted to keep things simple, reliable, and genuinely useful for both talent and employers.
        </p>
        <p className="card__subtitle mt-3">
          You can view my background and experience here:{' '}
          <a href="https://drive.google.com/file/d/1s-B5VpM5q9Xp5vX9xYzZ8w7x6c5v4b3n2m1/view" target="_blank" rel="noreferrer">My CV</a>
        </p>
      </div>
    </section>
  </div>
);
