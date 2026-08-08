import { AdminListPage } from '../../components/AdminListPage';

export const AdminApiKeysPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">API Keys</h1>
    <p className="card__subtitle card__subtitle card__subtitle--mt">Manage API keys and access tokens.</p>
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



