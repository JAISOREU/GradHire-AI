import { useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { analyticsApi, employersApi } from '../../core/api/endpoints/employers';
import { SocialFeedPage } from './SocialFeedPage';
import { buildEmployerRail } from './rail';
import type { Application } from '../../core/types';

type EmployerApplicant = Application & {
  student?: { profile?: { name?: string } | null } | null;
};

export const EmployerHomePage = () => {
  const { user } = useAuth();
  const { data: analytics, loading: analyticsLoading } = useAsync(() => analyticsApi.getSnapshot(), []);
  const { data: applicants, loading: applicantsLoading } = useAsync(() => employersApi.listApplicants(), []);

  const rail = useMemo(() => {
    const snap = analytics as { activeJobs?: number; applicationsToday?: number; views?: number; pendingInterviews?: number } | null | undefined;
    const recent = ((applicants ?? []) as EmployerApplicant[]).map((a) => ({
      id: a.id,
      name: a.student?.profile?.name ?? 'A candidate',
      appliedAt: a.submittedAt,
    }));
    return buildEmployerRail({
      activeJobs: snap?.activeJobs ?? 0,
      applicantsToday: snap?.applicationsToday ?? 0,
      views: snap?.views ?? 0,
      pendingInterviews: snap?.pendingInterviews ?? 0,
      recentApplicants: recent,
    });
  }, [analytics, applicants]);

  const loading = (analyticsLoading && !analytics) || (applicantsLoading && !applicants);
  const name = user?.name || 'Employer';

  return (
    <SocialFeedPage
      currentUser={{ id: user?.id ?? 'me', name, title: 'Hiring Team', verified: false }}
      rail={rail}
      railLoading={loading}
    />
  );
};