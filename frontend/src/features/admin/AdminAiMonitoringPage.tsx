import { AdminListPage } from '../../components/AdminListPage';

export const AdminAiMonitoringPage = () => (
  <div className="page fade-in">
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>AI Monitoring</h1>
    <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Monitor AI recommendation performance and accuracy.</p>
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
