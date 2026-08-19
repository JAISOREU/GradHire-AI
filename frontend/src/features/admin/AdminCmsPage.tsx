import { EmptyState } from '../../components/EmptyState';

export const AdminCmsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">CMS</h1>
    <p className="card__subtitle card__subtitle--mt">Manage content and pages.</p>
    <div className="section--mt">
      <EmptyState icon="📝" title="No content" text="CMS content will appear here when configured." />
    </div>
  </div>
);
