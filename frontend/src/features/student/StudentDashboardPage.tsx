import { Link } from 'react-router-dom';
import { BentoGrid, BentoItem } from '../../components/BentoGrid';
import { Button } from '../../components/Button';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { studentsApi } from '../../core/api/endpoints/students';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { DashboardWelcome } from './components/DashboardWelcome';
import { DashboardKPIs } from './components/DashboardKPIs';
import { DashboardRecommended } from './components/DashboardRecommended';
import { DashboardActivity } from './components/DashboardActivity';
import { DashboardCareerIntel } from './components/DashboardCareerIntel';

const TERMINAL_STATUSES = ['HIRED', 'REJECTED', 'WITHDRAWN'];

type ActivityEvent = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
};

export const StudentDashboardPage = () => {
  const { user } = useAuth();

  const { data: profile, loading: profileLoading } = useAsync(() => studentsApi.getProfile(), []);
  const { data: completeness } = useAsync(() => studentsApi.getProfileCompleteness(), []);
  const { data: applications, loading: applicationsLoading } = useAsync(() => studentsApi.listApplications(), []);
  const { data: recommendation, loading: recommendationsLoading } = useAsync(() => recommendationsApi.ai(3), []);
  const { data: savedJobs } = useAsync(() => savedJobsApi.listMine<{ id: string }>(), []);
  const { data: interviewPage, loading: interviewsLoading } = useAsync(() => interviewsApi.getMyInterviews(), []);

  const name = user?.name || 'Student';
  const recommendations = recommendation?.recommendations ?? [];
  const profileStrength = completeness?.percentage ?? 0;
  const matchScore = recommendations.reduce((best, r) => Math.max(best, r.score || 0), 0);
  const applicationsInProgress = (applications ?? []).filter((a) => !TERMINAL_STATUSES.includes(a.status)).length;
  const savedCount = savedJobs?.length ?? 0;
  const currentSkills = profile?.skills ?? [];

  const recommendedJobs = recommendations.slice(0, 3).map((r) => ({
    id: r.id,
    title: r.title,
    company: r.company ?? 'Unknown',
    location: r.location ?? '',
    matchScore: r.score || 0,
    matchedSkills: r.matchedSkills,
  }));

  const activityEvents: ActivityEvent[] = (applications ?? [])
    .flatMap((application) =>
      (application.statusHistory ?? []).map((h) => ({
        id: h.id,
        type: h.newStatus.toLowerCase(),
        message: h.message ?? `${application.job?.title ?? 'Application'} — ${h.newStatus}`,
        timestamp: h.createdAt,
      })),
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const upcomingInterviews = (interviewPage?.items ?? [])
    .filter((interview) => interview.status === 'SCHEDULED' && new Date(interview.scheduledAt).getTime() > Date.now())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 3)
    .map((interview) => ({
      id: interview.id,
      jobTitle: interview.application?.job?.title ?? 'Interview',
      scheduledAt: interview.scheduledAt,
    }));

  return (
    <div className="page fade-in">
      <DashboardWelcome name={name} subtitle="Track your applications, matches, and next career moves.">
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/jobs">
            <Button variant="primary" size="sm">Browse jobs</Button>
          </Link>
          <Link to="/student/recommended">
            <Button variant="secondary" size="sm">View matches</Button>
          </Link>
        </div>
      </DashboardWelcome>

      <BentoGrid columns={4} className="mt-6">
        <BentoItem span={4}>
          <DashboardKPIs
            data={{ profileStrength, matchScore, applicationsInProgress, savedJobs: savedCount }}
          />
        </BentoItem>

        <BentoItem span={2}>
          <DashboardRecommended jobs={recommendedJobs} loading={recommendationsLoading} />
        </BentoItem>

        <BentoItem span={2}>
          <DashboardActivity
            events={activityEvents}
            upcomingInterviews={upcomingInterviews}
            loading={applicationsLoading || interviewsLoading}
          />
        </BentoItem>

        <BentoItem span={4}>
          <DashboardCareerIntel currentSkills={currentSkills} gaps={[]} loading={profileLoading} />
        </BentoItem>
      </BentoGrid>
    </div>
  );
};