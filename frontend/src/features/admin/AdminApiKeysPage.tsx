import { AdminListPage } from '../../components/AdminListPage';

export const AdminApiKeysPage = () => (
  <div className="page fade-in">
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>API Keys</h1>
    <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Manage API keys and access tokens.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="🔑"
      emptyTitle="No API keys"
      emptyText="API keys will appear here."
    />
  </div>
);
