import { AdminListPage } from '../../components/AdminListPage';

export const AdminDeveloperToolsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Developer Tools</h1>
    <p className="card__subtitle card__subtitle card__subtitle--mt">Hidden tools for platform developers.</p>
    <AdminListPage
      items={[]}
      renderItem={() => null}
      loading={false}
      emptyIcon="🛠️"
      emptyTitle="No tools"
      emptyText="Developer tools will appear here."
    />
  </div>
);



