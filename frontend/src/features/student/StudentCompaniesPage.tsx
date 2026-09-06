import { Alert } from '../../components/Alert';
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '../../core/hooks/useAsync';
import { companiesApi } from '../../core/api/endpoints/companies';
import { useAuth } from '../../core/auth/AuthContext';
import { useToast } from '../../core/toast/ToastContext';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { PageHeader } from '../../components/PageHeader';
import { Tooltip } from '../../components/Tooltip';
import { Skeleton } from '../../components/Skeleton';

const PAGE_SIZE = 12;

export const StudentCompaniesPage = () => {
  useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const { addToast } = useToast();

  const { data: companies, loading, error, reload } = useAsync(
    () => companiesApi.list(page, PAGE_SIZE),
    [page]
  );

  const allCompanies = companies ?? [];

  const visibleCompanies = useMemo(() => {
    if (!search.trim()) return allCompanies;
    const q = search.trim().toLowerCase();
    return allCompanies.filter((c) => c.name.toLowerCase().includes(q) || (c.industry ?? '').toLowerCase().includes(q));
  }, [allCompanies, search]);

  const handleFollow = async (companyId: string) => {
    const isFollowed = followed.has(companyId);
    const previousFollowed = new Set(followed);
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(companyId)) {
        next.delete(companyId);
      } else {
        next.add(companyId);
      }
      return next;
    });

    try {
      if (isFollowed) {
        await companiesApi.unfollow(companyId);
        addToast('success', 'Unfollowed company');
      } else {
        await companiesApi.follow(companyId);
        addToast('success', 'Now following company');
      }
    } catch (err) {
      setFollowed(previousFollowed);
      addToast('error', err instanceof Error ? err.message : 'Failed to update follow status');
    }
  };

  const hasMore = !search.trim() && allCompanies.length >= PAGE_SIZE;

  return (
    <div className="page fade-in">
      <PageHeader
        title="Explore companies"
        subtitle="Discover organizations hiring on Gradture."
        action={
           <input
             type="search"
             className="input w-40"
             placeholder="Search companies…"
             value={search}
             onChange={(e) => {
               setSearch(e.target.value);
               setPage(1);
             }}
           />
        }
      />

      {error && (
        <Alert>
          {error ?? 'Failed to load companies.'}{' '}
          <button onClick={reload} className="link">Retry</button>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card card--spacious">
              <Skeleton lines={3} />
            </div>
          ))
        ) : visibleCompanies.length > 0 ? (
          visibleCompanies.map((company) => (
            <div key={company.id} className="card card--spacious flex flex-col gap-3">
              <Link to={`/companies/${company.id}`} className="link-reset no-underline text-inherit">
                <div>
                  <h3 className="list-item__title mb-2">{company.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-3 items-center">
                    {company.industry && (
                      <span className="badge badge--primary">{company.industry}</span>
                    )}
                    {company.location && (
                      <span className="text-muted text-sm">{company.location}</span>
                    )}
                  </div>
                  {company.description && (
                     <p className="text-sm text-secondary line-clamp-2">
                      {company.description}
                    </p>
                  )}
                </div>
              </Link>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-muted">
                  {followed.has(company.id) ? 'Following' : 'Not following'}
                </span>
                <Tooltip content={followed.has(company.id) ? 'Unfollow this company' : 'Follow this company'}>
                  <Button
                    variant={followed.has(company.id) ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleFollow(company.id)}
                  >
                    {followed.has(company.id) ? 'Unfollow' : 'Follow'}
                  </Button>
                </Tooltip>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              icon="🏢"
              title="No companies found"
              text={search ? 'Try adjusting your search terms.' : 'Check back soon for new companies.'}
            />
          </div>
        )}
      </div>

      {!loading && hasMore && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};
