type LoadingStateProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

export const LoadingState = ({ label = 'Loading…', size = 'md' }: LoadingStateProps) => {
  const spinnerClass = size === 'lg' ? 'spinner--lg' : size === 'sm' ? 'spinner--sm' : 'spinner--md';
  const labelClass = size === 'lg' ? 'text-base' : 'text-sm';
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <span className={`spinner ${spinnerClass}`} aria-hidden="true" />
      <span className={labelClass}>{label}</span>
    </div>
  );
};

