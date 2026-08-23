import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { companiesApi } from '../../core/api/endpoints/companies';
import { employersApi } from '../../core/api/endpoints/employers';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FormInput, FormTextarea } from '../../components/FormField';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { KPICard } from '../../components/KPICard';
import type { Job } from '../../core/types';

type Company = {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  description?: string;
  logo?: string;
  jobs: Job[];
};

const EMPTY_COMPANY: Company = {
  id: '',
  name: '',
  industry: '',
  location: '',
  description: '',
  logo: '',
  jobs: [],
};

export const EmployerCompaniesPage = () => {
  useAuth();
  const { data: profile, loading: profileLoading } = useAsync(() => employersApi.getProfile(), []);
  const companyName = profile?.companyName;
  const { data: company, loading: companyLoading, reload: reloadCompany } = useAsync<Company>(
    () => (companyName ? companiesApi.getById(companyName) : Promise.resolve(EMPTY_COMPANY)),
    [companyName],
  );

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name ?? '');
      setIndustry(company.industry ?? '');
      setLocation(company.location ?? '');
      setDescription(company.description ?? '');
    }
  }, [company]);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await employersApi.updateProfile({
        companyName: name,
        industry,
        location,
        description,
      });
      setMessage('Company profile updated successfully.');
      setEditing(false);
      reloadCompany();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      setName(company.name ?? '');
      setIndustry(company.industry ?? '');
      setLocation(company.location ?? '');
      setDescription(company.description ?? '');
    }
    setEditing(false);
    setMessage('');
  };

  const isLoading = profileLoading || companyLoading;
  const jobs = company?.jobs ?? [];
  const totalJobs = jobs.length;
  const totalApplicants = jobs.reduce((sum, job) => sum + ((job as any).applicantCount ?? 0), 0);

  if (isLoading) {
    return (
      <div className="page fade-in">
        <PageHeader title="Company profile" subtitle="Manage your organization's presence on Gradture." />
        <div className="section--mt">
          <LoadingState label="Loading company profile…" />
        </div>
      </div>
    );
  }

  return (
    <div className="page fade-in">
      <PageHeader title="Company profile" subtitle="Manage your organization's presence on Gradture." />

      <div className="status-strip status-strip--2 section--mt">
        <KPICard label="Total jobs" value={totalJobs} icon="🗂️" />
        <KPICard label="Total applicants" value={totalApplicants} icon="👥" />
      </div>

      <div className="section--mt">
        <Card
          title="Company details"
          action={
            !editing ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            ) : null
          }
        >
          {editing ? (
            <form onSubmit={handleSave} className="stack">
              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  label="Company name"
                  id="company-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc."
                  required
                />
                <FormInput
                  label="Industry"
                  id="company-industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology, Healthcare"
                />
                <FormInput
                  label="Location"
                  id="company-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote, Austin, TX"
                />
              </div>
              <FormTextarea
                label="Description"
                id="company-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What makes your company a great place to work?"
                rows={4}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving…' : 'Save changes'}
                </Button>
                <Button variant="secondary" type="button" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
              {message && <div className="message message--info" role="status">{message}</div>}
            </form>
          ) : (
            <div className="company-details">
              <div className="company-details__row">
                <span className="company-details__label">Company name</span>
                <span className="company-details__value">{company?.name || '—'}</span>
              </div>
              <div className="company-details__row">
                <span className="company-details__label">Industry</span>
                <span className="company-details__value">{company?.industry || '—'}</span>
              </div>
              <div className="company-details__row">
                <span className="company-details__label">Location</span>
                <span className="company-details__value">{company?.location || '—'}</span>
              </div>
              <div className="company-details__row">
                <span className="company-details__label">Description</span>
                <span className="company-details__value">{company?.description || '—'}</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="section--mt">
        <Card
          title="Job postings"
          subtitle={`${totalJobs} active posting${totalJobs !== 1 ? 's' : ''}`}
          action={
            <Button variant="ghost" size="sm" to="/employer/post-job">
              + Post job
            </Button>
          }
        >
          {totalJobs > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Applicants</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-secondary text-sm">{job.company}</div>
                      </td>
                      <td className="text-sm">{job.type}</td>
                      <td className="text-sm">{job.location || 'Remote'}</td>
                      <td><Badge kind={resolveBadgeKind(job.status)}>{job.status}</Badge></td>
                      <td className="text-secondary text-sm">{(job as any).applicantCount ?? 0}</td>
                      <td>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" to={`/employer/edit-job/${job.id}`}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" to={`/employer/applicants?jobId=${job.id}`}>
                            Applicants
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="💼"
              title="No job postings yet"
              text="Post your first opening to start receiving applicants."
              action={<Button size="sm" to="/employer/post-job">Post a job</Button>}
            />
          )}
        </Card>
      </div>
    </div>
  );
};
