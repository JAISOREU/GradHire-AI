import { FormEvent, useEffect, useState } from 'react';
import { employersApi } from '../../core/api/endpoints/employers';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea } from '../../components/FormField';

export const EmployerCompanyProfilePage = () => {
  const { data: profile, loading } = useAsync(() => employersApi.getProfile(), []);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName((profile as { name?: string }).name ?? '');
      setIndustry((profile as { industry?: string }).industry ?? '');
      setLocation((profile as { location?: string }).location ?? '');
      setDescription((profile as { description?: string }).description ?? '');
    }
  }, [profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const updated = await employersApi.updateProfile({ name, industry, location, description });
      setMessage(`Saved company profile for ${(updated as { name?: string }).name ?? name}.`);
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
      <h1 className="page-title">Company profile</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Tell candidates about your company.</p>

      <div className="form-container">
        <Card title="Company details">
          <form onSubmit={handleSubmit} className="stack">
            <FormInput label="Company name" id="company-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." required />
            <FormInput label="Industry" id="company-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology, Healthcare" />
            <FormInput label="Location" id="company-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, Austin, TX" />
            <FormTextarea label="Description" id="company-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes your company a great place to work?" />
            <div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save company profile'}</Button>
            </div>
            {message && <div className="message message--info" role="status">{message}</div>}
          </form>
        </Card>
      </div>
    </div>
  );
};
