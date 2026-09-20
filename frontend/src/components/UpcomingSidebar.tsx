import { PhosphorIcon, type PhosphorIconName } from './PhosphorIcon';
import type { UpcomingItem } from './notificationsRules';

export type { UpcomingItem };

interface UpcomingSidebarProps {
  interviews: UpcomingItem[];
  deadlines: UpcomingItem[];
}

const SectionTitle = ({ icon, children }: { icon: PhosphorIconName; children: React.ReactNode }) => (
  <h3 className="notif-aside__title">
    <PhosphorIcon name={icon} size={16} weight="fill" className="text-primary" />
    {children}
  </h3>
);

const ItemList = ({ items }: { items: UpcomingItem[] }) => (
  <ul className="notif-aside__list">
    {items.map((item) => (
      <li key={item.id} className="notif-aside__item">
        <div className="notif-aside__item-main">
          <span className="notif-aside__item-title">{item.company}</span>
          <span className="notif-aside__item-sub">{item.title}</span>
        </div>
        <span className="notif-aside__item-meta">{item.when}</span>
      </li>
    ))}
  </ul>
);

export const UpcomingSidebar = ({ interviews, deadlines }: UpcomingSidebarProps) => (
  <aside className="notif-aside" aria-label="Upcoming">
    <section className="notif-aside__card">
      <SectionTitle icon="Calendar">Upcoming Interviews</SectionTitle>
      {interviews.length > 0 ? (
        <ItemList items={interviews} />
      ) : (
        <p className="notif-aside__empty">
          <PhosphorIcon name="Calendar" size={16} className="text-text-tertiary" />
          No upcoming interviews
        </p>
      )}
    </section>

    <section className="notif-aside__card">
      <SectionTitle icon="Clock">Application Deadlines</SectionTitle>
      {deadlines.length > 0 ? (
        <ItemList items={deadlines} />
      ) : (
        <p className="notif-aside__empty">
          <PhosphorIcon name="Clock" size={16} className="text-text-tertiary" />
          No application deadlines
        </p>
      )}
    </section>
  </aside>
);