import { cn } from '../lib/utils';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export const Sparkline = ({ data, width = 80, height = 24, color, className }: SparklineProps) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('flex-shrink-0', className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color || 'var(--color-primary, #6366f1)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};