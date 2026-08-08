import { AdminListPage } from '../../components/AdminListPage';

export const AdminBackupsPage = () => (
  <div className="page fade-in">
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Backups</h1>
    <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Manage database backups and restores.</p>
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
