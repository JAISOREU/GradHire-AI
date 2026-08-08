import { AdminListPage } from '../../components/AdminListPage';

export const AdminCmsPage = () => (
  <div className="page fade-in">
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>CMS</h1>
    <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Manage content and pages.</p>
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
