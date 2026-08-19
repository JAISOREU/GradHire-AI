import { useAsync } from '../../core/hooks/useAsync';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { useState } from 'react';

export const StudentRecommendedJobsPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { data: recommendationResult, loading: aiLoading, error, reload } = useAsync(() => recommendationsApi.ai(6), []);

  const ready = recommendationResult?.ready ?? false;
  const missing = recommendationResult?.missing ?? [];
  const recommendations = recommendationResult?.recommendations ?? [];
  const fallback = recommendationResult?.fallback ?? false;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  };

  const mappedRecommendations = recommendations.map((rec) => ({
    id: rec.id,
    title: rec.title,
    company: rec.company || 'Not specified',
    location: rec.location || 'Remote',
    type: rec.type,
    matchScore: Math.round(rec.score * 100),
    description: rec.description,
    matchReasons: rec.matchReasons ?? [],
    matchedSkills: rec.matchedSkills ?? [],
    matchedEducation: rec.matchedEducation ?? [],
    matchedExperience: rec.matchedExperience ?? [],
  }));

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
        subtitle={
          fallback
            ? 'Showing best-match roles based on your profile.'
            : ready
              ? 'AI-matched roles based on your profile.'
              : 'Complete your profile to unlock personalized recommendations.'
        }
        action={
          ready ? (
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing || aiLoading}>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </Button>
          ) : null
        }
      />

      {error && (
        <div className="message message--error" role="alert">
          {(error as any)?.message ?? 'Failed to load recommendations.'} <button onClick={reload} className="link">Retry</button>
        </div>
      )}

      {fallback && ready && (
        <div className="alert alert--info" style={{ marginBottom: '1rem' }}>
          Recommendations are based on profile matching. AI enrichment will be applied when available.
        </div>
      )}

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
                    <span>{job.company}</span>
                    <span>{job.location}</span>
                    <Badge kind={resolveBadgeKind(job.type)}>{job.type === 'INTERNSHIP' ? 'Internship' : job.type?.toLowerCase().replace('_', ' ') ?? 'Hiring'}</Badge>
                  </div>
                </div>
                <div className="match-score" role="progressbar" aria-valuenow={job.matchScore} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${job.matchScore}% match score`} aria-label={`Match score ${job.matchScore}%`}>
                  <div className="match-score__top"><span>Match score</span><strong>{job.matchScore}%</strong></div>
                  <div className="match-score__track"><div className="match-score__fill" style={{ width: `${job.matchScore}%` }} /></div>
                </div>
              </div>
              {(job.matchReasons.length > 0 || job.matchedSkills.length > 0) && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.matchedSkills.slice(0, 4).map((skill) => (
                    <span key={skill} className="badge badge--primary" style={{ fontSize: '0.75rem' }}>{skill}</span>
                  ))}
                  {job.matchReasons.slice(0, 2).map((reason, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{reason}</span>
                  ))}
                </div>
              )}
            </Link>
          ))
        ) : ready ? (
          <EmptyState
            icon="✨"
            title="No recommendations yet"
            text="We could not find matching roles right now. Try broadening your profile or check back later."
            action={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/student/account"><Button size="sm">Update profile</Button></Link>
                <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing || aiLoading}>
                  {refreshing ? 'Refreshing…' : 'Try again'}
                </Button>
              </div>
            }
          />
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
                  <Link key={key} to={link.to} style={{ alignSelf: 'flex-start', textDecoration: 'none' }}>
                    <Button variant="secondary" size="sm">{link.label}</Button>
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
