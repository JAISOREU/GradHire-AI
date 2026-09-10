import { Link } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { useAuth } from '../../core/auth/AuthContext';
import { companiesApi } from '../../core/api/endpoints/companies';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { PhosphorIcon } from '../../components/PhosphorIcon';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

type CompanyListItem = {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  logo?: string;
};

export const CompaniesPage = () => {
  const { isAuthenticated } = useAuth();
  const preview = !isAuthenticated;
  const { data: companies, loading } = useAsync(() => companiesApi.list(1, preview ? 3 : 20), []);

  const industries = Array.from(new Set((companies ?? []).map((c) => c.industry).filter((i): i is string => !!i))).slice(0, 4);

  return (
    <div className="public-page">
      <section className="section-full">
        <div className="section-inner">
          <div className="public-hero">
            <PageHeader
              title="Featured companies"
              subtitle="Explore the organizations hiring on Gradture — and the opportunities waiting inside them."
            />
            {industries.length > 0 && (
              <div className="public-hero__chips">
                {industries.map((i) => (
                  <span key={i} className="public-hero__chip"><PhosphorIcon name="Building" size={14} /> {i}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {preview && (
        <section className="section-full">
          <div className="section-inner">
            <div className="card p-4 bg-primary-soft border border-primary">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="m-0 font-semibold text-primary">
                    Unlock full access
                  </p>
                  <p className="text-sm mt-1 text-text-secondary">
                    Sign up to browse all companies, follow organizations, and get personalized updates.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to="/login"><Button size="sm" variant="secondary">Log in</Button></Link>
                  <Link to="/register"><Button size="sm">Create account</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="section-full">
        <div className="section-inner">
          {loading ? (
            <LoadingState label="Loading companies…" />
          ) : companies && companies.length > 0 ? (
            <div className="company-grid">
              {companies.map((c: CompanyListItem) => (
                <Link
                  key={c.id}
                  to={`/companies/${encodeURIComponent(c.name)}`}
                  className="card card--hover link-reset company-card"
                >
                  <div className="company-card__head">
                    <span className="company-card__logo" aria-hidden="true">
                      {c.logo ? <img src={c.logo} alt="" /> : initialsOf(c.name)}
                    </span>
                    <div>
                      <div className="company-card__name">{c.name}</div>
                      <div className="company-card__meta">
                        {c.industry && <span className="badge">{c.industry}</span>}
                        {c.location && <span className="company-card__location"><PhosphorIcon name="MapPin" size={14} /> {c.location}</span>}
                      </div>
                    </div>
                  </div>
                  {c.description && (
                    <p className="company-card__desc">{c.description}</p>
                  )}
                  <div className="company-card__footer">
                    <span className="text-sm text-text-tertiary">View company</span>
                    <span className="list-item__action">View <PhosphorIcon name="ArrowRight" size={14} weight="bold" /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState icon="Building" title="No companies yet" text="Check back soon." />
          )}
        </div>
      </section>
    </div>
  );
};