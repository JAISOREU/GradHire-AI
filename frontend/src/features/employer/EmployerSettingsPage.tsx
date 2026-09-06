import { Alert } from '../../components/Alert';
import { FormEvent, useEffect, useState } from 'react';
import { employersApi } from '../../core/api/endpoints/employers';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const EmployerSettingsPage = () => {
  const { data: settings, loading } = useAsync(() => employersApi.getSettings(), []);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [recommendationAlerts, setRecommendationAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [interviewAlerts, setInterviewAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [defaultFocus, setDefaultFocus] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotifications ?? true);
      setApplicationAlerts(settings.applicationAlerts ?? true);
      setRecommendationAlerts(settings.recommendationAlerts ?? true);
      setMessageAlerts(settings.messageAlerts ?? true);
      setInterviewAlerts(settings.interviewAlerts ?? true);
      setWeeklyDigest(settings.weeklyDigest ?? false);
      setDefaultFocus(settings.defaultFocus ?? '');
    }
  }, [settings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await employersApi.updateSettings({
        emailNotifications,
        applicationAlerts,
        recommendationAlerts,
        messageAlerts,
        interviewAlerts,
        weeklyDigest,
        defaultFocus: defaultFocus || null,
      });
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
        <Card title="Notification preferences">
          <form onSubmit={handleSubmit} className="stack">
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                <span>Email notifications</span>
              </label>
              <p className="form-hint">Receive email notifications for account activity.</p>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={applicationAlerts} onChange={(e) => setApplicationAlerts(e.target.checked)} />
                <span>Application alerts</span>
              </label>
              <p className="form-hint">Email me when a candidate applies.</p>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={recommendationAlerts} onChange={(e) => setRecommendationAlerts(e.target.checked)} />
                <span>Recommendation alerts</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={messageAlerts} onChange={(e) => setMessageAlerts(e.target.checked)} />
                <span>Message alerts</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={interviewAlerts} onChange={(e) => setInterviewAlerts(e.target.checked)} />
                <span>Interview alerts</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-checkbox">
                <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
                <span>Weekly digest</span>
              </label>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="default-focus">Default focus</label>
              <input id="default-focus" className="input" value={defaultFocus} onChange={(e) => setDefaultFocus(e.target.value)} placeholder="e.g. Software Engineering" />
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
