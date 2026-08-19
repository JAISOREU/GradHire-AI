import { EmptyState } from '../../components/EmptyState';

export const AdminBackupsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Backups</h1>
    <p className="card__subtitle card__subtitle--mt">Manage database backups and restores.</p>
    <div className="section--mt">
      <EmptyState icon="💾" title="No backups" text="Backups will appear here when configured." />
    </div>
  </div>
);
