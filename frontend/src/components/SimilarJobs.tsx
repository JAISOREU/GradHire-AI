import { useNavigate } from 'react-router-dom';
import { ProgressRing } from './ProgressRing';

type SimilarJob = {
  id: string;
  title: string;
  company: string;
  matchScore: number;
};

type SimilarJobsProps = {
  jobs: SimilarJob[];
};

export const SimilarJobs = ({ jobs }: SimilarJobsProps) => {
  const navigate = useNavigate();

  if (jobs.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-semibold text-text mb-3">Similar Jobs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="text-left rounded-xl border border-border/50 bg-surface p-4 hover:shadow-[var(--space-depth-md)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <ProgressRing value={job.matchScore} size="sm" className="mb-2" />
            <p className="text-sm font-medium text-text truncate">{job.title}</p>
            <p className="text-xs text-text-secondary">{job.company}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
