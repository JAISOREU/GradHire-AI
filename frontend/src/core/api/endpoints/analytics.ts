import { api } from '../client';
import type { JobAnalytics } from '../../types';

export const analyticsApi = {
  getJobAnalytics: (jobId: string): Promise<JobAnalytics> =>
    api<JobAnalytics>(`/api/v1/analytics/jobs/${jobId}`),

  getEmployerDashboard: async (): Promise<{
    activeJobs: number;
    applicationsToday: number;
    views: number;
    pendingInterviews: number;
    hiringFunnel: number[];
    totalApplicants: number;
    newApplicants: number;
    shortlisted: number;
    interviewing: number;
    offers: number;
    hired: number;
    rejected: number;
    withdrawn: number;
  }> => {
    try {
      return await api('/api/v1/employer/analytics');
    } catch {
      return {
        activeJobs: 0,
        applicationsToday: 0,
        views: 0,
        pendingInterviews: 0,
        hiringFunnel: [0, 0, 0, 0, 0],
        totalApplicants: 0,
        newApplicants: 0,
        shortlisted: 0,
        interviewing: 0,
        offers: 0,
        hired: 0,
        rejected: 0,
        withdrawn: 0,
      };
    }
  },
};
