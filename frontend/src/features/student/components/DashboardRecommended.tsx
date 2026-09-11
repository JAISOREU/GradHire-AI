import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../../../components/ProgressRing';
import { PhosphorIcon } from '../../../components/PhosphorIcon';

type RecommendedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills?: string[];
  missingSkills?: string[];
};

type DashboardRecommendedProps = {
  jobs: RecommendedJob[];
  loading?: boolean;
};

export const DashboardRecommended = ({ jobs, loading }: DashboardRecommendedProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-surface-muted mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text">Recommended For You</h2>
        <button
          onClick={() => navigate('/student/recommended')}
          className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
        >
          View all <PhosphorIcon name="ArrowRight" size={14} />
        </button>
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-text-secondary py-4 text-center">
          Complete your profile to get AI-powered job recommendations.
        </p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="w-full text-left flex items-start gap-3 rounded-lg border border-border/30 p-3 hover:bg-surface-muted/50 transition-colors"
            >
              <ProgressRing value={job.matchScore} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{job.title}</p>
                <p className="text-xs text-text-secondary">{job.company} · {job.location}</p>
                {job.matchedSkills && job.matchedSkills.length > 0 && (
                  <p className="text-xs text-success mt-1">
                    Matches: {job.matchedSkills.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};