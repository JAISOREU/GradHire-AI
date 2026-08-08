import { useAsync } from '../../core/hooks/useAsync';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';

export const EmployerManageJobsPage = () => {
  const { data: jobs, loading, reload } = useAsync(() => jobsApi.listForEmployer(), []);

  const handleArchive = async (id: string) => {
    try {
      await jobsApi.archive(id);
      reload();
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title">Manage jobs</h1>
      <p className="card__subtitle card__subtitle card__subtitle--mt">Edit, close, or archive your listings.</p>

      <div className="list-container">
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : jobs && jobs.length > 0 ? (
          <div className="list">
            {jobs.map((job) => (
              <article key={job.id} className="list-item">
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{job.title}</h3>
                    <div className="list-item__meta">
                      <span>{job.company}</span>
                      <span>{job.location}</span>
                      <Badge kind={resolveBadgeKind(job.status)}>{job.status}</Badge>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => void handleArchive(job.id)}>Archive</Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon="🗂️" title="No jobs posted" text="Post a job to start receiving applicants." />
        )}
      </div>
    </div>
  );
};


