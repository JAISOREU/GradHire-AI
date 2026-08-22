import { Link } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { useAuth } from '../../core/auth/AuthContext';
import { companiesApi } from '../../core/api/endpoints/companies';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';

export const CompaniesPage = () => {
  const { isAuthenticated } = useAuth();
  const preview = !isAuthenticated;
  const { data: companies, loading } = useAsync(() => companiesApi.list(1, preview ? 3 : 20), []);

  return (
    <div className="public-page">
      <section className="section-full">
        <div className="section-inner">
          <PageHeader
            title="Featured companies"
            subtitle="Explore organizations hiring on Gradture."
            action={
              preview ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Showing a preview
                  </span>
                  <Link to="/register">
                    <Button size="sm">Sign up to see all</Button>
                  </Link>
                </div>
              ) : undefined
            }
          />
        </div>
      </section>

      {preview && (
        <section className="section-full">
          <div className="section-inner">
            <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--color-primary-soft, #eef2ff)', border: '1px solid var(--color-primary, #4f46e5)' }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-primary, #4f46e5)' }}>
                    Unlock full access
                  </p>
                  <p className="text-sm" style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-secondary)' }}>
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
          <div className="list-container">
            {loading ? (
              <LoadingState label="Loading companies…" />
            ) : companies && companies.length > 0 ? (
              <div className="list">
                 {companies.map((c) => (
                  <Link key={c.id} to={`/companies/${encodeURIComponent(c.name)}`} className="list-item card--hover link-reset">
                    <div className="list-item__head">
                      <div>
                        <div>
                          <h3 className="list-item__title">{c.name}</h3>
                          <div className="list-item__meta">
                            <span>{c.industry}</span>
                            <span>{c.location}</span>
                          </div>
                        </div>
                      </div>
                      <span className="list-item__action">View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="🏢" title="No companies yet" text="Check back soon." />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
