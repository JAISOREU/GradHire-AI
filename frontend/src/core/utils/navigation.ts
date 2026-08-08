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
      { to: '/student/applications', label: 'Applications', icon: 'applications' },
      { to: '/student/recommended', label: 'Recommended', icon: 'star' },
    ],
  },
  {
    label: 'Profile',
    items: [
      { to: '/student/saved', label: 'Saved Jobs', icon: 'saved' },
      { to: '/student/profile', label: 'Profile', icon: 'profile' },
      { to: '/student/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export const STUDENT_HEADER_ACTIONS: NavItem[] = [
  { to: '/student/messages', label: 'Messages', icon: 'messages' },
  { to: '/student/notifications', label: 'Notifications', icon: 'notifications' },
];

export const EMPLOYER_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/employer/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/employer/applicants', label: 'Applicants', icon: 'users' },
      { to: '/employer/jobs', label: 'Manage Jobs', icon: 'jobs' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/employer/analytics', label: 'Analytics', icon: 'analytics' },
      { to: '/employer/interviews', label: 'Interviews', icon: 'interviews' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/employer/company', label: 'Company', icon: 'company' },
      { to: '/employer/settings', label: 'Settings', icon: 'settings' },
    ],
  },
];

export const EMPLOYER_HEADER_ACTIONS: NavItem[] = [
  { to: '/employer/messages', label: 'Messages', icon: 'messages' },
  { to: '/employer/notifications', label: 'Notifications', icon: 'notifications' },
];

export const ADMIN_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/admin/users', label: 'Users', icon: 'users' },
      { to: '/admin/jobs', label: 'Jobs', icon: 'jobs' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { to: '/admin/applications', label: 'Applications', icon: 'applications' },
      { to: '/admin/companies', label: 'Companies', icon: 'company' },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'audit' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/notifications', label: 'Notifications', icon: 'notifications' },
      { to: '/admin/settings', label: 'System Settings', icon: 'settings' },
    ],
  },
];

export const ADMIN_HEADER_ACTIONS: NavItem[] = [
  { to: '/admin/profile', label: 'Profile', icon: 'profile' },
  { to: '/admin/developer-tools', label: 'Dev Tools', icon: 'developer' },
];

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
