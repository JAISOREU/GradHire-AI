import { useState } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { useAsync } from '../../core/hooks/useAsync';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { MorphingText } from '../../components/MorphingText';
import { PageHeader } from '../../components/PageHeader';
import type { JobType } from '../../core/types';

export const JobListPage = () => {
  const [type, setType] = useState<JobType | ''>('');
  const { data: jobs, loading } = useAsync(() => jobsApi.list(type), [type]);

  return (
    <div className="page fade-in">
      <PageHeader
        title={<MorphingText text="Job & internship listings" as="span" />}
        action={
          <div className="filter-bar">
            <label className="form-label" htmlFor="job-type-filter">Type:</label>
            <select
              id="job-type-filter"
              className="select select--auto"
              value={type}
              onChange={(e) => setType(e.target.value as JobType | '')}
            >
              <option value="">All</option>
              <option value="HIRING">Hiring</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
        }
      />

      <div className="list-container">
        {loading ? (
          <LoadingState label="Loading opportunities…" />
        ) : jobs && jobs.length > 0 ? (
          <div className="list">
            {jobs.map((job, index) => (
              <Link key={job.id} to={`/jobs/${job.id}`} className={`list-item card--hover link-reset mask-reveal mask-reveal--delay-${Math.min(index + 1, 4)}`}>
                <div className="list-item__head">
                  <div>
                    <h3 className="list-item__title">{job.title}</h3>
                    <div className="list-item__meta">
                      <span>{job.company}</span>
                      <span>{job.location}</span>
                      <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                      {job.origin === 'AGGREGATED_EXTERNAL' && (
                        <Badge kind="warning">Aggregated</Badge>
                      )}
                    </div>
                  </div>
                  <span className="list-item__action">View →</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState icon="💼" title="No jobs found" text="Try a different filter or check back later." />
        )}
      </div>
    </div>
  );
};
