import { AdminListPage } from '../../components/AdminListPage';

export const AdminCmsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">CMS</h1>
    <p className="card__subtitle card__subtitle card__subtitle--mt">Manage content and pages.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="📝"
      emptyTitle="No content"
      emptyText="CMS content will appear here."
    />
  </div>
);



