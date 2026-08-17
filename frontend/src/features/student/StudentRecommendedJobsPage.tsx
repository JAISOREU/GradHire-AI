import { useAsync } from '../../core/hooks/useAsync';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { studentsApi } from '../../core/api/endpoints/students';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';

export const StudentRecommendedJobsPage = () => {
  const { data: aiJobs, loading: aiLoading } = useAsync(() => recommendationsApi.ai(6), []);
  const { data: readiness } = useAsync(() => studentsApi.getAiReadiness(), []);

  const profileComplete = readiness?.ready ?? false;

  const recommendations = aiJobs && aiJobs.length > 0
    ? aiJobs.map((rec) => ({
        id: rec.id,
        title: rec.title,
        company: '',
        location: '',
        type: rec.type as 'HIRING' | 'INTERNSHIP',
        matchScore: Math.round(rec.score * 100),
        description: rec.description,
      }))
    : [];

  const hasCompany = recommendations.some((j) => j.company);
  const hasLocation = recommendations.some((j) => j.location);

  return (
    <div className="page fade-in">
      <PageHeader
        title="Recommended jobs"
        subtitle={profileComplete ? 'AI-matched roles based on your profile.' : 'Complete your profile to unlock personalized recommendations.'}
      />

      <div className="list-container">
        {aiLoading && profileComplete ? (
          <LoadingState label="Loading recommendations…" />
        ) : recommendations.length > 0 ? (
          recommendations.map((job) => (
            <Link key={job.id} to={`/jobs/${job.id}`} className="list-item card--hover link-reset">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title">{job.title}</h3>
                  <div className="list-item__meta">
                    {hasCompany && <span>{job.company || 'Not specified'}</span>}
                    {hasLocation && <span>{job.location || 'Remote'}</span>}
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
        ) : profileComplete ? (
          <EmptyState icon="✨" title="No recommendations yet" text="Complete your profile to get AI-matched roles." action={<Link to="/student/account"><Button size="sm">Update profile</Button></Link>} />
        ) : (
          <EmptyState
            icon="🎯"
            title="Complete your profile to receive personalized job recommendations"
            text="Add your education, skills, and experience so we can match you with the right opportunities."
            action={<Link to="/student/account"><Button size="sm">Complete profile</Button></Link>}
          />
        )}
      </div>
    </div>
  );
};
