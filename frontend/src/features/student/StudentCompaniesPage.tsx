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
            className="input"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{ width: '16rem' }}
          />
        }
      />

      {error && (
        <div className="message message--error" role="alert">
          {(error as any)?.message ?? 'Failed to load companies.'}{' '}
          <button onClick={reload} className="link">Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card card--spacious">
              <div className="skeleton" style={{ height: '1.5rem', width: '70%', marginBottom: '0.75rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '40%', marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ height: '1rem', width: '50%' }} />
            </div>
          ))
        ) : visibleCompanies.length > 0 ? (
          visibleCompanies.map((company) => (
            <div key={company.id} className="card card--spacious" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to={`/companies/${company.id}`} className="link-reset" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div>
                  <h3 className="list-item__title" style={{ marginBottom: '0.5rem' }}>{company.name}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                    {company.industry && (
                      <span className="badge badge--primary">{company.industry}</span>
                    )}
                    {company.location && (
                      <span className="text-faint text-sm">{company.location}</span>
                    )}
                  </div>
                  {company.description && (
                    <p className="text-sm text-secondary" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {company.description}
                    </p>
                  )}
                </div>
              </Link>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span className="text-xs text-faint">
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
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              icon="🏢"
              title="No companies found"
              text={search ? 'Try adjusting your search terms.' : 'Check back soon for new companies.'}
            />
          </div>
        )}
      </div>

      {!loading && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Button variant="secondary" onClick={() => setPage((p) => p + 1)}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};
