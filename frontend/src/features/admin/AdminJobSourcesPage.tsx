import { useState } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { jobSourcesApi } from '../../core/api/endpoints/jobSources';
import { AdminListPage } from '../../components/AdminListPage';
import type { JobSource, JobSourceType } from '../../core/api/endpoints/jobSources';

const sourceTypeLabels: Record<JobSourceType, string> = {
  API: 'API',
  RSS: 'RSS',
  JSON: 'JSON',
  HTML: 'HTML',
};

const statusColors: Record<string, string> = {
  ACTIVE: '#22c55e',
  PAUSED: '#f59e0b',
  ERROR: '#ef4444',
  RATE_LIMITED: '#a855f7',
};

export const AdminJobSourcesPage = () => {
  const { data, loading, reload } = useAsync(() => jobSourcesApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', sourceType: 'API' as JobSourceType, baseUrl: '', feedUrl: '', crawlInterval: 60, rateLimit: 10 });
  const [saving, setSaving] = useState(false);

  const sources = data?.items ?? [];

  const handleSave = async () => {
    setSaving(true);
    try {
      if (showForm) {
        await jobSourcesApi.create(form);
        setShowForm(false);
        setForm({ name: '', company: '', sourceType: 'API', baseUrl: '', feedUrl: '', crawlInterval: 60, rateLimit: 10 });
      } else {
        await jobSourcesApi.create(form);
        setShowForm(false);
        setForm({ name: '', company: '', sourceType: 'API', baseUrl: '', feedUrl: '', crawlInterval: 60, rateLimit: 10 });
      }
      reload();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job source?')) return;
    await jobSourcesApi.remove(id);
    reload();
  };

  const handleSync = async (id: string) => {
    await jobSourcesApi.sync(id);
    reload();
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Job Sources</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Job Source'}
        </button>
        <button className="btn btn--secondary" onClick={() => jobSourcesApi.syncAll()}>
          Sync All
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '600px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Source Type</label>
              <select className="input" value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value as JobSourceType })}>
                <option value="API">API</option>
                <option value="RSS">RSS</option>
                <option value="JSON">JSON</option>
                <option value="HTML">HTML</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Base URL</label>
              <input className="input" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Feed URL</label>
              <input className="input" value={form.feedUrl} onChange={(e) => setForm({ ...form, feedUrl: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Crawl Interval (min)</label>
              <input className="input" type="number" value={form.crawlInterval} onChange={(e) => setForm({ ...form, crawlInterval: Number(e.target.value) })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Rate Limit (req/min)</label>
              <input className="input" type="number" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) })} />
            </div>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving || !form.name || !form.feedUrl}>
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}

      <AdminListPage
        items={sources}
        loading={loading}
        emptyIcon="📡"
        emptyTitle="No job sources"
        emptyText="Add an external job feed to get started."
        renderItem={(s: JobSource) => (
          <div className="list-item">
            <div className="list-item__head">
              <div>
                <h3 className="list-item__title card__title">{s.name}</h3>
                <div className="list-item__meta">
                  <span>{s.company}</span>
                  <span>{sourceTypeLabels[s.sourceType]}</span>
                  <span style={{ color: statusColors[s.status] || '#888' }}>{s.status}</span>
                  <span>{s.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn--sm btn--secondary" onClick={() => handleSync(s.id)}>Sync</button>
                <button className="btn btn--sm btn--danger" onClick={() => handleDelete(s.id)}>Delete</button>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
              <a href={s.feedUrl} target="_blank" rel="noreferrer">{s.feedUrl}</a>
              <span style={{ marginLeft: '1rem' }}>Interval: {s.crawlInterval}m</span>
              <span style={{ marginLeft: '1rem' }}>Failures: {s.failureCount}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
};
