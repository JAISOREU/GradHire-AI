import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { jobsApi } from '../../../core/api/endpoints/jobs';
import { studentsApi } from '../../../core/api/endpoints/students';
import { Alert } from '../../../components/Alert';
import type { Job } from '../../../core/types';

export interface AddApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appliedJobIds: string[];
  onAdded: (count: number) => void | Promise<void>;
}

export const AddApplicationModal = ({ open, onOpenChange, appliedJobIds, onAdded }: AddApplicationModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedNow, setAppliedNow] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    try {
      const page = await jobsApi.listPaginated({ search: q, page: 1, limit: 12 });
      setResults(page.items ?? []);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : 'Failed to search jobs.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    setError('');
    try {
      await studentsApi.apply(jobId);
      setAppliedNow((prev) => new Set(prev).add(jobId));
      await onAdded(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply. Please try again.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
          <DialogDescription>Find and apply to a job from the listings below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSearch} className="apps-modal__search">
          <input
            type="text"
            aria-label="Search jobs, roles, or companies"
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, roles, or companies…"
          />
          <button type="submit" className="btn btn--primary btn--sm" disabled={loading || !query.trim()}>
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
        {error && <Alert>{error}</Alert>}
        <div className="apps-modal__results">
          {results.length > 0 && (
            <ul className="apps-modal__list">
              {results.map((job) => {
                const alreadyApplied = appliedJobIds.includes(job.id) || appliedNow.has(job.id);
                return (
                  <li key={job.id} className="apps-modal__item">
                    <div className="apps-modal__item-main">
                      <span className="apps-modal__item-title">{job.title}</span>
                      <span className="apps-modal__item-company">{job.company}</span>
                      <span className="apps-modal__item-meta">{job.location} · {job.type?.replace('_', ' ')}</span>
                    </div>
                    {alreadyApplied ? (
                      <span className="apps-modal__badge">Applied</span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--primary btn--sm"
                        disabled={applyingId === job.id}
                        onClick={() => void handleApply(job.id)}
                      >
                        {applyingId === job.id ? 'Applying…' : `Apply to ${job.title}`}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {!loading && results.length === 0 && !error && query.trim() && (
            <p className="apps-modal__empty">No jobs found for that search.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};