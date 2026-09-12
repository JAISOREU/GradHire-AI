import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export const StudentNetworkPage = () => (
  <div className="page fade-in">
    <PageHeader title="Network" subtitle="Connect with professionals and grow your career." />
    <div className="mt-6">
      <EmptyState
        icon="UsersThree"
        title="Network coming soon"
        text="Build professional connections, follow industry leaders, and expand your opportunities."
      />
    </div>
  </div>
);