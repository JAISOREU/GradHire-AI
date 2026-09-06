type SkeletonProps = {
  lines?: number;
  className?: string;
  variant?: 'text' | 'card' | 'table' | 'avatar' | 'profile' | 'job-card';
};

export const Skeleton = ({ lines = 3, className = '', variant = 'text' }: SkeletonProps) => {
  if (variant === 'card') {
    return (
      <div className={`skeleton-card ${className}`}>
        <div className="skeleton skeleton-text skeleton-card__title" />
        <div className="skeleton skeleton-text skeleton-card__body" />
        <div className="skeleton skeleton-text skeleton-card__body w-[90%]" />
        <div className="skeleton skeleton-text skeleton-card__body--short" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`skeleton-table ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="skeleton skeleton-table__row">
            <div className="skeleton skeleton-text skeleton-table__cell w-[40%]" />
            <div className="skeleton skeleton-text skeleton-table__cell w-[30%]" />
            <div className="skeleton skeleton-text skeleton-table__cell w-[20%]" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'avatar') {
    return <div className="skeleton avatar avatar--md" />;
  }

  if (variant === 'profile') {
    return (
      <div className={`skeleton-profile ${className}`}>
        <div className="skeleton skeleton-avatar skeleton--lg" />
        <div className="skeleton-profile__content">
          <div className="skeleton skeleton-text skeleton-profile__title" />
          <div className="skeleton skeleton-text skeleton-profile__subtitle w-[60%]" />
        </div>
      </div>
    );
  }

  if (variant === 'job-card') {
    return (
      <div className={`skeleton-job-card ${className}`}>
        <div className="skeleton-job-card__header">
          <div className="skeleton skeleton-avatar skeleton--sm" />
          <div className="skeleton-job-card__meta">
            <div className="skeleton skeleton-text skeleton-job-card__title" />
            <div className="skeleton skeleton-text skeleton-job-card__company w-[70%]" />
          </div>
        </div>
        <div className="skeleton skeleton-text skeleton-job-card__description" />
        <div className="skeleton skeleton-text skeleton-job-card__description w-[90%]" />
        <div className="skeleton-job-card__skills">
          <div className="skeleton skeleton-text skeleton-job-card__skill" />
          <div className="skeleton skeleton-text skeleton-job-card__skill" />
          <div className="skeleton skeleton-text skeleton-job-card__skill" />
        </div>
      </div>
    );
  }

  return (
    <div className={`skeleton skeleton-text grid gap-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton skeleton-text h-4"
          style={{
            width: `${Math.max(30, 100 - index * 15)}%`,
          }}
        />
      ))}
    </div>
  );
};
