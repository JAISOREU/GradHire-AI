import { Alert } from '../../components/Alert';
import { useAsync } from '../../core/hooks/useAsync';
import { analyticsApi } from '../../core/api/endpoints/employers';
import { StatCard } from '../../components/StatCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';

export const EmployerAnalyticsPage = () => {
  const { data: analytics, loading, error, reload } = useAsync(() => analyticsApi.getSnapshot(), []);

  return (
    <div className="page fade-in">
      <h1 className="page-title">Analytics</h1>
      <p className="page-subtitle">Track your hiring performance.</p>

      {error && (
        <Alert>
          {error ?? 'Failed to load analytics.'} <button onClick={reload} className="link">Retry</button>
        </Alert>
      )}

      {loading && !analytics ? (
        <LoadingState label="Loading analytics…" />
      ) : analytics ? (
        <>
           <div className="status-strip status-strip--auto">
              <StatCard label="Active jobs" value={analytics.activeJobs ?? 0} />
              <StatCard label="Applications today" value={analytics.applicationsToday ?? 0} />
              <StatCard label="Profile views" value={analytics.views ?? 0} />
              <StatCard label="Pending interviews" value={analytics.pendingInterviews ?? 0} />
           </div>

          <div className="card mt-4">
            <h3 className="card__title">Hiring funnel</h3>
            <p className="card__subtitle">Views → Applications → Interviews</p>
             {(analytics.hiringFunnel?.length ?? 0) > 0 && (
              <div className="stack mt-3">
                {analytics.hiringFunnel.map((value, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-xs text-muted">
                      <span>Stage {index + 1}</span>
                      <span>{value}</span>
                    </div>
                     <div className="match-score__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`Stage ${index + 1} ${value}`}>
                        <div className="match-score__fill" style={{ width: `${Math.min(value, 100)}%` }} />
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
       <EmptyState title="No analytics yet" text="Post jobs to start tracking performance." />
     )}
    </div>
  );
};



