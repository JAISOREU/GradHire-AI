import { FormEvent, useState } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { AdminListPage } from '../../components/AdminListPage';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const AdminUsersPage = () => {
  const { data, loading, reload } = useAsync(() => adminApi.users(), []);
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="STUDENT">Student</option>
          <option value="EMPLOYER">Employer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <Button variant="primary" onClick={() => setShowCreate(!showCreate)}>{showCreate ? 'Cancel' : 'Add user'}</Button>
        {message && <span className="message message--info">{message}</span>}
      </div>

      {showCreate && (
        <Card title="Create user" className="mb-4">
          <form onSubmit={handleCreate} className="stack">
            <div className="form-group">
              <label className="form-label" htmlFor="user-email">Email</label>
              <input id="user-email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="user-password">Password</label>
              <input id="user-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
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
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select className="select" value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
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
        emptyIcon="👥"
        emptyTitle="No users"
        emptyText="No users found."
      />
    </div>
  );
};
