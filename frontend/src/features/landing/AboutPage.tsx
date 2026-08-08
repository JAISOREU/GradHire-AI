import { PageHeader } from '../../components/PageHeader';

export const AboutPage = () => (
  <div className="page fade-in">
    <PageHeader title="About GradHire AI" subtitle="We help fresh graduates and students discover opportunities and help employers find great talent." />

    <section className="section">
      <div className="grid-2">
        <div className="card">
          <h3 className="card__title">Our mission</h3>
          <p className="card__subtitle">
            Reduce the time-to-match between students and employers through intelligent, AI-assisted workflows.
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
  </div>
);
