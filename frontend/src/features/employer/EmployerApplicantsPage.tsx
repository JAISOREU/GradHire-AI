import { useState } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { employersApi } from '../../core/api/endpoints/employers';
import { applicationsApi } from '../../core/api/endpoints/applications';
import { useToast } from '../../core/toast/ToastContext';
import { Badge, resolveBadgeKind } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { Avatar } from '../../components/Avatar';
import { Tooltip } from '../../components/Tooltip';
import { PhosphorIcon } from '../../components/PhosphorIcon';
import type { ApplicationStatus } from '../../core/types';

type Applicant = {
  id: string;
  status: string;
  submittedAt?: string;
  viewedAt?: string;
  student?: { profile?: { name?: string; skills?: string[]; focus?: string } | null } | null;
  job?: { title?: string; company?: string } | null;
  lastEvent?: { previousStatus?: string; newStatus?: string; createdAt?: string } | null;
  interview?: { scheduledAt?: string; type?: string; status?: string } | null;
};

const STATUS_OPTIONS: { value: ApplicationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'SUBMITTED', label: 'New' },
  { value: 'UNDER_REVIEW', label: 'Reviewed' },
  { value: 'ASSESSMENT', label: 'Assessment' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export const EmployerApplicantsPage = () => {
  const [jobId, setJobId] = useState('');
  const { data: applicants, loading, reload } = useAsync(() => employersApi.listApplicants(jobId || undefined), [jobId]);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { addToast } = useToast();

  const items = (applicants as Applicant[] | undefined) ?? [];

  const filtered = items.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const name = app.student?.profile?.name?.toLowerCase() ?? '';
    const job = app.job?.title?.toLowerCase() ?? '';
    const query = search.toLowerCase();
    const matchesSearch = !query || name.includes(query) || job.includes(query);
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (id: string, status: ApplicationStatus) => {
    setUpdatingId(id);
    try {
      await applicationsApi.updateStatus(id, status);
      addToast('success', `Application moved to ${status.replace(/_/g, ' ').toLowerCase()}`);
      reload();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="page fade-in">
      <PageHeader title="Applicants" subtitle="Review and rank candidates across your jobs." />

      <div className="flex flex-wrap items-center gap-3 section--mt">
        <Tooltip content="Search candidates by name or job title">
          <div className="flex-1 min-w-0">
            <input
              type="search"
              className="input"
              placeholder="Search candidates or jobs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </Tooltip>
        <Tooltip content="Filter applicants by job ID">
          <div className="w-full min-w-0 flex-1 md:max-w-xs">
            <input
              type="text"
              className="input"
              placeholder="Filter by job ID (optional)"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
          </div>
        </Tooltip>
        <Tooltip content="Filter by application stage">
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </Tooltip>
      </div>

      <div className="section--mt">
        {loading ? (
          <LoadingState label="Loading applicants…" />
        ) : filtered.length > 0 ? (
          <div className="candidate-grid">
            {filtered.map((app) => {
              const skills = app.student?.profile?.skills ?? [];
              return (
                <article key={app.id} className="candidate-card">
                  <div className="candidate-card__head">
                    <Avatar src={undefined} name={app.student?.profile?.name} size="md" />
                    <div className="candidate-card__who">
                      <h3 className="candidate-card__name">{app.student?.profile?.name ?? 'Unknown'}</h3>
                      <div className="candidate-card__role">
                        {app.student?.profile?.focus || app.job?.title || 'Candidate'}
                      </div>
                      <Badge kind={resolveBadgeKind(app.status)}>{app.status.replace(/_/g, ' ').toLowerCase()}</Badge>
                    </div>
                  </div>

                  <div className="candidate-card__job">
                    <PhosphorIcon name="Briefcase" size={14} />
                    <span>{app.job?.title ?? 'Unknown role'}{app.job?.company ? ` · ${app.job.company}` : ''}</span>
                  </div>

                  {skills.length > 0 && (
                    <div className="candidate-card__skills">
                      {skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="badge badge--card-skill">
                          <PhosphorIcon name="Check" size={11} weight="bold" /> {skill}
                        </span>
                      ))}
                      {skills.length > 4 && <span className="text-xs text-tertiary">+{skills.length - 4} more</span>}
                    </div>
                  )}

                  <div className="candidate-card__meta">
                    <span>
                      <PhosphorIcon name="PaperPlaneTilt" size={13} />
                      Applied {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
                    </span>
                    {app.interview?.scheduledAt && (
                      <span>
                        <PhosphorIcon name="VideoCamera" size={13} />
                        Interview {new Date(app.interview.scheduledAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="candidate-card__actions">
                    <Tooltip content="Move this applicant to a different stage">
                      <select
                        className="select"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleStatusChange(app.id, e.target.value as ApplicationStatus);
                        }}
                        disabled={updatingId === app.id}
                      >
                        <option value="">Move stage</option>
                        <option value="UNDER_REVIEW">Review</option>
                        <option value="ASSESSMENT">Assessment</option>
                        <option value="SHORTLISTED">Shortlist</option>
                        <option value="INTERVIEW">Interview</option>
                        <option value="OFFER">Offer</option>
                        <option value="HIRED">Hire</option>
                        <option value="REJECTED">Reject</option>
                      </select>
                    </Tooltip>
                    {app.viewedAt && <span className="candidate-card__viewed">Viewed</span>}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No applicants found" text={search || statusFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Applications will appear here as candidates apply.'} />
        )}
      </div>
    </div>
  );
};