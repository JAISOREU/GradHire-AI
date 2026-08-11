import './Progress.css';

type ProgressProps = {
  value: number;
  max?: number;
  className?: string;
};

export const Progress = ({ value, max = 100, className = '' }: ProgressProps) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`progress ${className}`} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress__bar" style={{ width: `${percent}%` }} />
    </div>
  );
};
