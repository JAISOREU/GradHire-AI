import { useAsync } from '../../core/hooks/useAsync';
import { aggregationApi } from '../../core/api/endpoints/aggregation';
import { AdminListPage } from '../../components/AdminListPage';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/LoadingState';

export const AdminJobAggregationSourcesPage = () => {
  const { data, loading, reload } = useAsync(() => aggregationApi.sources(), []);
  const sources = data?.items ?? [];

  return (
    <div className="page fade-in">
      <PageHeader title="Job Sources" subtitle="Configure external job discovery sources." />
      {loading ? (
        <LoadingState label="Loading sources…" />
      ) : sources.length === 0 ? (
        <EmptyState icon="📡" title="No sources" text="Add a job source to begin aggregation." />
      ) : (
        <AdminListPage
          items={sources}
          renderItem={(source: any) => (
            <div className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title card__title">{source.name}</h3>
                  <div className="list-item__meta">
                    <span>{source.baseUrl}</span>
                    <span>{source.sourceType}</span>
                    <span>{source.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => aggregationApi.triggerCrawl(source.id).then(reload)}>
                  Crawl
                </Button>
              </div>
            </div>
          )}
          loading={loading}
          emptyIcon="📡"
          emptyTitle="No sources"
          emptyText="No job sources configured."
        />
      )}
    </div>
  );
};
