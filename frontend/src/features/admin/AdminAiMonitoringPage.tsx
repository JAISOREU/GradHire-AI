import { AdminListPage } from '../../components/AdminListPage';

export const AdminAiMonitoringPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">AI Monitoring</h1>
    <p className="card__subtitle card__subtitle card__subtitle--mt">Monitor AI recommendation performance and accuracy.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="🤖"
      emptyTitle="No AI data"
      emptyText="AI monitoring data will appear here."
    />
  </div>
);



