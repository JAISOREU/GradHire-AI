import { AdminListPage } from '../../components/AdminListPage';

export const AdminBackupsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Backups</h1>
    <p className="card__subtitle card__subtitle card__subtitle--mt">Manage database backups and restores.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="💾"
      emptyTitle="No backups"
      emptyText="Backups will appear here."
    />
  </div>
);



