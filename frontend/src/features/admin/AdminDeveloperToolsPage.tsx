import { EmptyState } from '../../components/EmptyState';

export const AdminDeveloperToolsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Developer Tools</h1>
    <p className="card__subtitle card__subtitle--mt">Hidden tools for platform developers.</p>
    <div className="section--mt">
      <EmptyState icon="Wrench" title="No tools" text="Developer tools will appear here when configured." />
    </div>
  </div>
);
