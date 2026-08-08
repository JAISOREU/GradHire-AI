type SkeletonProps = {
  lines?: number;
  className?: string;
  variant?: 'text' | 'card' | 'table' | 'avatar';
};

export const Skeleton = ({ lines = 3, className = '', variant = 'text' }: SkeletonProps) => {
  if (variant === 'card') {
    return (
      <div className={`card ${className}`} style={{ padding: 'var(--space-5)' }}>
        <div className="skeleton skeleton-text" style={{ width: '60%', height: '1.25rem', marginBottom: 'var(--space-3)' }} />
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '0.875rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '90%', height: '0.875rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '40%', height: '0.875rem', marginTop: 'var(--space-3)' }} />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`${className}`} style={{ display: 'grid', gap: 'var(--space-2)' }}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="skeleton" style={{ height: '3rem', borderRadius: 'var(--radius-md)' }} />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className="skeleton avatar avatar--md" style={{ borderRadius: 'var(--radius-full)' }} />;
  }

  return (
    <div className={`skeleton skeleton-text ${className}`} style={{ display: 'grid', gap: '0.75rem' }}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton skeleton-text"
          style={{
            width: `${Math.max(30, 100 - index * 15)}%`,
            height: '1rem',
          }}
        />
      ))}
    </div>
  );
};
