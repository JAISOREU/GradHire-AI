import { useState, useEffect } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { jobSourcesApi } from '../../core/api/endpoints/jobSources';
import { AdminListPage } from '../../components/AdminListPage';
import type { JobSource, JobSourceType, JobSourceParserType, JobSourceHealthStatus, JobSourceAuthType } from '../../core/api/endpoints/jobSources';

const sourceTypeLabels: Record<JobSourceType, string> = {
  API: 'API',
  RSS: 'RSS',
  JSON: 'JSON',
  HTML: 'HTML',
};

const parserTypeLabels: Record<JobSourceParserType, string> = {
  GENERIC: 'Generic',
  GREENHOUSE: 'Greenhouse',
  LEVER: 'Lever',
  ASHBY: 'Ashby',
  SMARTRECRUITERS: 'SmartRecruiters',
  ADZUNA: 'Adzuna',
  USAJOBS: 'USAJOBS',
};

const healthStatusColors: Record<JobSourceHealthStatus, string> = {
  HEALTHY: 'status-healthy',
  DEGRADED: 'status-degraded',
  FAILING: 'status-failing',
  DISABLED: 'status-disabled',
  NEVER_TESTED: 'status-never-tested',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'status-active',
  PAUSED: 'status-paused',
  ERROR: 'status-error',
  RATE_LIMITED: 'status-rate-limited',
  RUNNING: 'status-running',
};

