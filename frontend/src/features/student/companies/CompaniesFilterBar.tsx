import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { Tooltip } from '../../../components/Tooltip';
import type { DiscoverFilters } from '../../../core/api/endpoints/companies';

export const COMPANY_SIZES = ['1-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'];

type CompaniesFilterBarProps = {
  filters: DiscoverFilters;
  industries: string[];
  locations: string[];
  onChange: (filters: DiscoverFilters) => void;
  onClear: () => void;
};

export const CompaniesFilterBar = ({
  filters,
  industries,
  locations,
  onChange,
  onClear,
}: CompaniesFilterBarProps) => {
  const update = (patch: Partial<DiscoverFilters>) => onChange({ ...filters, ...patch });

  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.industry ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.size ? 1 : 0) +
    (filters.remote ? 1 : 0) +
    (filters.hiring ? 1 : 0);

  return (
    <div className="filter-bar flex-wrap items-center gap-3">
      <div className="hero-search__field hero-search__field--grow min-w-56">
        <PhosphorIcon name="MagnifyingGlass" size={18} className="text-text-secondary" />
        <input
          className="hero-search__input"
          type="search"
          placeholder="Search companies…"
          value={filters.search ?? ''}
          onChange={(event) => update({ search: event.target.value })}
          aria-label="Search companies"
        />
      </div>
      <Tooltip content="Filter by industry">
        <select
          className="select select--auto"
          value={filters.industry ?? ''}
          onChange={(event) => update({ industry: event.target.value || undefined })}
          aria-label="Industry"
        >
          <option value="">All industries</option>
          {industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </Tooltip>
      <Tooltip content="Filter by HQ location">
        <select
          className="select select--auto"
          value={filters.location ?? ''}
          onChange={(event) => update({ location: event.target.value || undefined })}
          aria-label="Location"
        >
          <option value="">All locations</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </Tooltip>
      <Tooltip content="Filter by company size">
        <select
          className="select select--auto"
          value={filters.size ?? ''}
          onChange={(event) => update({ size: event.target.value || undefined })}
          aria-label="Company size"
        >
          <option value="">Any size</option>
          {COMPANY_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} employees
            </option>
          ))}
        </select>
      </Tooltip>
      <Tooltip content="Only companies with remote roles">
        <button
          type="button"
          className={`btn btn--sm ${filters.remote ? 'btn--primary' : 'btn--secondary'} whitespace-nowrap`}
          onClick={() => update({ remote: !filters.remote })}
          aria-pressed={!!filters.remote}
        >
          <PhosphorIcon name="CloudArrowUp" size={14} />
          Remote
        </button>
      </Tooltip>
      <Tooltip content="Only companies currently hiring">
        <button
          type="button"
          className={`btn btn--sm ${filters.hiring ? 'btn--primary' : 'btn--secondary'} whitespace-nowrap`}
          onClick={() => update({ hiring: !filters.hiring })}
          aria-pressed={!!filters.hiring}
        >
          <PhosphorIcon name="TrendUp" size={14} />
          Hiring
        </button>
      </Tooltip>
      {activeCount > 0 && (
        <>
          <span className="text-sm text-text-secondary whitespace-nowrap">
            {activeCount} filter{activeCount > 1 ? 's' : ''} active
          </span>
          <Tooltip content="Remove all filters">
            <button type="button" className="btn btn--sm btn--secondary whitespace-nowrap" onClick={onClear}>
              Clear all filters
            </button>
          </Tooltip>
        </>
      )}
    </div>
  );
};