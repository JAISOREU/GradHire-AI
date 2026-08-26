import type { ReactNode } from 'react';
import { Icon } from './Icon';

type TrendDirection = 'up' | 'down' | 'neutral';

type TrendIndicatorProps = {
  direction: TrendDirection;
  value: string;
  label?: string;
};

export const TrendIndicator = ({ direction, value, label }: TrendIndicatorProps) => (
  <div className={`trend-indicator trend-indicator--${direction}`}>
    <span className="trend-indicator__icon" aria-hidden="true">
      <Icon name={direction === 'up' ? 'arrow-up' : direction === 'down' ? 'arrow-down' : 'arrow-right'} size={14} />
    </span>
    <span className="trend-indicator__value">{value}</span>
    {label && <span className="trend-indicator__label">{label}</span>}
  </div>
);

type KPICardProps = {
  label: string;
  value: ReactNode;
  icon?: string;
  trend?: { direction: TrendDirection; value: string; label?: string };
  hint?: string;
  action?: ReactNode;
  progress?: number;
};

export const KPICard = ({ label, value, icon, trend, hint, action, progress }: KPICardProps) => (
  <div className="kpi-card">
    <div className="kpi-card__header">
      <span className="kpi-card__label">{label}</span>
      {icon && <span className="kpi-card__icon" aria-hidden="true"><Icon name={icon as any} size={18} /></span>}
    </div>
    <div className="kpi-card__value">{value}</div>
    {progress !== undefined && (
      <div className="kpi-card__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="kpi-card__progress-track">
          <div className="kpi-card__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    )}
    <div className="kpi-card__footer">
      {trend ? <TrendIndicator direction={trend.direction} value={trend.value} label={trend.label} /> : hint && <span className="kpi-card__hint">{hint}</span>}
      {action && <div className="kpi-card__action">{action}</div>}
    </div>
  </div>
);
