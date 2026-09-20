import { Avatar } from '../../../components/Avatar';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { cn } from '../../../lib/utils';
import type { NetworkCompanyCard, NetworkPerson, NetworkSidebar } from '../../../core/types';

export type NetworkSidebarProps = {
  sidebar: NetworkSidebar;
  busyCompanyId?: string | null;
  busyPersonId?: string | null;
  onConnect?: (person: NetworkPerson) => void;
  onToggleCompanyFollow?: (company: NetworkCompanyCard) => void;
};

export const NetworkSidebarCard = ({
  sidebar,
  busyCompanyId = null,
  busyPersonId = null,
  onConnect,
  onToggleCompanyFollow,
}: NetworkSidebarProps) => (
  <aside className="flex flex-col gap-4" aria-label="Network suggestions">
    {sidebar.peopleYouMayKnow.length > 0 && (
      <section className="card p-4" data-testid="sidebar-pymk">
        <h3 className="mb-3 font-semibold text-text">People you may know</h3>
        <ul className="flex flex-col gap-3">
          {sidebar.peopleYouMayKnow.slice(0, 4).map((person) => (
            <li key={person.id} className="flex items-center gap-2">
              <Avatar src={person.avatarUrl ?? undefined} name={person.name} size="sm" userId={person.id} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{person.name}</p>
                {person.title && <p className="truncate text-xs text-text-secondary">{person.title}</p>}
              </div>
              <button
                type="button"
                className="btn btn--sm btn--secondary flex-shrink-0"
                onClick={() => onConnect?.(person)}
                disabled={busyPersonId === person.id}
                data-testid={`pymk-connect-${person.id}`}
              >
                <PhosphorIcon name="UserPlus" size={13} />
                Connect
              </button>
            </li>
          ))}
        </ul>
      </section>
    )}

    {sidebar.companiesToFollow.length > 0 && (
      <section className="card p-4" data-testid="sidebar-companies">
        <h3 className="mb-3 font-semibold text-text">Companies to follow</h3>
        <ul className="flex flex-col gap-3">
          {sidebar.companiesToFollow.slice(0, 4).map((company) => (
            <li key={company.id} className="flex items-center gap-2">
              <Avatar src={company.logo ?? undefined} name={company.name} size="sm" className="flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{company.name}</p>
                {company.industry && <p className="truncate text-xs text-text-secondary">{company.industry}</p>}
              </div>
              <button
                type="button"
                className={cn('btn btn--sm flex-shrink-0', company.followed ? 'btn--secondary' : 'btn--ghost')}
                onClick={() => onToggleCompanyFollow?.(company)}
                disabled={busyCompanyId === company.id}
                aria-pressed={company.followed}
                data-testid={`company-follow-${company.id}`}
              >
                {company.followed ? 'Following' : 'Follow'}
              </button>
            </li>
          ))}
        </ul>
      </section>
    )}

    {sidebar.popularSkills.length > 0 && (
      <section className="card p-4" data-testid="sidebar-skills">
        <h3 className="mb-3 font-semibold text-text">Popular skills right now</h3>
        <ul className="flex flex-wrap gap-1.5">
          {sidebar.popularSkills.slice(0, 8).map((skill) => (
            <li key={skill}>
              <span className="badge badge--muted">{skill}</span>
            </li>
          ))}
        </ul>
      </section>
    )}
  </aside>
);