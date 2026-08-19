import { EmptyState } from '../../components/EmptyState';

export const AdminFeatureFlagsPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Feature Flags</h1>
    <p className="card__subtitle card__subtitle--mt">Toggle features on and off.</p>
    <div className="section--mt">
      <EmptyState icon="🚩" title="No feature flags" text="Feature flags will appear here when configured." />
    </div>
  </div>
);
