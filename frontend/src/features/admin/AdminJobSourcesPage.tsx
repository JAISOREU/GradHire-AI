import { Alert } from '../../components/Alert';
import { useState, useEffect } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { jobSourcesApi } from '../../core/api/endpoints/jobSources';
import { AdminListPage } from '../../components/AdminListPage';
import { Button } from '../../components/Button';
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
    setTimeout(reload, 3000);
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

      <div className="mb-4 flex gap-2">
        <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancel' : 'Add Job Source'}
        </Button>
        <Button variant="secondary" onClick={() => jobSourcesApi.syncAll()}>
          Sync All
        </Button>
      </div>

      {showForm && (
        <div className="card mb-4 p-4">
          <div className="grid gap-3 max-w-2xl">
            {error && (
              <Alert>
                {error}
              </Alert>
            )}
            <div>
              <label className="block mb-1 font-semibold">Name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Company</label>
              <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 font-semibold">Source Type</label>
                 <select className="select" value={form.sourceType} onChange={(e) => setForm({ ...form, sourceType: e.target.value as JobSourceType })}>
                   <option value="API">API</option>
                   <option value="RSS">RSS</option>
                   <option value="JSON">JSON</option>
                   <option value="HTML">HTML</option>
                 </select>
               </div>
               <div>
                  <label className="block mb-1 font-semibold">Parser Type</label>
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
                  <label className="block mb-1 font-semibold">Auth Type</label>
                 <select className="select" value={form.authenticationType} onChange={(e) => setForm({ ...form, authenticationType: e.target.value as JobSourceAuthType })}>
                   <option value="NONE">None</option>
                   <option value="API_KEY">API Key</option>
                   <option value="OAUTH">OAuth</option>
                   <option value="BASIC">Basic</option>
                 </select>
               </div>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Base URL</label>
              <input className="input" value={form.baseUrl} onChange={(e) => setForm({ ...form, baseUrl: e.target.value })} />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Feed URL</label>
              <input className="input" value={form.feedUrl} onChange={(e) => setForm({ ...form, feedUrl: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                 <label className="block mb-1 font-semibold">Crawl Interval (min)</label>
                <input className="input" type="number" value={form.crawlInterval} onChange={(e) => setForm({ ...form, crawlInterval: Number(e.target.value) })} />
              </div>
              <div>
                 <label className="block mb-1 font-semibold">Rate Limit (req/min)</label>
                <input className="input" type="number" value={form.rateLimit} onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) })} />
              </div>
            </div>
            <Button variant="primary" onClick={handleSave} disabled={saving || !form.name || !form.company || !form.baseUrl || !form.feedUrl || !form.sourceType}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      )}

      <AdminListPage
        items={sources}
        loading={loading}
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
                <div className="flex gap-2 flex-wrap">
                  <Button variant="secondary" size="sm" onClick={() => handleTest(s.id)} disabled={testing === s.id}>
                    {testing === s.id ? 'Testing...' : 'Test'}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleSync(s.id)}>Sync</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(s)}>Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                </div>
              </div>
              <div className="text-secondary text-sm mt-2">
                <a href={s.feedUrl} target="_blank" rel="noreferrer">{s.feedUrl}</a>
                <span className="ml-4">Interval: {s.crawlInterval}m</span>
                <span className="ml-4">Failures: {s.failureCount}</span>
                <span className="ml-4">Last run: {formatTimeSince(s.lastRunAt)}</span>
                <span className="ml-4">Last success: {formatTimeSince(s.lastSuccessAt)}</span>
              </div>
              {s.lastError && (
                <div className="text-danger text-sm mt-2">
                  Error: {s.lastError}
                </div>
              )}
              {testResult && (
                <div className={`text-sm mt-2 ${testResult.success ? 'text-success' : 'text-danger'}`}>
                  Test: {testResult.message} {testResult.discovered > 0 ? `(${testResult.discovered} jobs)` : ''}
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleToggle(s.id, s.enabled)}>
                  {s.enabled ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};
