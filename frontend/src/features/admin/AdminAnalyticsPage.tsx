import { AdminListPage } from '../../components/AdminListPage';

export const AdminAnalyticsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Analytics</h1>
    <p className="page-subtitle">Platform analytics and insights.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="ChartBar"
      emptyTitle="No analytics"
      emptyText="Analytics data will appear here."
    />
  </div>
);



