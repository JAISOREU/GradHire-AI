import { useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi } from '../../core/api/endpoints/students';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { SocialFeedPage } from './SocialFeedPage';
import { buildStudentRail } from './rail';
import type { Application } from '../../core/types';

const TERMINAL_STATUSES = ['HIRED', 'REJECTED', 'WITHDRAWN'];

export const StudentHomePage = () => {
  const { user } = useAuth();
  const { data: profile } = useAsync(() => studentsApi.getProfile(), []);
  const { data: completeness } = useAsync(() => studentsApi.getProfileCompleteness(), []);
  const { data: applications, loading: applicationsLoading } = useAsync(() => studentsApi.listApplications(), []);
  const { data: recommendation } = useAsync(() => recommendationsApi.ai(3), []);
  const { data: savedJobs } = useAsync(() => savedJobsApi.listMine<{ id: string }>(), []);
  const { data: interviewPage } = useAsync(() => interviewsApi.getMyInterviews(), []);

  const name = user?.name || 'Student';
  const title = profile?.focus || (user?.role === 'STUDENT' ? 'Graduate' : 'Student');

  const rail = useMemo(() => {
    const apps = (applications ?? []) as Application[];
    const inProgress = apps.filter((a) => !TERMINAL_STATUSES.includes(a.status)).length;
    const bestMatch = Math.max(0, ...(recommendation?.recommendations ?? []).map((r) => r.score || 0));
    const activity = apps
      .flatMap((a) => (a.statusHistory ?? []).map((h) => ({
        id: h.id,
        text: h.message ?? `${a.job?.title ?? 'Application'} — ${h.newStatus}`,
        createdAt: h.createdAt,
      })))
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
    return buildStudentRail({
      profileStrength: completeness?.percentage ?? 0,
      matchScore: bestMatch,
      applications: apps,
      applicationsInProgress: inProgress,
      savedJobs: savedJobs?.length ?? 0,
      activity,
    });
  }, [applications, completeness, recommendation, savedJobs, interviewPage]);

  const loading = applicationsLoading && !applications;

  return (
    <SocialFeedPage
      currentUser={{ id: user?.id ?? 'me', name, title, verified: false }}
      rail={rail}
      railLoading={loading}
    />
  );
};