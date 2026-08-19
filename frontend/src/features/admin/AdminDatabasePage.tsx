import { EmptyState } from '../../components/EmptyState';

export const AdminDatabasePage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Database</h1>
    <p className="card__subtitle card__subtitle--mt">Database management and migrations.</p>
    <div className="section--mt">
      <EmptyState icon="🗄️" title="No database entries" text="Database management tools will appear here." />
    </div>
  </div>
);
