import type { NetworkPerson } from '../../../core/types';
import { ProfileCard, type ProfileCardProps } from './ProfileCard';

export type PeopleGridProps = {
  people: NetworkPerson[];
  busyId?: string | null;
  handlers?: Omit<ProfileCardProps, 'person' | 'busy' | 'className'>;
};

export const PeopleGrid = ({ people, busyId = null, handlers = {} }: PeopleGridProps) => {
  if (people.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="people-grid">
      {people.map((person) => (
        <ProfileCard key={person.id} person={person} busy={busyId === person.id} {...handlers} />
      ))}
    </div>
  );
};