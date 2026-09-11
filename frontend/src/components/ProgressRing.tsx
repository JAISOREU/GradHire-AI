import { cn } from '../lib/utils';

type Size = 'sm' | 'md' | 'lg';

type ProgressRingProps = {
  value: number;
  size?: Size;
  label?: string;
  className?: string;
};

const SIZE_MAP: Record<Size, { dimension: number; strokeWidth: number; fontSize: string }> = {
  sm: { dimension: 32, strokeWidth: 3, fontSize: 'text-xs' },
  md: { dimension: 48, strokeWidth: 4, fontSize: 'text-sm' },
  lg: { dimension: 64, strokeWidth: 5, fontSize: 'text-lg' },
};

function getColor(value: number): string {
  if (value >= 80) return 'var(--color-success, #22c55e)';
  if (value >= 60) return 'var(--color-warning, #eab308)';
  return 'var(--color-danger, #ef4444)';
}

export const ProgressRing = ({ value, size = 'md', label, className }: ProgressRingProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const { dimension, strokeWidth, fontSize } = SIZE_MAP[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = getColor(clamped);

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        role="img"
        aria-label={`${clamped}%`}
      >
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border opacity-20"
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={cn('font-semibold text-text', fontSize)}>{clamped}%</span>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
    </div>
  );
};