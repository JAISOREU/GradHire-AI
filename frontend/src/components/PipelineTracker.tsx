import { cn } from '../lib/utils';
import type { ApplicationStatus } from '../core/types';

type PipelineTrackerProps = {
  status: string;
  className?: string;
};

type StageKey = 'SUBMITTED' | 'UNDER_REVIEW' | 'INTERVIEW' | 'OFFER' | 'HIRED';

const STAGES: { key: StageKey; label: string }[] = [
  { key: 'SUBMITTED', label: 'Applied' },
  { key: 'UNDER_REVIEW', label: 'In review' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'OFFER', label: 'Offer' },
  { key: 'HIRED', label: 'Hired' },
];

const TERMINAL: ApplicationStatus[] = ['REJECTED', 'WITHDRAWN'];

const keyForStatus = (status: string): StageKey | null => {
  const s = (status ?? 'SUBMITTED') as ApplicationStatus;
  if (TERMINAL.includes(s)) return null;
  if (s === 'SHORTLISTED' || s === 'ASSESSMENT') return 'UNDER_REVIEW';
  return STAGES.some((stage) => stage.key === s) ? (s as StageKey) : null;
};

export const PipelineTracker = ({ status, className }: PipelineTrackerProps) => {
  const current = keyForStatus(status);
  if (current === null) return null;
  const currentIndex = STAGES.findIndex((stage) => stage.key === current);

  return (
    <div className={cn('flex items-center gap-0', className)} role="list" aria-label={`Pipeline stage ${currentIndex + 1} of ${STAGES.length}`}>
      {STAGES.map((stage, i) => {
        const isActive = i === currentIndex;
        const isComplete = i < currentIndex;
        return (
          <div key={stage.key} className="flex items-center flex-1" role="listitem">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full border-2 transition-colors',
                  isComplete && 'bg-primary border-primary',
                  isActive && 'border-primary bg-primary/20',
                  !isComplete && !isActive && 'border-border bg-surface-muted'
                )}
                aria-label={`${stage.label}${isComplete ? ' (complete)' : isActive ? ' (current)' : ''}`}
              />
              <span
                className={cn(
                  'text-[10px] mt-1 whitespace-nowrap',
                  isActive ? 'text-primary font-medium' : isComplete ? 'text-text-secondary' : 'text-text-secondary/50'
                )}
              >
                {stage.label}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={cn('flex-1 h-0.5 mx-1', i < currentIndex ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
};