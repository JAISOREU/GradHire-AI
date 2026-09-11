import { useState } from 'react';
import { PhosphorIcon } from './PhosphorIcon';
import { cn } from '../lib/utils';

type ParsedFilters = {
  keywords: string[];
  location: string;
  experience: string;
  workplace: string;
};

type NLSearchInputProps = {
  onParse: (filters: ParsedFilters) => void;
  className?: string;
};

function parseNaturalLanguage(input: string): ParsedFilters {
  const lower = input.toLowerCase();
  const filters: ParsedFilters = { keywords: [], location: '', experience: '', workplace: '' };

  // Extract workplace type
  if (/\b(remote|wfh|work from home)\b/.test(lower)) filters.workplace = 'REMOTE';
  else if (/\b(onsite|on-site|in-office)\b/.test(lower)) filters.workplace = 'ONSITE';
  else if (/\bhybrid\b/.test(lower)) filters.workplace = 'HYBRID';

  // Extract experience level
  if (/\b(senior|sr\.?)\b/.test(lower)) filters.experience = 'SENIOR';
  else if (/\b(mid|middle)\b/.test(lower)) filters.experience = 'MID';
  else if (/\b(junior|jr\.?|entry|fresh|graduate)\b/.test(lower)) filters.experience = 'JUNIOR';

  // Extract location (common Philippine cities + generic)
  const locationMatch = lower.match(/(?:near|in|at|around|located in)\s+([a-z\s]+?)(?:\s+with|\s+and|\s+for|$)/);
  if (locationMatch) filters.location = locationMatch[1].trim();

  // Extract tech keywords
  const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 'java', 'typescript', 'javascript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'graphql', 'rest', 'api', 'frontend', 'backend', 'fullstack', 'full-stack', 'devops', 'mobile', 'ios', 'android'];
  for (const kw of techKeywords) {
    if (lower.includes(kw)) filters.keywords.push(kw);
  }

  return filters;
}

export const NLSearchInput = ({ onParse, className }: NLSearchInputProps) => {
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const parsed = parseNaturalLanguage(input);
    onParse(parsed);
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <PhosphorIcon name="MagicWand" size={16} weight="fill" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setTimeout(() => setShowHint(false), 200)}
          placeholder='Try: "junior React jobs near Manila with remote options"'
          className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-text hover:bg-primary-hover transition-colors"
        >
          Search
        </button>
      </form>
      {showHint && !input && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="text-xs text-text-secondary mb-2">Examples:</p>
          <ul className="space-y-1">
            {[
              'junior React jobs near Manila with remote options',
              'senior Python developer hybrid',
              'entry-level frontend roles',
            ].map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onMouseDown={() => { setInput(ex); }}
                  className="text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
