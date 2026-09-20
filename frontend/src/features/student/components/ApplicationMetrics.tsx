import { PhosphorIcon } from '../../../components/PhosphorIcon';
import type { ApplicationMetricsCounts, FunnelStage } from '../applicationRules';

export interface ApplicationMetricsProps {
  counts: ApplicationMetricsCounts;
  createdThisWeek: number;
  funnel: FunnelStage[];
}

const METRIC_ICONS = ['Briefcase', 'Clock', 'Calendar', 'CheckCircle'] as const;

const METRIC_DEFS = [
  { key: 'total', label: 'Total Applications', accessor: (c: ApplicationMetricsCounts) => c.total },
  { key: 'underReview', label: 'Under Review', accessor: (c: ApplicationMetricsCounts) => c.underReview },
  { key: 'interviews', label: 'Interviews', accessor: (c: ApplicationMetricsCounts) => c.interviews },
  { key: 'offers', label: 'Offers', accessor: (c: ApplicationMetricsCounts) => c.offers },
] as const;

export const ApplicationMetrics = ({ counts, createdThisWeek, funnel }: ApplicationMetricsProps) => (
  <section aria-label="Application metrics" className="apps-metrics">
    <div className="apps-metrics__grid">
      {METRIC_DEFS.map((metric, index) => {
        const value = metric.accessor(counts);
        return (
          <div key={metric.key} className="apps-metrics__card">
            <span className="apps-metrics__icon" aria-hidden="true">
              <PhosphorIcon name={METRIC_ICONS[index]} size={18} weight="duotone" />
            </span>
            <div className="apps-metrics__body">
              <div className="apps-metrics__value" aria-label={`${metric.label.charAt(0)}${metric.label.slice(1).toLowerCase()}: ${value}`}>
                {value}
              </div>
              <div className="apps-metrics__label">{metric.label}</div>
            </div>
            {metric.key === 'total' && createdThisWeek > 0 && (
              <span className="apps-metrics__trend">+{createdThisWeek} this week</span>
            )}
          </div>
        );
      })}
    </div>

    <div className="apps-funnel" role="list" aria-label="Application funnel">
      {funnel.map((stage, index) => (
        <span
          key={stage.stage}
          role="listitem"
          aria-label={`${stage.label}: ${stage.count} applications`}
          className="apps-funnel__stage"
        >
          <span className="apps-funnel__count">{stage.count}</span>
          <span className="apps-funnel__label">{stage.label}</span>
          {index < funnel.length - 1 && (
            <span className="apps-funnel__sep" aria-hidden="true">
              <PhosphorIcon name="ArrowDown" size={12} weight="bold" />
            </span>
          )}
        </span>
      ))}
    </div>
  </section>
);