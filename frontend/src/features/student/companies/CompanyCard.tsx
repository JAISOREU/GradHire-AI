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

export const CompanyCard = ({ company }: { company: DiscoverCompany }) => {
  const { id, name, logo } = company;

  return (
    <article className="company-card card p-5 shadow-sm">
      <div className="company-card__head">
        {logo ? (
          <div className="company-card__logo">
            <img src={logo} alt={`${name} logo`} />
          </div>
        ) : (
          <div className="company-card__logo" aria-hidden="true">
            {initialsOf(name)}
          </div>
        )}
        <div className="min-w-0">
          <Link
            to={`/companies/${id}`}
            className="company-card__name block hover:text-primary transition-colors"
          >
            {name}
          </Link>
          {company.industry && (
            <span className="badge badge--muted mt-1">
              <span>{company.industry}</span>
            </span>
          )}
        </div>
      </div>

      <div className="company-card__meta">
        {company.location && (
          <span className="company-card__location">
            <PhosphorIcon name="MapPin" size={14} />
            {company.location}
          </span>
        )}
        {company.remoteAvailable && (
          <span className="badge badge--muted">
            <span>Remote-friendly</span>
          </span>
        )}
      </div>

      {company.description && <p className="company-card__desc">{company.description}</p>}

      <div className="company-card__footer">
        <span className="text-sm font-medium text-text-secondary">
          {company.openPositions > 0
            ? `${company.openPositions} open position${company.openPositions > 1 ? 's' : ''}`
            : 'No open positions'}
        </span>
        <span className="text-sm text-text-tertiary">
          {company.followerCount} follower{company.followerCount === 1 ? '' : 's'}
        </span>
      </div>
    </article>
  );
};