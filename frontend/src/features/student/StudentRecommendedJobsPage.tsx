import { useAsync } from '../../core/hooks/useAsync';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';

export const StudentRecommendedJobsPage = () => {
  const { data: aiJobs, loading: aiLoading } = useAsync(() => recommendationsApi.ai(6), []);
  const { data: allJobs } = useAsync(() => jobsApi.list(''), []);

  const jobs = aiJobs && aiJobs.length > 0
    ? aiJobs.map((rec) => ({
        id: rec.id,
        title: rec.title,
        company: '',
        location: '',
        type: rec.type as 'HIRING' | 'INTERNSHIP',
        matchScore: Math.round(rec.score * 100),
        description: rec.description,
      }))
    : (allJobs ?? [])
        .slice()
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);

  return (
    <div className="page fade-in">
      <PageHeader title="Recommended jobs" subtitle="AI-matched roles based on your focus area." />

      <div className="list-container">
        {aiLoading ? (
          <LoadingState label="Loading recommendations…" />
        ) : jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="list-item card--hover link-reset">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{job.title}</h3>
                  <div className="list-item__meta">
                    <span>{job.company}</span>
                    <span>{job.location}</span>
                    <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : 'Hiring'}</Badge>
                  </div>
                </div>
              </div>
              <div className="match-score" role="progressbar" aria-valuenow={job.matchScore} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${job.matchScore}% match score`} aria-label={`Match score ${job.matchScore}%`}>
                <div className="match-score__top"><span>Match score</span><strong>{job.matchScore}%</strong></div>
                <div className="match-score__track"><div className="match-score__fill" style={{ width: `${job.matchScore}%` }} /></div>
              </div>
            </Link>
          ))
        ) : (
          <EmptyState icon="✨" title="No recommendations yet" text="Complete your profile to get AI-matched roles." />
        )}
      </div>
    </div>
  );
};
