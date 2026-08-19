import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';
import { Button } from '../../components/Button';

export const AdminCompaniesPage = () => {
  const { data, loading, reload } = useAsync(() => adminApi.companies(), []);

  const companies = data?.items ?? [];

  const handleVerify = async (companyId: string, verified: boolean | undefined) => {
    try {
      await adminApi.updateCompany(companyId, { verified: !verified });
      reload();
    } catch {
      // ignore
    }
  };

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
              <Button variant={c.verified ? 'secondary' : 'primary'} size="sm" onClick={() => handleVerify(c.id, c.verified)}>
                {c.verified ? 'Verified' : 'Verify'}
              </Button>
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
