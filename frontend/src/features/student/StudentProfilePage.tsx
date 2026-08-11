import { FormEvent, useEffect, useState } from 'react';
import { studentsApi } from '../../core/api/endpoints/students';
import { getRoleLabel } from '../../core/utils/roleLabels';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';

export const StudentProfilePage = () => {
  const { user } = useAuth();
  const { data: profile, loading } = useAsync(() => studentsApi.getProfile(), []);
  const [name, setName] = useState(user?.name ?? '');
  const [focus, setFocus] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setFocus(profile.focus);
    }
  }, [profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const updated = await studentsApi.updateProfile({ name: name || getRoleLabel('STUDENT'), focus });
      setMessage(`Saved profile for ${updated.name}.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page fade-in"><div className="loading-state"><span className="spinner" aria-hidden="true" /><span>Loading profile…</span></div></div>;
  }

  return (
    <div className="page fade-in">
      <PageHeader title={`${getRoleLabel('STUDENT')} profile`} subtitle="Keep your details up to date for better AI matches." />

      <div className="form-container">
        <Card title="Profile details">
          <form onSubmit={handleSubmit} className="stack">
            <FormInput label="Name" id="talent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <FormTextarea label="Focus area" id="talent-focus" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="e.g. Full-stack development and AI products" />
            <div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save changes'}</Button>
            </div>
            {message && <div className="message message--info" role="status">{message}</div>}
          </form>
        </Card>
      </div>
    </div>
  );
};
