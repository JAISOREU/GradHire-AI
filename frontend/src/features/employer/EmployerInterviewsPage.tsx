import { useAsync } from '../../core/hooks/useAsync';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { employersApi } from '../../core/api/endpoints/employers';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormSelect } from '../../components/FormField';
import { useState } from 'react';
import type { Interview } from '../../core/types';

export const EmployerInterviewsPage = () => {
  const { data: interviews, loading, reload } = useAsync(() => employersApi.listInterviews(), []);
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: 'VIDEO' as any, scheduledAt: '', durationMinutes: 60, timezone: '', location: '', meetingLink: '', interviewers: '', notes: '' });

  const loadJobs = async () => {
    const data = await employersApi.listJobs(1, 50);
    setJobs(data);
  };

  const loadApplicants = async (jobId: string) => {
    const data = await employersApi.listApplicants(jobId, 1, 100);
    setApplicants(data);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicationId) return;
    setSubmitting(true);
    try {
      await interviewsApi.schedule({
        applicationId: selectedApplicationId,
        type: form.type,
        scheduledAt: form.scheduledAt,
        durationMinutes: form.durationMinutes,
        timezone: form.timezone,
        location: form.location,
        meetingLink: form.meetingLink,
        interviewers: form.interviewers.split(',').map((s) => s.trim()).filter(Boolean),
        notes: form.notes,
      });
      setShowSchedule(false);
      setForm({ type: 'VIDEO', scheduledAt: '', durationMinutes: 60, timezone: '', location: '', meetingLink: '', interviewers: '', notes: '' });
      reload();
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (interviewId: string, status: string) => {
    try {
      await interviewsApi.updateStatus(interviewId, status as any);
      reload();
    } catch {
      // ignore
    }
  };

  const handleCancel = async (interviewId: string) => {
    if (!window.confirm('Cancel this interview?')) return;
    try {
      await interviewsApi.cancel(interviewId);
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="page fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <h1 className="page-title">Interview scheduling</h1>
          <p className="card__subtitle card__subtitle--mt">Manage interviews with your candidates.</p>
        </div>
        <Button onClick={() => { loadJobs(); setShowSchedule(!showSchedule); }}>{showSchedule ? 'Close' : 'Schedule interview'}</Button>
      </div>

      {showSchedule && (
        <Card title="Schedule interview" className="section--mt">
          <form onSubmit={handleSchedule} className="stack">
            <div className="form-group">
              <label className="form-label">Job</label>
              <select className="select" value={selectedJobId} onChange={(e) => { setSelectedJobId(e.target.value); loadApplicants(e.target.value); }}>
                <option value="">Select a job</option>
                {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Applicant</label>
              <select className="select" value={selectedApplicationId} onChange={(e) => setSelectedApplicationId(e.target.value)}>
                <option value="">Select an applicant</option>
                {applicants.map((a) => <option key={a.id} value={a.id}>{a.student?.profile?.name || a.student?.email}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Scheduled at" id="int-scheduled" type="datetime-local" required value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              <FormInput label="Duration (minutes)" id="int-duration" type="number" value={String(form.durationMinutes)} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Timezone" id="int-tz" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="e.g. Asia/Manila" />
              <FormSelect label="Type" id="int-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={[
                { value: 'VIDEO', label: 'Video' },
                { value: 'PHONE', label: 'Phone' },
                { value: 'ONSITE', label: 'On-site' },
                { value: 'ASSESSMENT', label: 'Assessment' },
              ]} />
            </div>
            <FormInput label="Location / Meeting link" id="int-location" value={form.meetingLink || form.location} onChange={(e) => setForm({ ...form, meetingLink: e.target.value, location: e.target.value })} placeholder="https://meet.example.com/..." />
            <FormInput label="Interviewers (comma separated)" id="int-interviewers" value={form.interviewers} onChange={(e) => setForm({ ...form, interviewers: e.target.value })} placeholder="Jane Doe, John Smith" />
            <FormInput label="Notes" id="int-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any preparation notes..." />
            <Button type="submit" disabled={submitting}>{submitting ? 'Scheduling…' : 'Schedule'}</Button>
          </form>
        </Card>
      )}

      <div className="list mt-4">
        {loading ? (
          <LoadingState label="Loading interviews…" />
        ) : interviews && (interviews as any).items?.length > 0 ? (
          (interviews as any).items.map((inv: Interview) => (
            <article key={inv.id} className="list-item">
              <div className="list-item__head">
                <div>
                  <h3 className="card__title">{inv.application?.student?.profile?.name || 'Candidate'}</h3>
                  <div className="list-item__meta">
                    <span>{inv.application?.job?.title}</span>
                    <span>{new Date(inv.scheduledAt).toLocaleString()}</span>
                    <span>{inv.durationMinutes} min</span>
                    {inv.type && <span>{inv.type}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select className="select" value={inv.status} onChange={(e) => handleUpdateStatus(inv.id, e.target.value)}>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No show</option>
                  </select>
                  {inv.status !== 'CANCELLED' && (
                    <Button variant="danger" size="sm" onClick={() => handleCancel(inv.id)}>Cancel</Button>
                  )}
                </div>
              </div>
              {inv.meetingLink && (
                <a href={inv.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm section--mt" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  Join meeting
                </a>
              )}
              {inv.notes && <p className="text-sm text-secondary section--mt">Notes: {inv.notes}</p>}
              {inv.feedback && <p className="text-sm text-secondary section--mt">Feedback: {inv.feedback}</p>}
            </article>
          ))
        ) : (
          <EmptyState icon="🗓️" title="No interviews scheduled" text="When you schedule interviews, they'll appear here." />
        )}
      </div>
    </div>
  );
};
