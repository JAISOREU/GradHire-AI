import type { ReactNode } from 'react';
import { Icon } from './Icon';

type TrendDirection = 'up' | 'down' | 'neutral';

type TrendIndicatorProps = {
  direction: TrendDirection;
  value: string;
  label?: string;
};

const TREND_COLOR: Record<TrendDirection, string> = {
  up: 'var(--color-success)',
  down: 'var(--color-danger)',
  neutral: 'var(--color-text-muted)',
};

export const TrendIndicator = ({ direction, value, label }: TrendIndicatorProps) => (
  <div className="trend-indicator" style={{ color: TREND_COLOR[direction] }}>
    <span className="trend-indicator__icon" aria-hidden="true">
      <Icon name={direction === 'up' ? 'arrow-right' : direction === 'down' ? 'arrow-left' : 'arrow-right'} size={14} />
    </span>
    <span className="trend-indicator__value">{value}</span>
    {label && <span className="trend-indicator__label">{label}</span>}
  </div>
);

type KPICardProps = {
  label: string;
  value: string | number;
  icon?: string;
  trend?: { direction: TrendDirection; value: string; label?: string };
  hint?: string;
  action?: ReactNode;
};

export const KPICard = ({ label, value, icon, trend, hint, action }: KPICardProps) => (
  <div className="kpi-card">
    <div className="kpi-card__header">
      <span className="kpi-card__label">{label}</span>
      {icon && <span className="kpi-card__icon" aria-hidden="true"><Icon name={icon as any} size={18} /></span>}
    </div>
    <div className="kpi-card__value">{value}</div>
    <div className="kpi-card__footer">
      {trend ? <TrendIndicator direction={trend.direction} value={trend.value} label={trend.label} /> : hint && <span className="kpi-card__hint">{hint}</span>}
      {action && <div className="kpi-card__action">{action}</div>}
    </div>
  </div>
);
