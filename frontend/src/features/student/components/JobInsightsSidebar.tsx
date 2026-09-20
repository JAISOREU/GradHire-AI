import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { cn } from '../../../lib/utils';

export type MarketCategory = { type: string; count: number };

export type JobInsightsSidebarProps = {
  profileSkills: string[];
  matchedJobsCount: number | null;
  loadingMatch: boolean;
  snapshot: MarketCategory[] | null;
  loadingSnapshot: boolean;
  onApplySkill: (skill: string) => void;
  onSuggestion: (query: string) => void;
};

const SUGGESTIONS: { label: string; query: string }[] = [
  { label: 'Full Stack Developer', query: 'Full Stack Developer' },
  { label: 'React Developer', query: 'React Developer' },
  { label: 'Junior Data Analyst', query: 'Junior Data Analyst' },
];

const TYPE_LABELS: Record<string, string> = {
  HIRING: 'Full-time',
  INTERNSHIP: 'Internship',
  CONTRACT: 'Contract',
  PART_TIME: 'Part-time',
  FREELANCE: 'Freelance',
  APPRENTICESHIP: 'Apprenticeship',
  TEMPORARY: 'Temporary',
};

const typeLabel = (type: string) =>
  TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const JobInsightsSidebar = ({
  profileSkills,
  matchedJobsCount,
  loadingMatch,
  snapshot,
  loadingSnapshot,
  onApplySkill,
  onSuggestion,
}: JobInsightsSidebarProps) => {
  const snapshotTotal = snapshot?.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const snapshotMax = snapshot?.reduce((max, item) => Math.max(max, item.count), 1) ?? 1;

  return (
    <div className="insights-aside">
      <section className="insight-card" aria-label="AI job match">
        <h2 className="insight-card__header">
          <PhosphorIcon name="Sparkle" size={18} weight="fill" className="text-primary" />
          AI Job Match
        </h2>
        {profileSkills.length === 0 ? (
          <div className="mt-3">
            <p className="text-sm text-text-secondary leading-relaxed">
              Add skills to your profile to unlock tailored job matches.
            </p>
            <span className="badge badge--muted mt-2 inline-block">
              <span>Profile skills</span>
            </span>
          </div>
        ) : (
          <>
            <p className="mt-3 text-2xl font-semibold text-text">
              {loadingMatch && matchedJobsCount === null ? '…' : `${matchedJobsCount ?? 0}`}
              <span className="text-sm font-normal text-text-secondary ml-1">matching roles</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {profileSkills.slice(0, 6).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className="skill-chip"
                  onClick={() => onApplySkill(skill)}
                  title={`Filter jobs by ${skill}`}
                >
                  {skill}
                  <span className="sr-only">Filter by skill</span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="insight-card" aria-label="Market snapshot">
        <h2 className="insight-card__header">
          <PhosphorIcon name="Buildings" size={18} weight="fill" className="text-primary" />
          Market snapshot
        </h2>
        {loadingSnapshot && snapshot === null ? (
          <p className="mt-3 text-sm text-text-secondary">Loading market overview…</p>
        ) : !snapshot || snapshot.length === 0 ? (
          <p className="mt-3 text-sm text-text-secondary">
            No published roles to summarize right now.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-text-secondary">
              {snapshotTotal} open roles by type
            </p>
            <ul className="mt-3 flex flex-col gap-3">
              {snapshot.slice(0, 6).map((item) => (
                <li key={item.type}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-text-secondary">{typeLabel(item.type)}</span>
                    <span className="font-medium text-text">{item.count}</span>
                  </div>
                  <div className="market-bar mt-1">
                    <div
                      className="market-bar__fill"
                      style={{ width: `${Math.max(6, Math.round((item.count / snapshotMax) * 100))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="insight-card" aria-label="Suggested search">
        <h2 className="insight-card__header">
          <PhosphorIcon name="MagnifyingGlass" size={18} weight="fill" className="text-primary" />
          Suggested search
        </h2>
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              className={cn('skill-chip skill-chip--suggestion')}
              onClick={() => onSuggestion(suggestion.query)}
            >
              {suggestion.label}
              <PhosphorIcon name="ArrowRight" size={12} weight="bold" className="text-text-tertiary" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};