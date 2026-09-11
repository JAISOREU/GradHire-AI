import type { ReactNode } from 'react';

type TrendDirection = 'up' | 'down' | 'neutral';

type TrendIndicatorProps = {
  direction: TrendDirection;
  value: string;
  label?: string;
};

export const TrendIndicator = ({ direction, value, label }: TrendIndicatorProps) => (
  <div className={`trend-indicator trend-indicator--${direction}`}>
    <span className="trend-indicator__arrow" aria-hidden="true">
      {direction === 'up' ? '\u2191' : direction === 'down' ? '\u2193' : '\u00b7'}
    </span>
    <span className="trend-indicator__value">{value}</span>
    {label && <span className="trend-indicator__label">{label}</span>}
  </div>
);

type KPICardProps = {
  label: string;
  value: ReactNode;
  trend?: { direction: TrendDirection; value: string; label?: string };
  hint?: string;
  action?: ReactNode;
  progress?: number;
  sparkline?: ReactNode;
  comparison?: string;
  className?: string;
};

export const KPICard = ({ label, value, trend, hint, action, progress, sparkline, comparison, className }: KPICardProps) => (
  <div className={className ? `kpi-card ${className}` : 'kpi-card'}>
    <div className="kpi-card__header">
      <span className="kpi-card__label">{label}</span>
    </div>
    <div className="kpi-card__value">{value}</div>
    {sparkline && <div className="kpi-card__sparkline">{sparkline}</div>}
    {progress !== undefined && (
      <div className="kpi-card__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="kpi-card__progress-track">
          <div className="kpi-card__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )}
    <div className="kpi-card__footer">
      {trend ? (
        <div className="kpi-card__trend-wrap">
          <TrendIndicator direction={trend.direction} value={trend.value} label={trend.label} />
          {comparison && <span className="kpi-card__comparison">{comparison}</span>}
        </div>
      ) : hint && <span className="kpi-card__hint">{hint}</span>}
      {action && <div className="kpi-card__action">{action}</div>}
    </div>
  </div>
);