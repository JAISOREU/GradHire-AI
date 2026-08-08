import { AdminListPage } from '../../components/AdminListPage';

export const AdminDatabasePage = () => (
  <div className="page fade-in">
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Database</h1>
    <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Database management and migrations.</p>
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
