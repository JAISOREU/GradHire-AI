import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { ProgressRing } from '../../../components/ProgressRing';

interface RailRingCardProps {
  label: string;
  value: number;
  hint?: string;
  icon?: Parameters<typeof PhosphorIcon>[0]['name'];
}

export const RailRingCard = ({ label, value, hint, icon }: RailRingCardProps) => (
  <div className="rail-card">
    <div className="rail-ring">
      <ProgressRing value={value} size="md" label={`${Math.round(value)}%`} />
      <div className="rail-ring__meta">
        <span className="rail-card__title">
          {icon && <PhosphorIcon name={icon} size={15} />}
          {label}
        </span>
        {hint && <span className="rail-card__hint">{hint}</span>}
      </div>
    </div>
  </div>
);