import { AdminListPage } from '../../components/AdminListPage';

export const AdminAnalyticsPage = () => (
  <div className="page fade-in">
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Analytics</h1>
    <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Platform analytics and insights.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="📊"
      emptyTitle="No analytics"
      emptyText="Analytics data will appear here."
    />
  </div>
);
