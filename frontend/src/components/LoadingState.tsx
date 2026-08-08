type LoadingStateProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZE_MAP = {
  sm: '16px',
  md: '24px',
  lg: '32px',
};

export const LoadingState = ({ label = 'Loading…', size = 'md' }: LoadingStateProps) => (
  <div className="loading-state" role="status" aria-live="polite">
    <span className="spinner" aria-hidden="true" style={{ width: SIZE_MAP[size], height: SIZE_MAP[size], borderWidth: size === 'lg' ? '4px' : '3px' }} />
    <span style={{ fontSize: size === 'lg' ? 'var(--text-base)' : 'var(--text-sm)' }}>{label}</span>
  </div>
);

