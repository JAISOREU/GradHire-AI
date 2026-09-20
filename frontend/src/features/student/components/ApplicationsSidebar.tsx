import { PhosphorIcon, type PhosphorIconName } from '../../../components/PhosphorIcon';
import { statusLabel, timeAgo, type ActivityItem, type NextStepItem } from '../applicationRules';
import type { Application } from '../../../core/types';

export interface ApplicationsSidebarProps {
  upcoming: Application[];
  activity: ActivityItem[];
  steps: NextStepItem[];
  totalApplications: number;
  now?: Date;
}

const formatInterviewTime = (iso: string): string => {
  const date = new Date(iso);
  const day = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
};

const SectionTitle = ({ icon, children }: { icon: PhosphorIconName; children: React.ReactNode }) => (
  <h3 className="apps-aside__title">
    <PhosphorIcon name={icon} size={16} weight="fill" className="text-primary" />
    {children}
  </h3>
);

export const ApplicationsSidebar = ({ upcoming, activity, steps, totalApplications, now = new Date() }: ApplicationsSidebarProps) => (
  <aside className="apps-aside" aria-label="Application insights">
    <section className="apps-aside__card">
      <SectionTitle icon="Calendar">Upcoming Interviews</SectionTitle>
      {upcoming.length > 0 ? (
        <ul className="apps-aside__list">
          {upcoming.map((app) => (
            <li key={app.id} className="apps-aside__item">
              <div className="apps-aside__item-main">
                <span className="apps-aside__item-title">{app.job?.company ?? 'Unknown'}</span>
                <span className="apps-aside__item-sub">{app.job?.title ?? 'Job'}</span>
              </div>
              <span className="apps-aside__item-meta">{formatInterviewTime(app.interview!.scheduledAt)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="apps-aside__empty">
          <PhosphorIcon name="Calendar" size={16} weight="regular" className="text-text-tertiary" />
          No upcoming interviews
        </p>
      )}
    </section>

    <section className="apps-aside__card">
      <SectionTitle icon="Clock">Recent Activity</SectionTitle>
      {activity.length > 0 ? (
        <ul className="apps-aside__list">
          {activity.slice(0, 5).map((item) => (
            <li key={`${item.applicationId}-${item.at}`} className="apps-aside__item">
              <div className="apps-aside__item-main">
                <span className="apps-aside__item-title">Moved to {statusLabel(item.newStatus)}</span>
                <span className="apps-aside__item-sub">{item.company}</span>
              </div>
              <span className="apps-aside__item-meta">{timeAgo(item.at, now)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="apps-aside__empty">
          <PhosphorIcon name="Clock" size={16} weight="regular" className="text-text-tertiary" />
          No recent activity yet
        </p>
      )}
    </section>

    <section className="apps-aside__card">
      <SectionTitle icon="Lightning">Recommended Next Steps</SectionTitle>
      {steps.length > 0 ? (
        <ul className="apps-aside__list">
          {steps.map((step) => (
            <li key={`${step.applicationId}-${step.text}`} className="apps-aside__item">
              <div className="apps-aside__item-main">
                <span className="apps-aside__item-title">{step.text}</span>
                <span className="apps-aside__item-sub">{step.company}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="apps-aside__empty">
          <PhosphorIcon name="Lightning" size={16} weight="regular" className="text-text-tertiary" />
          {totalApplications === 0 ? 'Apply to jobs to get personalized next steps.' : 'No next steps right now.'}
        </p>
      )}
    </section>
  </aside>
);