import type { Application } from '../../core/types';
import { timeAgo } from './lib/format';
import type { HomeRailData } from './types';

export const buildStudentRail = (args: {
  profileStrength: number;
  matchScore: number;
  applications: Application[];
  applicationsInProgress: number;
  savedJobs: number;
  activity: { id: string; text: string; createdAt: string }[];
}): HomeRailData => ({
  primary: {
    label: 'Your Progress',
    value: Math.round(args.profileStrength),
    hint: 'Complete your profile to improve your opportunities.',
  },
  secondary: {
    label: 'AI Match Score',
    value: Math.round(args.matchScore),
    hint: 'Your current job match score.',
  },
  quickStats: [
    { label: 'Applications', value: args.applications.length },
    { label: 'Saved Jobs', value: args.savedJobs },
  ],
  activity: args.activity.map((a) => ({ id: a.id, text: a.text, timeAgo: timeAgo(a.createdAt) })).slice(0, 4),
  cta: { title: 'Need help finding the right job?', button: 'Try AI Assistant', to: '/student/ai-assistant' },
});

export const buildEmployerRail = (args: {
  activeJobs: number;
  applicantsToday: number;
  views: number;
  pendingInterviews: number;
  recentApplicants: { id: string; name: string; appliedAt?: string }[];
}): HomeRailData => ({
  primary: {
    label: 'Hiring Health',
    value: Math.min(100, args.activeJobs * 10 + args.pendingInterviews * 5),
    hint: 'Based on your active postings and interviews.',
  },
  secondary: {
    label: 'Profile Reach',
    value: Math.min(100, args.views),
    hint: 'Company profile views this period.',
  },
  quickStats: [
    { label: 'Active Jobs', value: args.activeJobs },
    { label: 'Applicants Today', value: args.applicantsToday },
    { label: 'Profile Views', value: args.views },
  ],
  activity: args.recentApplicants.map((a) => ({ id: a.id, text: `${a.name} applied`, timeAgo: a.appliedAt ? timeAgo(a.appliedAt) : 'today' })).slice(0, 4),
  cta: { title: 'Attract more candidates', button: 'Post a job', to: '/employer/post-job' },
});