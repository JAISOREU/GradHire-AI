import { Link } from 'react-router-dom';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import type { DiscoverCompany } from '../../../core/api/endpoints/companies';

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const CompanyRow = ({ company }: { company: DiscoverCompany }) => {
  const { id, name, logo } = company;

  return (
    <li>
      <Link
        to={`/companies/${id}`}
        className="list-item group"
        aria-label={`View ${name}`}
      >
        {logo ? (
          <div className="list-item__logo">
            <img src={logo} alt={`${name} logo`} />
          </div>
        ) : (
          <div className="list-item__logo" aria-hidden="true">
            {initialsOf(name)}
          </div>
        )}
        <div className="list-item__body min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="list-item__title">{name}</span>
            {company.industry && (
              <span className="badge badge--muted">
                <span>{company.industry}</span>
              </span>
            )}
            {company.remoteAvailable && (
              <span className="badge badge--muted">
                <span>Remote-friendly</span>
              </span>
            )}
          </div>
          <div className="list-item__meta flex items-center gap-2 flex-wrap">
            {company.location && (
              <span className="inline-flex items-center gap-1">
                <PhosphorIcon name="MapPin" size={14} />
                {company.location}
              </span>
            )}
            <span>
              {company.openPositions > 0
                ? `${company.openPositions} open role${company.openPositions > 1 ? 's' : ''}`
                : 'No open roles'}
            </span>
          </div>
        </div>
        <span className="list-item__action" aria-hidden="true">
          <PhosphorIcon name="ArrowRight" size={16} />
        </span>
      </Link>
    </li>
  );
};