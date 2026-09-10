import type { UserRole } from '../types';

export type NavItem = {
  label: string;
  to: string;
  icon: keyof typeof import('@phosphor-icons/react');
};

export type NavSection = {
  label?: string;
  items: NavItem[];
};

export const STUDENT_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/student/dashboard', label: 'Dashboard', icon: 'Square' },
      { to: '/student/jobs', label: 'Browse Jobs', icon: 'Briefcase' },
      { to: '/student/companies', label: 'Companies', icon: 'Buildings' },
      { to: '/student/applications', label: 'Applications', icon: 'PaperPlaneRight' },
      { to: '/student/saved', label: 'Saved Jobs', icon: 'Bookmark' },
    ],
  },
  {
    label: 'Career',
    items: [
      { to: '/student/resume', label: 'Resume', icon: 'FileText' },
      { to: '/student/resume-builder', label: 'Resume Builder', icon: 'PencilSimpleLine' },
      { to: '/student/recommended', label: 'Recommended', icon: 'Sparkle' },
    ],
  },
  {
    label: 'Profile',
    items: [
      { to: '/student/account', label: 'Profile', icon: 'User' },
      { to: '/student/messages', label: 'Messages', icon: 'ChatCircle' },
      { to: '/student/interviews', label: 'Interviews', icon: 'Calendar' },
      { to: '/student/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/student/ai-assistant', label: 'AI Assistant', icon: 'Sparkle' },
      { to: '/student/settings', label: 'Settings', icon: 'Gear' },
    ],
  },
];

export const STUDENT_HEADER_ACTIONS: NavItem[] = [];

export const EMPLOYER_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/employer/dashboard', label: 'Dashboard', icon: 'Square' },
      { to: '/employer/jobs', label: 'Jobs', icon: 'Briefcase' },
      { to: '/employer/applicants', label: 'Applicants', icon: 'Users' },
      { to: '/employer/interviews', label: 'Interviews', icon: 'Calendar' },
    ],
  },
  {
    label: 'Company',
    items: [
      { to: '/employer/company-profile', label: 'Company', icon: 'Buildings' },
      { to: '/employer/companies', label: 'Browse Companies', icon: 'Buildings' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/employer/messages', label: 'Messages', icon: 'ChatCircle' },
      { to: '/employer/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/employer/settings', label: 'Settings', icon: 'Gear' },
    ],
  },
];

export const EMPLOYER_HEADER_ACTIONS: NavItem[] = [];

export const ADMIN_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'Square' },
      { to: '/admin/users', label: 'Users', icon: 'Users' },
      { to: '/admin/jobs', label: 'Jobs', icon: 'Briefcase' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/job-sources', label: 'Sources', icon: 'Database' },
      { to: '/admin/applications', label: 'Applications', icon: 'PaperPlaneRight' },
      { to: '/admin/companies', label: 'Companies', icon: 'Buildings' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: 'ChartBar' },
      { to: '/admin/analytics', label: 'Analytics', icon: 'ChartLineUp' },
      { to: '/admin/monitoring', label: 'Monitoring', icon: 'Square' },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'Shield' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/database', label: 'Database', icon: 'Gear' },
      { to: '/admin/api-keys', label: 'API Keys', icon: 'Key' },
      { to: '/admin/email-templates', label: 'Email Templates', icon: 'Envelope' },
      { to: '/admin/cms', label: 'CMS', icon: 'Gear' },
      { to: '/admin/feature-flags', label: 'Feature Flags', icon: 'Gear' },
      { to: '/admin/backups', label: 'Backups', icon: 'Gear' },
      { to: '/admin/security', label: 'Security', icon: 'Shield' },
      { to: '/admin/developer-tools', label: 'Developer Tools', icon: 'Gear' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/account', label: 'Profile', icon: 'User' },
      { to: '/admin/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/admin/settings', label: 'Settings', icon: 'Gear' },
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
