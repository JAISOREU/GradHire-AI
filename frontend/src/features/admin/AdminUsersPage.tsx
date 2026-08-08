import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';

export const AdminUsersPage = () => {
  const { data, loading } = useAsync(() => adminApi.users(), []);

  const users = data?.items ?? [];

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Users</h1>
      <AdminListPage
        items={users}
        renderItem={(u) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">{u.email}</h3>
                <div className="list-item__meta">
                  <span>{u.role}</span>
                  <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        loading={loading}
        emptyIcon="👥"
        emptyTitle="No users"
        emptyText="No users found."
      />
    </div>
  );
};



