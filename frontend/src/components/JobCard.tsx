import { ProgressRing } from './ProgressRing';
import { PhosphorIcon } from './PhosphorIcon';
import { cn } from '../lib/utils';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  workplaceType?: string;
  experienceLevel?: string;
  matchScore?: number;
  postedAt?: string;
  deadline?: string;
  isSaved?: boolean;
  isApplied?: boolean;
};

type JobCardProps = {
  job: Job;
  selected?: boolean;
  onClick: () => void;
  onToggleSave?: () => void;
  className?: string;
};

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function daysUntilDeadline(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export const JobCard = ({ job, selected, onClick, onToggleSave, className }: JobCardProps) => {
  const deadlineDays = job.deadline ? daysUntilDeadline(job.deadline) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-colors duration-150',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border/50 bg-surface hover:bg-surface-muted/50',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {job.matchScore !== undefined && (
          <ProgressRing value={job.matchScore} size="sm" className="flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text truncate">{job.title}</p>
            {onToggleSave && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                className="flex-shrink-0 p-1 rounded-md hover:bg-surface-muted transition-colors"
                aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
              >
                <PhosphorIcon
                  name={job.isSaved ? 'Heart' : 'Heart'}
                  size={16}
                  weight={job.isSaved ? 'fill' : 'regular'}
                  className={job.isSaved ? 'text-danger' : 'text-text-secondary'}
                />
              </button>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">{job.company} · {job.location}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {job.salary && (
              <span className="text-xs text-text-secondary">{job.salary}</span>
            )}
            {job.workplaceType && (
              <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                {job.workplaceType}
              </span>
            )}
            {job.experienceLevel && (
              <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                {job.experienceLevel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            {job.postedAt && (
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <PhosphorIcon name="Clock" size={12} />
                {formatTimeAgo(job.postedAt)}
              </span>
            )}
            {deadlineDays !== null && deadlineDays > 0 && deadlineDays <= 7 && (
              <span className="text-xs text-warning font-medium flex items-center gap-1">
                <PhosphorIcon name="Warning" size={12} weight="fill" />
                Closing in {deadlineDays}d
              </span>
            )}
            {job.isApplied && (
              <span className="text-xs text-success font-medium flex items-center gap-1">
                <PhosphorIcon name="CheckCircle" size={12} weight="fill" />
                Applied
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
