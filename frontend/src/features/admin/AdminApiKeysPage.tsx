import { EmptyState } from '../../components/EmptyState';

export const AdminApiKeysPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">API Keys</h1>
    <p className="card__subtitle card__subtitle--mt">Manage API keys and access tokens.</p>
    <div className="section--mt">
      <EmptyState icon="🔑" title="No API keys" text="API keys will appear here when configured." />
    </div>
  </div>
);
