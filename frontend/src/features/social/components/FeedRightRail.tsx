import { Button } from '../../../components/Button';
import { Skeleton } from '../../../components/Skeleton';
import type { HomeRailData } from '../types';
import { RailRingCard } from './RailRingCard';

interface FeedRightRailProps {
  data: HomeRailData;
  loading?: boolean;
}

export const FeedRightRail = ({ data, loading }: FeedRightRailProps) => {
  if (loading && !data) {
    return (
      <aside className="home-feed__rail" aria-label="Home insights">
        <Skeleton variant="card" lines={10} />
      </aside>
    );
  }

  return (
    <aside className="home-feed__rail" aria-label="Home insights">
      <RailRingCard label={data.primary.label} value={data.primary.value} hint={data.primary.hint} icon="CircleNotch" />
      <RailRingCard label={data.secondary.label} value={data.secondary.value} hint={data.secondary.hint} icon="Sparkle" />

      <div className="rail-card">
        <span className="rail-card__title">Quick Stats</span>
        <ul className="rail-stats">
          {data.quickStats.map((stat) => (
            <li key={stat.label} className="rail-stats__row">
              <span>{stat.label}</span>
              <span className="rail-stats__value">{stat.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rail-card">
        <span className="rail-card__title">Recent Activity</span>
        <ul className="rail-activity">
          {data.activity.map((item) => (
            <li key={item.id} className="rail-activity__item">
              <span className="rail-activity__text">{item.text}</span>
              <span className="rail-activity__time">{item.timeAgo}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rail-card rail-cta">
        <span className="rail-cta__title">{data.cta.title}</span>
        <Button to={data.cta.to} size="sm">
          {data.cta.button}
        </Button>
      </div>
    </aside>
  );
};