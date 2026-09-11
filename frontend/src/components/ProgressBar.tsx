import { cn } from '../lib/utils';

type ProgressBarProps = {
  value: number;
  label: string;
  showValue?: boolean;
  className?: string;
};

export const ProgressBar = ({ value, label, showValue = true, className }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">{label}</span>
        {showValue && <span className="text-sm text-text-secondary">{clamped}%</span>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
