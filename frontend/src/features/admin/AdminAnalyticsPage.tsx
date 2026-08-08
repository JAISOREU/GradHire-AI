import { AdminListPage } from '../../components/AdminListPage';

export const AdminAnalyticsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Analytics</h1>
    <p className="card__subtitle card__subtitle card__subtitle--mt">Platform analytics and insights.</p>
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



