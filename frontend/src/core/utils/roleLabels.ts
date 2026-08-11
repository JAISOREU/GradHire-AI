export const ROLE_LABELS = {
  STUDENT: 'Talent',
  EMPLOYER: 'Employer',
  ADMIN: 'Admin',
} as const;

export const ROLE_DESCRIPTIONS = {
  STUDENT: 'People looking for opportunities, whether they are entry-level candidates, junior professionals, or experienced professionals.',
  EMPLOYER: 'Companies and professionals hiring talent',
  ADMIN: 'Platform administrators',
} as const;

export type RoleKey = keyof typeof ROLE_LABELS;

export const getRoleLabel = (role: RoleKey): string => ROLE_LABELS[role] ?? role;

export const getRoleDescription = (role: RoleKey): string => ROLE_DESCRIPTIONS[role] ?? '';
