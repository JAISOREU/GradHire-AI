import { useAsync } from '../../core/hooks/useAsync';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';

export const StudentRecommendedJobsPage = () => {
  const { data: recommendationResult, loading: aiLoading } = useAsync(() => recommendationsApi.ai(6), []);

  const ready = recommendationResult?.ready ?? false;
  const missing = recommendationResult?.missing ?? [];
  const recommendations = recommendationResult?.recommendations ?? [];

  const mappedRecommendations = recommendations.map((rec) => ({
    id: rec.id,
    title: rec.title,
    company: '',
    location: '',
    type: rec.type as 'HIRING' | 'INTERNSHIP',
    matchScore: Math.round(rec.score * 100),
    description: rec.description,
  }));

  const hasCompany = mappedRecommendations.some((j) => j.company);
  const hasLocation = mappedRecommendations.some((j) => j.location);

  const missingSectionLinks: Record<string, { to: string; label: string }> = {
    education: { to: '/student/account', label: 'Add education' },
    skills: { to: '/student/account', label: 'Add skills' },
    experience: { to: '/student/account', label: 'Add experience' },
    resume: { to: '/student/resume', label: 'Upload resume' },
    career_preferences: { to: '/student/settings', label: 'Set preferences' },
  };

  return (
    <div className="page fade-in">
      <PageHeader
        title="Recommended jobs"
        subtitle={ready ? 'AI-matched roles based on your profile.' : 'Complete your profile to unlock personalized recommendations.'}
      />

      <div className="list-container">
        {aiLoading && ready ? (
          <LoadingState label="Loading recommendations…" />
        ) : ready && mappedRecommendations.length > 0 ? (
          mappedRecommendations.map((job) => (
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
        ) : ready ? (
          <EmptyState icon="✨" title="No recommendations yet" text="We could not find matching roles right now. Try broadening your profile or check back later." action={<Link to="/student/account"><Button size="sm">Update profile</Button></Link>} />
        ) : (
          <div className="card section--mt">
            <EmptyState
              icon="🎯"
              title="Complete your profile to receive personalized job recommendations"
              text="Add your education, skills, and experience so we can match you with the right opportunities."
            />
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {missing.map((key) => {
                const link = missingSectionLinks[key];
                if (!link) return null;
                return (
                  <Link key={key} to={link.to} className="btn btn--secondary btn--sm" style={{ alignSelf: 'flex-start' }}>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
