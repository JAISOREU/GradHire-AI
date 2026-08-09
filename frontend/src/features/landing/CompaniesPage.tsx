import { Link } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { companiesApi } from '../../core/api/endpoints/companies';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';

export const CompaniesPage = () => {
  const { data: companies, loading } = useAsync(() => companiesApi.list(), []);

  return (
    <div className="page fade-in">
      <PageHeader title="Featured companies" subtitle="Explore organizations hiring on Gradture." />

      <div className="list-container">
        {loading ? (
          <LoadingState label="Loading companies…" />
        ) : companies && companies.length > 0 ? (
          <div className="list">
            {companies.map((c) => (
              <Link key={c.id} to={`/companies/${encodeURIComponent(c.name)}`} className="list-item card--hover link-reset">
                <div className="list-item__head">
                  <div className="list-item__head">
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
  );
};
