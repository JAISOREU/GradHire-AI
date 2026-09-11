import { Alert } from '../../components/Alert';
import { useAsync } from '../../core/hooks/useAsync';
import { analyticsApi } from '../../core/api/endpoints/employers';
import { KPICard } from '../../components/KPICard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { currentPeriodLabel } from '../../core/utils/format';

const FUNNEL_STAGES = ['Applications', 'Screening', 'Interview', 'Offer', 'Hired'];

export const EmployerAnalyticsPage = () => {
  const { data: analytics, loading, error, reload } = useAsync(() => analyticsApi.getSnapshot(), []);

  return (
    <div className="page fade-in">
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Hiring performance over the current period · {currentPeriodLabel()}</p>

      {error && (
        <Alert>
          {error ?? 'Failed to load analytics.'} <button onClick={reload} className="link">Retry</button>
        </Alert>
      )}

      {loading && !analytics ? (
        <LoadingState label="Loading analytics…" />
      ) : analytics ? (
        <>
          <div className="status-strip status-strip--hero section--mt">
            <KPICard
              className="kpi-card--primary"
              label="Active jobs"
              value={analytics.activeJobs ?? 0}
              trend={{ direction: (analytics.activeJobs ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.activeJobs ?? 0} live`, label: 'postings' }}
            />
            <KPICard
              label="Applications today"
              value={analytics.applicationsToday ?? 0}
              trend={{ direction: (analytics.applicationsToday ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.applicationsToday ?? 0} today`, label: 'new' }}
            />
            <KPICard
              label="Profile views"
              value={analytics.views ?? 0}
              trend={{ direction: (analytics.views ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.views ?? 0} total`, label: 'views' }}
            />
            <KPICard
              className="kpi-card--wide"
              label="Pending interviews"
              value={analytics.pendingInterviews ?? 0}
              trend={{ direction: (analytics.pendingInterviews ?? 0) > 0 ? 'up' : 'neutral', value: `${analytics.pendingInterviews ?? 0} scheduled`, label: 'pending' }}
            />
          </div>

          <div className="card section--mt">
            <h3 className="card__title">Hiring funnel</h3>
            <p className="card__subtitle">Applications → Screening → Interview → Offer → Hired</p>
            {(analytics.hiringFunnel?.length ?? 0) > 0 && (() => {
              const stages = analytics.hiringFunnel;
              const max = Math.max(...stages);
              return (
                <div className="funnel section--mt" role="group" aria-label="Hiring funnel">
                  {stages.map((value, index) => {
                    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
                    const prev = index > 0 ? stages[index - 1] : null;
                    const conversion = prev != null && prev > 0 ? Math.round((value / prev) * 100) : null;
                    return (
                      <div key={index} className="funnel__row">
                        <div className="funnel__meta">
                          <span className="funnel__label">{FUNNEL_STAGES[index] ?? `Stage ${index + 1}`}</span>
                          <span className="funnel__values">
                            <span className="funnel__value">{value}</span>
                            {conversion !== null && (
                              <span className="funnel__conversion" aria-label="conversion to previous stage">
                                {conversion}%
                              </span>
                            )}
                          </span>
                        </div>
                        <div
                          className="funnel__track"
                          role="progressbar"
                          aria-label={`${FUNNEL_STAGES[index] ?? `Stage ${index + 1}`} ${value}`}
                          aria-valuenow={value}
                          aria-valuemin={0}
                          aria-valuemax={stages[0] > value ? stages[0] : value}
                        >
                          <div className="funnel__bar" style={{ width: `${Math.max(pct, 4)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </>
      ) : (
       <EmptyState title="No analytics yet" text="Post jobs to start tracking performance." />
     )}
    </div>
  );
};



