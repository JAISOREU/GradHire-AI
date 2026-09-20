import { PhosphorIcon } from '../../../components/PhosphorIcon';

export type StarterPrompt = {
  key: string;
  label: string;
  prompt: string;
};

export const STARTER_PROMPTS: StarterPrompt[] = [
  { key: 'resume', label: 'Analyze my resume', prompt: 'Analyze my resume' },
  { key: 'jobs', label: 'Find jobs for me', prompt: 'Find jobs for me' },
  { key: 'profile', label: 'Improve my profile', prompt: 'Improve my profile' },
  { key: 'interview', label: 'Prepare for an interview', prompt: 'Prepare for an interview' },
  { key: 'skills', label: 'What skills should I learn?', prompt: 'What skills should I learn?' },
  { key: 'letter', label: 'Write a cover letter', prompt: 'Write a cover letter' },
];

export type StarterSuggestionsProps = {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
};

export const StarterSuggestions = ({ onSelect, disabled = false }: StarterSuggestionsProps) => (
  <section aria-label="Suggested prompts" className="px-4 py-6 sm:px-8">
    <h2 className="mb-1 text-lg font-semibold text-text">How can I help?</h2>
    <p className="mb-4 text-sm text-text-secondary">Pick a starting point or ask anything about your career.</p>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" data-testid="starter-suggestions">
      {STARTER_PROMPTS.map((s) => (
        <button
          key={s.key}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(s.prompt)}
          className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-left text-sm text-text transition-colors hover:border-primary-soft hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
          data-testid={`starter-${s.key}`}
        >
          <PhosphorIcon name="Sparkle" size={15} weight="fill" className="mt-0.5 shrink-0 text-primary" />
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  </section>
);