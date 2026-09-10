import { EmptyState } from '../../components/EmptyState';

export const AdminBackupsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Backups</h1>
    <p className="page-subtitle">Manage database backups and restores.</p>
    <div className="section--mt">
      <EmptyState icon="FloppyDisk" title="No backups" text="Backups will appear here when configured." />
    </div>
  </div>
);