export const AdminJobSourcesPage = () => {
  const { data, loading, reload } = useAsync(() => jobSourcesApi.list(), []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    company: '',
    sourceType: 'API' as JobSourceType,
    parserType: 'GENERIC' as JobSourceParserType,
    authenticationType: 'NONE' as JobSourceAuthType,
    baseUrl: '',
    feedUrl: '',
    crawlInterval: 60,
    rateLimit: 10,
    enabled: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; discovered: number }>>({});

  const sources = data?.items ?? [];

  useEffect(() => {
    setTesting(null);
  }, [sources]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: '', company: '', sourceType: 'API', parserType: 'GENERIC', authenticationType: 'NONE', baseUrl: '', feedUrl: '', crawlInterval: 60, rateLimit: 10, enabled: true });
  };

  const handleEdit = (source: JobSource) => {
    setEditingId(source.id);
    setShowForm(true);
    setForm({
      name: source.name,
      company: source.company,
      sourceType: source.sourceType,
      parserType: source.parserType ?? 'GENERIC',
      authenticationType: source.authenticationType ?? 'NONE',
      baseUrl: source.baseUrl,
      feedUrl: source.feedUrl,
      crawlInterval: source.crawlInterval,
      rateLimit: source.rateLimit ?? 10,
      enabled: source.enabled,
    });
  };

  const handleSave = async () => {
    setError(null);
    if (!form.name || !form.company || !form.baseUrl || !form.feedUrl || !form.sourceType) {
      setError('Please fill in all required fields: Name, Company, Base URL, Feed URL, Source Type.');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await jobSourcesApi.update(editingId, form);
        setEditingId(null);
      } else {
        await jobSourcesApi.create(form);
      }
      resetForm();
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job source');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this job source?')) return;
    await jobSourcesApi.remove(id);
    reload();
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      const result = await jobSourcesApi.test(id);
      setTestResults((prev) => ({ ...prev, [id]: result }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message: err instanceof Error ? err.message : 'Test failed', discovered: 0 },
      }));
    } finally {
      setTesting(null);
    }
  };

  const handleSync = async (id: string) => {
    await jobSourcesApi.sync(id);
    setTimeout(reload, 1000);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await jobSourcesApi.update(id, { enabled: !enabled });
    reload();
  };

  const formatTimeSince = (iso?: string) => {
    if (!iso) return null;
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title page-title--admin">Job Sources</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn--primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : 'Add Job Source'}
        </button>
        <button className="btn btn--secondary" onClick={() => jobSourcesApi.syncAll()}>
          Sync All
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
          <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '600px' }}>
            {error && (
              <div className="message message--error">
                {error}
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Source Type</label>
                 <select className="select" value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value as JobSourceType })}>
                   <option value="API">API</option>
                   <option value="RSS">RSS</option>
                   <option value="JSON">JSON</option>
                   <option value="HTML">HTML</option>
                 </select>
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Parser Type</label>
                 <select className="select" value={form.parserType} onChange={(e) => setForm({ ...form, parserType: e.target.value as JobSourceParserType })}>
                   <option value="GENERIC">Generic</option>
                   <option value="GREENHOUSE">Greenhouse</option>
                   <option value="LEVER">Lever</option>
                   <option value="ASHBY">Ashby</option>
                   <option value="SMARTRECRUITERS">SmartRecruiters</option>
                   <option value="ADZUNA">Adzuna</option>
                   <option value="USAJOBS">USAJOBS</option>
                 </select>
               </div>
               <div>
                 <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Auth Type</label>
                 <select className="select" value={form.authenticationType} onChange={(e) => setForm({ ...form, authenticationType: e.target.value as JobSourceAuthType })}>
                   <option value="NONE">None</option>
                   <option value="API_KEY">API Key</option>
                   <option value="OAUTH">OAuth</option>
                   <option value="BASIC">Basic</option>
                 </select>
               </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Base URL</label>
              <input className="input" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Feed URL</label>
              <input className="input" value={form.feedUrl} onChange={(e) => setForm({ ...form, feedUrl: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Crawl Interval (min)</label>
                <input className="input" type="number" value={form.crawlInterval} onChange={(e) => setForm({ ...form, crawlInterval: Number(e.target.value) })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Rate Limit (req/min)</label>
                <input className="input" type="number" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) })} />
              </div>
            </div>
            <button className="btn btn--primary" onClick={handleSave} disabled={saving || !form.name || !form.company || !form.baseUrl || !form.feedUrl || !form.sourceType}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
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
        renderItem={(s: JobSource) => {
          const testResult = testResults[s.id];
          const health = s.healthStatus ?? 'NEVER_TESTED';
          return (
            <div className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="list-item__title card__title">{s.name}</h3>
                  <div className="list-item__meta">
                    <span>{s.company}</span>
                    <span>{sourceTypeLabels[s.sourceType]}</span>
                     <span className={statusColors[s.status] || 'status-never-tested'}>{s.status}</span>
                     <span className={healthStatusColors[health] || 'status-never-tested'}>{health}</span>
                     <span className={s.enabled ? 'status-active' : 'status-failing'}>{s.enabled ? 'Enabled' : 'Disabled'}</span>
                    <span>Parser: {parserTypeLabels[s.parserType ?? 'GENERIC']}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn--sm btn--secondary" onClick={() => handleTest(s.id)} disabled={testing === s.id}>
                    {testing === s.id ? 'Testing...' : 'Test'}
                  </button>
                  <button className="btn btn--sm btn--secondary" onClick={() => handleSync(s.id)}>Sync</button>
                  <button className="btn btn--sm btn--secondary" onClick={() => handleEdit(s)}>Edit</button>
                  <button className="btn btn--sm btn--danger" onClick={() => handleDelete(s.id)}>Delete</button>
                </div>
              </div>
              <div className="text-secondary text-sm" style={{ marginTop: '0.5rem' }}>
                <a href={s.feedUrl} target="_blank" rel="noreferrer">{s.feedUrl}</a>
                <span style={{ marginLeft: '1rem' }}>Interval: {s.crawlInterval}m</span>
                <span style={{ marginLeft: '1rem' }}>Failures: {s.failureCount}</span>
                <span style={{ marginLeft: '1rem' }}>Last run: {formatTimeSince(s.lastRunAt)}</span>
                <span style={{ marginLeft: '1rem' }}>Last success: {formatTimeSince(s.lastSuccessAt)}</span>
              </div>
              {s.lastError && (
                <div className="text-danger text-sm" style={{ marginTop: '0.5rem' }}>
                  Error: {s.lastError}
                </div>
              )}
              {testResult && (
                <div className="text-sm" style={{ marginTop: '0.5rem', color: testResult.success ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  Test: {testResult.message} {testResult.discovered > 0 ? `(${testResult.discovered} jobs)` : ''}
                </div>
              )}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className={`btn btn--sm ${s.enabled ? 'btn--warning' : 'btn--success'}`} onClick={() => handleToggle(s.id, s.enabled)}>
                  {s.enabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
