import { EmptyState } from '../../components/EmptyState';

export const AdminAiMonitoringPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">AI Monitoring</h1>
    <p className="card__subtitle card__subtitle--mt">Monitor AI recommendation performance and accuracy.</p>
    <div className="section--mt">
      <EmptyState icon="🤖" title="No AI data" text="AI monitoring data will appear here when the AI service is connected." />
    </div>
  </div>
);
