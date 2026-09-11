import { PhosphorIcon } from './PhosphorIcon';

type MatchExplanationProps = {
  matched?: string[];
  gaps?: string[];
};

export const MatchExplanation = ({ matched = [], gaps = [] }: MatchExplanationProps) => (
  <div className="space-y-2">
    {matched.length > 0 && (
      <div>
        <p className="text-xs font-medium text-text-secondary mb-1">Why this matches you</p>
        <ul className="space-y-1">
          {matched.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text">
              <PhosphorIcon name="Check" size={14} weight="fill" className="mt-0.5 text-success flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
    {gaps.length > 0 && (
      <div>
        <p className="text-xs font-medium text-text-secondary mb-1">Skills to strengthen</p>
        <ul className="space-y-1">
          {gaps.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text">
              <PhosphorIcon name="Plus" size={14} weight="fill" className="mt-0.5 text-warning flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);