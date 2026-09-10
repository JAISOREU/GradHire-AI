import { FormEvent, useState } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';
import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const AdminUsersPage = () => {
  const { data, loading, reload } = useAsync(() => adminApi.users(), []);
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('STUDENT');
  const [message, setMessage] = useState('');

  const users = data?.items ?? [];

  const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await adminApi.createUser({ email, password, role });
      setEmail('');
      setPassword('');
      setRole('STUDENT');
      setShowCreate(false);
      reload();
      setMessage('User created.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to create user.');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      reload();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Users</h1>
      <div className="mb-4 flex gap-2 items-center flex-wrap">
        <select className="select" aria-label="Filter users by role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="STUDENT">Student</option>
          <option value="EMPLOYER">Employer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <Button variant={showCreate ? 'secondary' : 'primary'} onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Cancel' : 'Add user'}</Button>
        {message && <Alert variant="info">{message}</Alert>}
      </div>

      {showCreate && (
        <Card title="Create user" className="mb-4">
          <form onSubmit={handleCreate} className="stack">
            <div className="form-group">
              <label className="form-label" htmlFor="user-email">Email</label>
              <input id="user-email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
            </div>
            <div className="form-group relative">
              <label className="form-label" htmlFor="user-password">Password</label>
              <input id="user-password" className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute right-2 top-[2.65rem] bg-transparent border-none cursor-pointer text-sm text-text-secondary">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="user-role">Role</label>
              <select id="user-role" className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="STUDENT">Student</option>
                <option value="EMPLOYER">Employer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <Button type="submit">Create user</Button>
          </form>
        </Card>
      )}

      <AdminListPage
        items={filtered}
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
              <div className="flex gap-2 items-center">
                <select className="select" aria-label={`Change role for ${u.email}`} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                  <option value="STUDENT">Student</option>
                  <option value="EMPLOYER">Employer</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <Button variant="danger" size="sm" onClick={() => handleDelete(u.id)}>Delete</Button>
              </div>
            </div>
          </div>
        )}
        loading={loading}
         emptyTitle="No users"
        emptyText="No users found."
      />
    </div>
  );
};
