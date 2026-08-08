import { AdminListPage } from '../../components/AdminListPage';

export const AdminDeveloperToolsPage = () => (
  <div className="page fade-in">
    <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Developer Tools</h1>
    <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Hidden tools for platform developers.</p>
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
