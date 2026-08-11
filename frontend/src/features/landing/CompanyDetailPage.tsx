import { Link, useParams } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { companiesApi } from '../../core/api/endpoints/companies';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { PageHeader } from '../../components/PageHeader';

export const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const companyName = decodeURIComponent(id ?? '');
  const { data: company, loading } = useAsync(() => companiesApi.getById(companyName), [companyName]);

  return (
    <div className="page fade-in">
      <Link to="/companies" className="back-link">← Back to companies</Link>
      {loading ? (
        <div className="card section--mt">
          <LoadingState label="Loading company…" />
        </div>
      ) : company ? (
        <>
          <div className="card section--mt">
            <PageHeader title={company.name} subtitle={`${company.industry} · ${company.location}`} />
            {company.description && (
              <p className="card__subtitle section--mt text-pre-wrap">{company.description}</p>
            )}
          </div>

          <div className="section--mt">
            <h2 className="section-title">Open roles</h2>
            {company.jobs && company.jobs.length > 0 ? (
              <div className="list">
                {company.jobs.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="list-item card--hover link-reset">
                    <div className="list-item__head">
                      <div>
                        <h3 className="list-item__title">{job.title}</h3>
                        <div className="list-item__meta">
                          <span>{job.location}</span>
                          <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                        </div>
                      </div>
                      <span className="list-item__action">View →</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState icon="💼" title="No open roles" text={`There are no open roles at ${company.name} right now.`} />
            )}
          </div>
        </>
      ) : (
        <div className="section--mt">
          <EmptyState icon="🏢" title="Company not found" text="This company may not be listed yet." />
        </div>
      )}
    </div>
  );
};
