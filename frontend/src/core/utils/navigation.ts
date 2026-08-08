import type { UserRole } from '../types';

export type NavItem = {
  label: string;
  to: string;
  icon: string;
};

export const STUDENT_SIDEBAR_NAV: NavItem[] = [
  { to: '/student/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/student/applications', label: 'Applications', icon: '📨' },
  { to: '/student/saved', label: 'Saved Jobs', icon: '🔖' },
  { to: '/student/recommended', label: 'Recommended', icon: '✨' },
  { to: '/student/settings', label: 'Settings', icon: '⚙️' },
];

export const STUDENT_HEADER_ACTIONS: NavItem[] = [
  { to: '/student/profile', label: 'Profile', icon: '👤' },
  { to: '/student/messages', label: 'Messages', icon: '💬' },
  { to: '/student/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/student/settings', label: 'Settings', icon: '⚙️' },
];

export const EMPLOYER_SIDEBAR_NAV: NavItem[] = [
  { to: '/employer/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/employer/applicants', label: 'Applicants', icon: '👥' },
  { to: '/employer/jobs', label: 'Manage Jobs', icon: '🗂️' },
  { to: '/employer/analytics', label: 'Analytics', icon: '📈' },
  { to: '/employer/settings', label: 'Settings', icon: '⚙️' },
];

export const EMPLOYER_HEADER_ACTIONS: NavItem[] = [
  { to: '/employer/company', label: 'Profile', icon: '🏢' },
  { to: '/employer/messages', label: 'Messages', icon: '💬' },
  { to: '/employer/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/employer/settings', label: 'Settings', icon: '⚙️' },
];

export const ADMIN_SIDEBAR_NAV: NavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/jobs', label: 'Jobs', icon: '🗂️' },
  { to: '/admin/applications', label: 'Applications', icon: '📨' },
  { to: '/admin/companies', label: 'Companies', icon: '🏢' },
  { to: '/admin/settings', label: 'System Settings', icon: '⚙️' },
];

export const ADMIN_HEADER_ACTIONS: NavItem[] = [
  { to: '/admin/profile', label: 'Profile', icon: '👤' },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  { to: '/admin/developer-tools', label: 'Developer Tools', icon: '🛠️' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
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
