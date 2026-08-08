import { FormEvent, useEffect, useState } from 'react';
import { employersApi } from '../../core/api/endpoints/employers';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const EmployerSettingsPage = () => {
  const { data: settings, loading } = useAsync(() => employersApi.getSettings(), []);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setApplicationAlerts(settings.applicationAlerts);
    }
  }, [settings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await employersApi.updateSettings({ applicationAlerts });
      setMessage('Settings saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page fade-in"><div className="loading-state"><span className="spinner" aria-hidden="true" /><span>Loading settings…</span></div></div>;
  }

  return (
    <div className="page fade-in">
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Settings</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Manage your account preferences.</p>

      <div style={{ marginTop: '1.25rem', maxWidth: '560px' }}>
        <Card title="Account preferences">
          <form onSubmit={handleSubmit} className="stack">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Application alerts</label>
              <label style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={applicationAlerts} onChange={(e) => setApplicationAlerts(e.target.checked)} />
                Email me when a candidate applies
              </label>
            </div>
            <div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save settings'}</Button>
            </div>
            {message && <div className="message message--info" role="status">{message}</div>}
          </form>
        </Card>
      </div>
    </div>
  );
};
