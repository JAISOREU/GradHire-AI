import { useNavigate } from 'react-router-dom';
import { PhosphorIcon, type PhosphorIconName } from '../../../components/PhosphorIcon';

type ActivityEvent = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  jobTitle?: string;
};

type DashboardActivityProps = {
  events: ActivityEvent[];
  upcomingInterviews?: Array<{ id: string; jobTitle: string; scheduledAt: string }>;
  loading?: boolean;
};

const EVENT_ICONS: Record<string, PhosphorIconName> = {
  applied: 'PaperPlaneRight',
  viewed: 'Eye',
  screening: 'MagnifyingGlass',
  interview: 'Calendar',
  offer: 'Handshake',
  rejected: 'XCircle',
  hired: 'CheckCircle',
};

export const DashboardActivity = ({ events, upcomingInterviews = [], loading }: DashboardActivityProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-surface-muted mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-surface-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5">
      <h2 className="text-base font-semibold text-text mb-4">Your Activity</h2>

      {upcomingInterviews.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-text-secondary">Upcoming Interviews</p>
          {upcomingInterviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2.5"
            >
              <PhosphorIcon name="Calendar" size={16} weight="fill" className="text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{interview.jobTitle}</p>
                <p className="text-xs text-text-secondary">
                  {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-text-secondary py-4 text-center">
          Start exploring jobs to see your activity here.
        </p>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => {
            const iconName = EVENT_ICONS[event.type] || 'Clock';
            return (
              <div key={event.id} className="flex items-start gap-2.5 py-1.5">
                <PhosphorIcon name={iconName} size={16} weight="fill" className="mt-0.5 text-text-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text">{event.message}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {events.length > 0 && (
        <button
          onClick={() => navigate('/student/applications')}
          className="mt-3 text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
        >
          View all applications <PhosphorIcon name="ArrowRight" size={14} />
        </button>
      )}
    </div>
  );
};