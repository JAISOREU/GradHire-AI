import { Alert } from '../../components/Alert';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingState } from '../../components/LoadingState';
import { PageHeader } from '../../components/PageHeader';
import { useAsync } from '../../core/hooks/useAsync';
import { companiesApi } from '../../core/api/endpoints/companies';
import { CompaniesFilterBar } from './companies/CompaniesFilterBar';
import { CompanyCard } from './companies/CompanyCard';
import { CompanyRow } from './companies/CompanyRow';
import { SkillsSidebar } from './companies/SkillsSidebar';
import type { DiscoverFilters } from '../../core/api/endpoints/companies';
import { useState } from 'react';

const PAGE_SIZE = 20;

export const StudentCompaniesPage = () => {
  const [filters, setFilters] = useState<DiscoverFilters>({});
  const [page, setPage] = useState(1);

  const { data: result, loading, error, reload } = useAsync(
    () => companiesApi.discover({ ...filters, page, limit: PAGE_SIZE }),
    [filters.search, filters.industry, filters.location, filters.size, filters.remote, filters.hiring, page],
  );

  const items = result?.items ?? [];
  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 1;
  const facets = result?.facets ?? { industries: [], locations: [] };

  const featured = items.slice(0, 3);
  const listItems = items.slice(3);

  const handleFilterChange = (next: DiscoverFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <div className="public-page fade-in">
      <section className="section-full">
        <div className="section-inner">
          <PageHeader
            title="Explore companies"
            subtitle="Discover companies, teams, and opportunities."
            action={
              total > 0 && !loading ? (
                <span className="badge badge--muted">
                  <span>{total} companies</span>
                </span>
              ) : null
            }
          />
        </div>
      </section>

      <section className="section-full">
        <div className="section-inner">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
            <div>
              <CompaniesFilterBar
                filters={filters}
                industries={facets.industries}
                locations={facets.locations}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />

              {error ? (
                <Alert className="mt-4">
                  {error ?? 'Failed to load companies.'}{' '}
                  <button onClick={reload} className="link">Retry</button>
                </Alert>
              ) : loading && items.length === 0 ? (
                <div className="mt-4">
                  <LoadingState label="Loading companies…" />
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  className="mt-4"
                  icon="Building"
                  title="No companies found"
                  text={
                    (filters.search || filters.industry || filters.location || filters.size || filters.remote || filters.hiring)
                      ? 'Try adjusting your filters to see more companies.'
                      : 'Check back soon for new companies.'
                  }
                  action={
                    (filters.search || filters.industry || filters.location || filters.size || filters.remote || filters.hiring) ? (
                      <Button variant="secondary" size="sm" onClick={handleClearFilters}>
                        Clear all filters
                      </Button>
                    ) : null
                  }
                />
              ) : (
                <>
                  {featured.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4" data-testid="featured-companies">
                      {featured.map((company) => (
                        <CompanyCard key={company.id} company={company} />
                      ))}
                    </div>
                  )}

                  <ul className="flex flex-col mt-4" aria-label="Company listings">
                    {listItems.map((company) => (
                      <CompanyRow key={company.id} company={company} />
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-text-secondary">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            <aside className="mt-6 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
              <SkillsSidebar />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
};