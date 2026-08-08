type LoadingStateProps = {
  label?: string;
};

export const LoadingState = ({ label = 'Loading…' }: LoadingStateProps) => (
  <div className="loading-state" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

