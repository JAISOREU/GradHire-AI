import { EmptyState } from '../../components/EmptyState';

export const AdminEmailTemplatesPage = () => (
  <div className="page fade-in">
    <h1 className="page-title page-title--admin">Email Templates</h1>
    <p className="page-subtitle">Manage email templates and notifications.</p>
    <div className="section--mt">
      <EmptyState icon="EnvelopeSimple" title="No templates" text="Email templates will appear here when configured." />
    </div>
  </div>
);
