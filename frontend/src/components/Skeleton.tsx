type SkeletonProps = {
  lines?: number;
  className?: string;
  variant?: 'text' | 'card' | 'table' | 'avatar';
};

export const Skeleton = ({ lines = 3, className = '', variant = 'text' }: SkeletonProps) => {
  if (variant === 'card') {
    return (
      <div className={`skeleton-card ${className}`}>
        <div className="skeleton skeleton-text skeleton-card__title" />
        <div className="skeleton skeleton-text skeleton-card__body" />
        <div className="skeleton skeleton-text skeleton-card__body" style={{ width: '90%' }} />
        <div className="skeleton skeleton-text skeleton-card__body--short" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`skeleton-table ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="skeleton skeleton-table__row" />
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className="skeleton avatar avatar--md" />;
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
