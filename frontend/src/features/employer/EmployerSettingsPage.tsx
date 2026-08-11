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
      <h1 className="page-title">Settings</h1>
      <p className="card__subtitle card__subtitle card__subtitle--mt">Manage your account preferences.</p>

      <div className="form-container mt-4">
        <Card title="Account preferences">
          <form onSubmit={handleSubmit} className="stack">
            <div className="form-group">
              <p className="form-label">Application alerts</p>
              <label className="form-checkbox">
                <input type="checkbox" checked={applicationAlerts} onChange={(e) => setApplicationAlerts(e.target.checked)} />
                <span>Email me when a candidate applies</span>
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



