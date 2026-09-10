import { Alert } from '../../components/Alert';
import { FormEvent, useEffect, useState } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { adminApi } from '../../core/api/endpoints/admin';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

type PlatformSettings = {
  platformName: string;
  maintenanceMode: boolean;
  registrationOpen: boolean;
};

export const AdminSettingsPage = () => {
  const { data: settings, loading } = useAsync(() => adminApi.settings(), []);
  const [platformName, setPlatformName] = useState('Gradture');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      const s = settings as PlatformSettings;
      setPlatformName(s.platformName ?? 'Gradture');
      setMaintenanceMode(s.maintenanceMode ?? false);
      setRegistrationOpen(s.registrationOpen ?? true);
    }
  }, [settings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await adminApi.updateSettings({ platformName, maintenanceMode, registrationOpen });
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
      <h1 className="page-title page-title--admin">System Settings</h1>
      <p className="page-subtitle">Manage platform configuration.</p>

      <div className="form-container mt-4">
        <Card title="Platform settings">
          <form onSubmit={handleSubmit} className="stack">
            <div className="form-group">
              <label className="form-label" htmlFor="platform-name">Platform name</label>
              <input id="platform-name" className="input" value={platformName} onChange={(e) => setPlatformName(e.target.value)} placeholder="Gradture" />
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
                <span>Maintenance mode</span>
              </label>
              <p className="form-hint">When enabled, only admins can access the platform.</p>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={registrationOpen} onChange={(e) => setRegistrationOpen(e.target.checked)} />
                <span>Open registration</span>
              </label>
              <p className="form-hint">Allow new users to register accounts.</p>
            </div>
            <div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save settings'}</Button>
            </div>
            {message && <Alert variant="info">{message}</Alert>}
          </form>
        </Card>
      </div>
    </div>
  );
};
