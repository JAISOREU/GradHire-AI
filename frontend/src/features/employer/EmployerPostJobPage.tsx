import { FormEvent, useState } from 'react';
import { jobsApi } from '../../core/api/endpoints/jobs';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea, FormSelect } from '../../components/FormField';

export const EmployerPostJobPage = () => {
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'HIRING', description: '' });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('Posting job…');
    try {
      await jobsApi.create(form);
      setMessage('Job posted successfully.');
      setForm({ title: '', company: '', location: '', type: 'HIRING', description: '' });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page fade-in">
      <h1 className="page-title">Post a job</h1>
      <p className="card__subtitle" style={{ marginTop: '0.25rem' }}>Create a hiring role or an internship.</p>

      <div className="form-container">
        <Card title="Job details">
          <form onSubmit={handleSubmit} className="stack">
            <FormInput label="Title" id="job-title" required value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} placeholder="e.g. Senior React Engineer" />
            <FormInput label="Company" id="job-company" required value={form.company} onChange={(e) => setForm((c) => ({ ...c, company: e.target.value }))} placeholder="Company name" />
            <FormInput label="Location" id="job-location" value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} placeholder="e.g. Remote, Austin, TX" />
            <FormSelect label="Type" id="job-type" value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))} options={[
              { value: 'HIRING', label: 'Hiring' },
              { value: 'INTERNSHIP', label: 'Internship' },
            ]} />
            <FormTextarea label="Description" id="job-desc" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="Role overview, responsibilities, requirements…" />
            <div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Posting…' : 'Post job'}</Button>
            </div>
            {message && <div className="message message--info" role="status">{message}</div>}
          </form>
        </Card>
      </div>
    </div>
  );
};
