import { useNavigate } from 'react-router-dom';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { PipelineTracker } from '../../../components/PipelineTracker';
import { Button } from '../../../components/Button';
import { Badge, resolveBadgeKind } from '../../../components/Badge';
import type { Application, ApplicationDocument } from '../../../core/types';

type ApplicationDetailProps = {
  application: Application;
  onWithdraw?: () => void;
};

const TERMINAL_STATUSES = ['REJECTED', 'WITHDRAWN', 'HIRED'];

const statusMessage = (status: string): string => {
  if (status === 'WITHDRAWN') return 'Application withdrawn';
  if (status === 'REJECTED') return 'Application not moved forward';
  if (status === 'HIRED') return 'Application accepted — you are hired';
  return `Status updated to ${status}`;
};

const isResume = (doc: ApplicationDocument): boolean =>
  doc.type.toLowerCase().includes('resume') || doc.name.toLowerCase().includes('resume');

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

export const ApplicationDetail = ({ application, onWithdraw }: ApplicationDetailProps) => {
  const navigate = useNavigate();
  const submittedAt = application.submittedAt ?? application.createdAt;
  const history = application.statusHistory ?? [];
  const resumes = (application.documents ?? []).filter(isResume);
  const resumeName = resumes.length > 0 ? resumes[0].name : application.resumeSnapshot;

  const canWithdraw =
    typeof onWithdraw === 'function' && !TERMINAL_STATUSES.includes(application.status);

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/student/applications')}
          className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 mb-3"
        >
          <PhosphorIcon name="ArrowLeft" size={14} /> Back to applications
        </button>
        <h1 className="text-xl font-bold text-text">{application.job?.title ?? 'Unknown'}</h1>
        <p className="text-sm text-text-secondary">
          {application.job?.company ?? 'Unknown'} · {application.job?.location ?? 'Unknown'}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <Badge kind={resolveBadgeKind(application.status)}>{application.status}</Badge>
          <span className="text-xs text-text-secondary">Applied {new Date(submittedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <PipelineTracker status={application.status} />

      <section>
        <h2 className="text-sm font-semibold text-text mb-3">Activity Timeline</h2>
        <div className="space-y-3">
          {history.map((event, i) => (
            <div key={event.id ?? i} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-text">{event.message ?? statusMessage(event.newStatus)}</p>
                <p className="text-xs text-text-secondary">{formatDate(event.createdAt)}</p>
              </div>
            </div>
          ))}
          {history.length === 0 && application.status !== 'SUBMITTED' && (
            <p className="text-xs text-text-secondary">No activity recorded yet.</p>
          )}
        </div>
      </section>

      {resumeName && (
        <section>
          <h2 className="text-sm font-semibold text-text mb-2">Documents</h2>
          <div className="flex items-center gap-2">
            <PhosphorIcon name="FileText" size={16} weight="fill" className="text-text-secondary" />
            <span className="text-sm text-text">{resumeName}</span>
          </div>
        </section>
      )}

      {application.coverLetter && (
        <section>
          <h2 className="text-sm font-semibold text-text mb-2">Cover Letter</h2>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{application.coverLetter}</p>
        </section>
      )}

      {canWithdraw && (
        <div className="pt-4 border-t border-border">
          <Button variant="danger" size="sm" onClick={onWithdraw}>
            Withdraw Application
          </Button>
        </div>
      )}
    </div>
  );
};