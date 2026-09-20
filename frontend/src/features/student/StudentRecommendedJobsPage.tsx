import { Alert } from '../../components/Alert';
import { useAsync } from '../../core/hooks/useAsync';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { MatchResultCard } from './MatchResultCard';
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
    score: rec.score,
    workplaceType: rec.workplaceType,
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
              ? 'Showing your strongest matched roles.'
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
        <Alert>
          {error ?? 'Failed to load recommendations.'} <button onClick={reload} className="link">Retry</button>
        </Alert>
      )}

      {fallback && ready && (
        <div className="alert alert--info mb-4">
          Recommendations are based on your profile signals. AI enrichment will be applied when available.
        </div>
      )}

      <div className="list-container">
        {aiLoading && ready ? (
          <LoadingState label="Loading recommendations…" />
        ) : ready && mappedRecommendations.length > 0 ? (
          <div className="list">
            {mappedRecommendations.map((job) => (
              <MatchResultCard key={job.id} job={job} />
            ))}
          </div>
        ) : ready ? (
          <EmptyState
            icon="Sparkle"
            title="No recommendations yet"
            text="We couldn't find matching roles right now. Broaden your profile or check back later."
              action={
                <div className="flex flex-col gap-2">
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
              icon="Target"
              title="Complete your profile to receive personalized job recommendations"
              text="Add your education, skills, and experience so we can match you with the right opportunities."
            />
            <div className="mt-4 flex flex-col gap-2">
              {missing.map((key) => {
                const link = missingSectionLinks[key];
                if (!link) return null;
                return (
                  <Link key={key} to={link.to} className="self-start no-underline">
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
