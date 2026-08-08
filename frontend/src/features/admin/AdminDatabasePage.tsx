import { AdminListPage } from '../../components/AdminListPage';

export const AdminDatabasePage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Database</h1>
    <p className="card__subtitle card__subtitle card__subtitle--mt">Database management and migrations.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="🗄️"
      emptyTitle="No database entries"
      emptyText="Database entries will appear here."
    />
  </div>
);



