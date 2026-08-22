import { EmptyState } from '../../components/EmptyState';

export const AdminMonitoringPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Monitoring</h1>
    <p className="card__subtitle card__subtitle--mt">Monitor recommendation performance and accuracy.</p>
    <div className="section--mt">
      <EmptyState icon="🤖" title="No recommendation data" text="Monitoring data will appear here when the recommendation service is connected." />
    </div>
  </div>
);
