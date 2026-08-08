import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';

export const AdminCompaniesPage = () => {
  const { data, loading } = useAsync(() => adminApi.companies(), []);

  const companies = data?.items ?? [];

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Companies</h1>
      <AdminListPage
        items={companies}
        renderItem={(c) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">{c.name}</h3>
                <div className="list-item__meta">
                  <span>{c.industry}</span>
                  <span>{c.location}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="🏢"
        emptyTitle="No companies"
        emptyText="No companies found."
      />
    </div>
  );
};



