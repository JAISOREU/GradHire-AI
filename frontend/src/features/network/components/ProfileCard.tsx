import { cn } from '../../../lib/utils';
import { Avatar } from '../../../components/Avatar';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import type { NetworkPerson } from '../../../core/types';

export type ProfileCardProps = {
  person: NetworkPerson;
  busy?: boolean;
  onConnect?: (person: NetworkPerson) => void;
  onAccept?: (person: NetworkPerson) => void;
  onDecline?: (person: NetworkPerson) => void;
  onRemove?: (person: NetworkPerson) => void;
  onToggleFollow?: (person: NetworkPerson) => void;
  onMessage?: (person: NetworkPerson) => void;
  className?: string;
};

export const ProfileCard = ({
  person,
  busy = false,
  onConnect,
  onAccept,
  onDecline,
  onRemove,
  onToggleFollow,
  onMessage,
  className,
}: ProfileCardProps) => {
  const actionBusy = busy;

  const message = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMessage?.(person);
  };

  return (
    <article
      className={cn(
        'card relative flex flex-col gap-3 p-4 transition-shadow hover:shadow-md',
        className,
      )}
      data-testid={`profile-card-${person.id}`}
    >
      <div className="flex items-start gap-3">
        <Avatar
          src={person.avatarUrl ?? undefined}
          name={person.name}
          size="lg"
          userId={person.id}
          className="flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-text">{person.name}</h3>
          {person.title && <p className="truncate text-sm text-text-secondary">{person.title}</p>}
          {person.organization && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-text-tertiary">
              <PhosphorIcon name="Buildings" size={13} />
              <span className="truncate">{person.organization}</span>
            </p>
          )}
        </div>
      </div>

      {person.mutualCount > 0 && (
        <p className="text-xs text-text-secondary">
          <span className="font-medium text-text">{person.mutualCount} mutual connection{person.mutualCount > 1 ? 's' : ''}</span>
        </p>
      )}

      {person.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {person.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="badge badge--muted truncate max-w-full">{skill}</span>
          ))}
          {person.skills.length > 3 && (
            <span className="badge badge--muted">+{person.skills.length - 3}</span>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        {person.relation === 'CONNECTED' && (
          <>
            <button
              type="button"
              className="btn btn--sm btn--primary"
              onClick={message}
              data-testid={`message-${person.id}`}
            >
              <PhosphorIcon name="PaperPlaneRight" size={14} weight="bold" />
              <span className="hidden sm:inline">Message</span>
            </button>
            {typeof onRemove === 'function' && (
              <button
                type="button"
                className="btn btn--sm btn--ghost"
                onClick={() => onRemove(person)}
                disabled={actionBusy}
                data-testid={`remove-${person.id}`}
                title="Remove connection"
              >
                <PhosphorIcon name="UserMinus" size={14} />
                <span className="hidden sm:inline">Remove</span>
              </button>
            )}
          </>
        )}

        {person.relation === 'PENDING_IN' && (
          <>
            <button
              type="button"
              className="btn btn--sm btn--primary"
              onClick={() => onAccept?.(person)}
              disabled={actionBusy}
              data-testid={`accept-${person.id}`}
            >
              <PhosphorIcon name="Check" size={14} weight="bold" />
              Accept
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={() => onDecline?.(person)}
              disabled={actionBusy}
              data-testid={`decline-${person.id}`}
            >
              <PhosphorIcon name="X" size={14} />
              Decline
            </button>
          </>
        )}

        {person.relation === 'PENDING_OUT' && (
          <button
            type="button"
            className="btn btn--sm"
            disabled
            data-testid={`pending-${person.id}`}
            aria-label="Invitation sent"
          >
            <PhosphorIcon name="Clock" size={14} />
            Pending
          </button>
        )}

        {person.relation === 'NONE' && (
          <>
            <button
              type="button"
              className="btn btn--sm btn--primary"
              onClick={() => onConnect?.(person)}
              disabled={actionBusy}
              data-testid={`connect-${person.id}`}
            >
              <PhosphorIcon name="UserPlus" size={14} weight="bold" />
              Connect
            </button>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              onClick={message}
              data-testid={`message-${person.id}`}
            >
              <PhosphorIcon name="PaperPlaneRight" size={14} />
              <span className="hidden sm:inline">Message</span>
            </button>
          </>
        )}

        {typeof onToggleFollow === 'function' && (
          <button
            type="button"
            className={cn('btn btn--sm ml-auto', person.followed ? 'btn--secondary' : 'btn--ghost')}
            onClick={() => onToggleFollow(person)}
            disabled={actionBusy}
            data-testid={`follow-${person.id}`}
            aria-pressed={person.followed}
          >
            <PhosphorIcon name={person.followed ? 'Check' : 'UserPlus'} size={14} />
            {person.followed ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </article>
  );
};