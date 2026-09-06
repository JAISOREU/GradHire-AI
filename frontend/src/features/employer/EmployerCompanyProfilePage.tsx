import { Alert } from '../../components/Alert';
import { FormEvent, useEffect, useState } from 'react';
import { employersApi } from '../../core/api/endpoints/employers';
import { useAsync } from '../../core/hooks/useAsync';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea } from '../../components/FormField';
import { PageHeader } from '../../components/PageHeader';
import { Progress } from '../../components/Progress';

type EmployerCompanyProfile = {
  companyName?: string;
  name?: string;
  industry?: string;
  location?: string;
  description?: string;
  website?: string;
  phone?: string;
  verified?: boolean;
};

export const EmployerCompanyProfilePage = () => {
  const { data: profile, loading } = useAsync(() => employersApi.getProfile(), []);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setName((profile as EmployerCompanyProfile).companyName ?? (profile as EmployerCompanyProfile).name ?? '');
      setIndustry((profile as EmployerCompanyProfile).industry ?? '');
      setLocation((profile as EmployerCompanyProfile).location ?? '');
      setDescription((profile as EmployerCompanyProfile).description ?? '');
      setWebsite((profile as EmployerCompanyProfile).website ?? '');
      setPhone((profile as EmployerCompanyProfile).phone ?? '');
    }
  }, [profile]);

  const completion = [
    name,
    industry,
    location,
    description,
    website,
    phone,
  ].filter(Boolean).length;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const updated = await employersApi.updateProfile({ companyName: name, industry, location, description, website, phone });
      setMessage(`Saved company profile for ${(updated as EmployerCompanyProfile).companyName ?? name}.`);
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
      <PageHeader title="Company profile" subtitle="Tell candidates about your company." />

      <div className="section--mt">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="card__title">Profile completion</h3>
              <p className="text-secondary text-sm">Complete your profile to attract more candidates.</p>
            </div>
            <span className="text-sm font-medium">{Math.round((completion / 6) * 100)}%</span>
          </div>
          <Progress value={completion} max={6} className="mb-4" />
        </Card>
      </div>

      <div className="form-container section--mt">
        <form onSubmit={handleSubmit} className="stack">
          <Card title="Company details">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Company name" id="company-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." required />
              <FormInput label="Industry" id="company-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Technology, Healthcare" />
              <FormInput label="Location" id="company-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, Austin, TX" />
              <FormInput label="Website" id="company-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
              <FormInput label="Phone" id="company-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
            </div>
          </Card>

          <Card title="About">
            <FormTextarea label="Description" id="company-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes your company a great place to work?" />
          </Card>

          <div>
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save company profile'}</Button>
          </div>
          {message && <Alert variant="info">{message}</Alert>}
        </form>
      </div>
    </div>
  );
};
