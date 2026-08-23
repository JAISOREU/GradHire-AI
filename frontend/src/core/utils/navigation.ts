import type { UserRole } from '../types';

export type NavItem = {
  label: string;
  to: string;
  icon: string;
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export const STUDENT_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/student/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/student/jobs', label: 'Browse Jobs', icon: 'jobs' },
      { to: '/student/companies', label: 'Companies', icon: 'company' },
      { to: '/student/applications', label: 'Applications', icon: 'applications' },
      { to: '/student/saved', label: 'Saved Jobs', icon: 'saved' },
    ],
  },
  {
    label: 'Career',
    items: [
      { to: '/student/resume', label: 'Resume', icon: 'resume' },
      { to: '/student/resume-builder', label: 'Resume Builder', icon: 'feature' },
      { to: '/student/recommended', label: 'Recommended', icon: 'star' },
    ],
  },
  {
    label: 'Profile',
    items: [
      { to: '/student/account', label: 'Profile', icon: 'profile' },
      { to: '/student/messages', label: 'Messages', icon: 'messages' },
      { to: '/student/interviews', label: 'Interviews', icon: 'calendar' },
      { to: '/student/notifications', label: 'Notifications', icon: 'notifications' },
      { to: '/student/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export const STUDENT_HEADER_ACTIONS: NavItem[] = [];

export const EMPLOYER_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/employer/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/employer/jobs', label: 'Jobs', icon: 'jobs' },
      { to: '/employer/applicants', label: 'Applicants', icon: 'users' },
      { to: '/employer/interviews', label: 'Interviews', icon: 'calendar' },
    ],
  },
  {
    label: 'Company',
    items: [
      { to: '/employer/company-profile', label: 'Company', icon: 'company' },
      { to: '/employer/companies', label: 'Browse Companies', icon: 'company' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/employer/messages', label: 'Messages', icon: 'messages' },
      { to: '/employer/notifications', label: 'Notifications', icon: 'notifications' },
      { to: '/employer/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export const EMPLOYER_HEADER_ACTIONS: NavItem[] = [];

export const ADMIN_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/admin/users', label: 'Users', icon: 'users' },
      { to: '/admin/jobs', label: 'Jobs', icon: 'jobs' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/job-sources', label: 'Sources', icon: 'jobs' },
      { to: '/admin/job-source-runs', label: 'Ingestion Runs', icon: 'jobs' },
      { to: '/admin/applications', label: 'Applications', icon: 'applications' },
      { to: '/admin/companies', label: 'Companies', icon: 'company' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: 'dashboard' },
      { to: '/admin/analytics', label: 'Analytics', icon: 'dashboard' },
      { to: '/admin/ai-monitoring', label: 'Monitoring', icon: 'dashboard' },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'security' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/database', label: 'Database', icon: 'settings' },
      { to: '/admin/api-keys', label: 'API Keys', icon: 'settings' },
      { to: '/admin/email-templates', label: 'Email Templates', icon: 'settings' },
      { to: '/admin/cms', label: 'CMS', icon: 'settings' },
      { to: '/admin/feature-flags', label: 'Feature Flags', icon: 'settings' },
      { to: '/admin/backups', label: 'Backups', icon: 'settings' },
      { to: '/admin/security', label: 'Security', icon: 'security' },
      { to: '/admin/developer-tools', label: 'Developer Tools', icon: 'settings' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/account', label: 'Profile', icon: 'profile' },
      { to: '/admin/notifications', label: 'Notifications', icon: 'notifications' },
      { to: '/admin/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export const ADMIN_HEADER_ACTIONS: NavItem[] = [];

export const roleHomePath = (role: UserRole | undefined): string => {
  if (role === 'EMPLOYER') return '/employer/dashboard';
  if (role === 'STUDENT') return '/student/dashboard';
  if (role === 'ADMIN') return '/admin/dashboard';
  return '/';
};

export const initialsOf = (email?: string): string => {
  if (!email) return '?';
  const parts = email.replace(/@.*/, '').split(/[.\s_-]+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};
