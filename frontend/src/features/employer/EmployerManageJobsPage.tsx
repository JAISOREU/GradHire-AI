import { Link } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import { PageHeader } from '../../components/PageHeader';
import { useState } from 'react';

export const EmployerManageJobsPage = () => {
  const { data: jobs, loading, reload } = useAsync(() => jobsApi.listForEmployer(), []);
  const [archiveError, setArchiveError] = useState('');

  const handleArchive = async (id: string) => {
    setArchiveError('');
    try {
      await jobsApi.archive(id);
      reload();
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : 'Failed to archive job');
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader
        title="Manage jobs"
        subtitle="Edit, close, or archive your listings."
        action={<Link to="/employer/post-job"><Button size="sm">+ Post job</Button></Link>}
      />

      <div className="section--mt">
        {archiveError && <div className="message message--error" role="alert">{archiveError}</div>}
        {loading ? (
          <Skeleton variant="table" lines={5} />
        ) : jobs && jobs.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Workplace</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                  <td>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-secondary text-sm">{job.company || job.companyRef?.name || 'Not specified'}</div>
                  </td>
                  <td className="text-sm">{job.type}</td>
                  <td className="text-sm">{job.location || 'Remote'}</td>
                    <td className="text-sm">{job.workplaceType}</td>
                    <td><Badge kind={resolveBadgeKind(job.status)}>{job.status}</Badge></td>
                    <td className="text-secondary text-sm">{job.publishedAt ? new Date(job.publishedAt).toLocaleDateString() : new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-1">
                        <Link to={`/jobs/${job.id}`}><Button variant="ghost" size="sm">View</Button></Link>
                        <Link to={`/employer/edit-job/${job.id}`}><Button variant="ghost" size="sm">Edit</Button></Link>
                        <Link to={`/employer/applicants?jobId=${job.id}`}><Button variant="ghost" size="sm">Applicants</Button></Link>
                        {job.status !== 'ARCHIVED' && (
                          <Button variant="danger" size="sm" onClick={() => void handleArchive(job.id)}>Archive</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="🗂️" title="No jobs posted" text="Post your first opening to start receiving applicants." action={<Link to="/employer/post-job"><Button size="sm">Post a job</Button></Link>} />
        )}
      </div>
    </div>
  );
};
