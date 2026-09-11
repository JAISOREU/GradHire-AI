import { cn } from '../lib/utils';

type Tab = {
  key: string;
  label: string;
  count?: number;
};

type JobFeedTabsProps = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
};

export const JobFeedTabs = ({ tabs, active, onChange, className }: JobFeedTabsProps) => (
  <div className={cn('flex gap-1 overflow-x-auto border-b border-border', className)} role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        role="tab"
        aria-selected={active === tab.key}
        onClick={() => onChange(tab.key)}
        className={cn(
          'flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          active === tab.key
            ? 'border-primary text-primary'
            : 'border-transparent text-text-secondary hover:text-text hover:border-border'
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn(
            'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
            active === tab.key ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-text-secondary'
          )}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
