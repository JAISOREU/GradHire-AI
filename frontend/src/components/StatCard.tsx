type StatCardProps = {
  label: string;
  value: string | number;
  icon?: string;
  hint?: string;
};

export const StatCard = ({ label, value, icon, hint }: StatCardProps) => (
  <div className="stat-card">
    <div className="stat-card__top">
      {icon && <span className="stat-card__icon" aria-hidden="true">{icon}</span>}
      <span className="stat-card__label">{label}</span>
    </div>
    <div className="stat-card__value">{value}</div>
    {hint && <div className="stat-card__hint">{hint}</div>}
  </div>
);
