import { PhosphorIcon } from './PhosphorIcon';
import { cn } from '../lib/utils';

type FilterPillProps = {
  label: string;
  onRemove: () => void;
  className?: string;
};

export const FilterPill = ({ label, onRemove, className }: FilterPillProps) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary', className)}>
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
      aria-label={`Remove ${label} filter`}
    >
      <PhosphorIcon name="X" size={12} weight="bold" />
    </button>
  </span>
);