import { FormEvent, useEffect, useState } from 'react';
import { studentsApi } from '../../core/api/endpoints/students';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';

export const StudentSettingsPage = () => {
  const { data: settings, loading } = useAsync(() => studentsApi.getSettings(), []);
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
      setEmailNotifications(settings.emailNotifications);
      setApplicationAlerts(settings.applicationAlerts);
      setRecommendationAlerts(settings.recommendationAlerts);
      setMessageAlerts(settings.messageAlerts);
      setInterviewAlerts(settings.interviewAlerts);
      setWeeklyDigest(settings.weeklyDigest);
      setDefaultFocus(settings.defaultFocus ?? '');
    }
  }, [settings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await studentsApi.updateSettings({
        emailNotifications,
        applicationAlerts,
        recommendationAlerts,
        messageAlerts,
        interviewAlerts,
        weeklyDigest,
        defaultFocus,
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
      <PageHeader title="Settings" subtitle="Manage your account preferences." />

      <div className="form-container">
        <Card title="Notification preferences">
          <form onSubmit={handleSubmit} className="stack">
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Email notifications</label>
              <label style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
                Receive email notifications
              </label>
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600 }}>Alerts</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={applicationAlerts} onChange={(e) => setApplicationAlerts(e.target.checked)} />
                  Application status updates
                </label>
                <label style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={recommendationAlerts} onChange={(e) => setRecommendationAlerts(e.target.checked)} />
                  New job recommendations
                </label>
                <label style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={messageAlerts} onChange={(e) => setMessageAlerts(e.target.checked)} />
                  New messages
                </label>
                <label style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={interviewAlerts} onChange={(e) => setInterviewAlerts(e.target.checked)} />
                  Interview invitations
                </label>
                <label style={{ fontWeight: 400, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={weeklyDigest} onChange={(e) => setWeeklyDigest(e.target.checked)} />
                  Weekly digest email
                </label>
              </div>
            </div>
            <FormInput label="Default focus area" id="default-focus" value={defaultFocus} onChange={(e) => setDefaultFocus(e.target.value)} placeholder="e.g. Product Management" />
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
