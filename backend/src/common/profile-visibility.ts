import { ProfileVisibility } from '@prisma/client';

type StudentRow = {
  id: string;
  email: string;
  avatarUrl?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

type RedactedStudent = {
  id: string;
  email: string;
  avatarUrl: string | null;
  profile: { id: string; name: string; focus: string; skills: string[] } | null;
};

/** Prisma select for student rows surfaced to employers.
 *  Whitelists only fields an employer may see — passwordHash, resetToken, etc.
 *  are never fetched. */
export const employerStudentSelect = {
  id: true,
  email: true,
  avatarUrl: true,
  profile: {
    select: {
      id: true,
      name: true,
      focus: true,
      skills: true,
      visibility: true,
    },
  },
} as const;

/** Whether a profile may be shown to an employer. PRIVATE means only the owner. */
export function employerMayView(visibility: ProfileVisibility | null | undefined): boolean {
  return visibility !== 'PRIVATE';
}

/** Whether a profile may appear in public / peer discovery. */
export function publiclyDiscoverable(visibility: ProfileVisibility | null | undefined): boolean {
  return visibility === 'PUBLIC';
}

/** Redacts a raw student row for employer-facing views:
 *  - drops any sensitive columns (defense in depth; the select above already avoids them)
 *  - blanks the profile entirely for PRIVATE visibility */
export function redactStudentForEmployer(student: StudentRow | null | undefined): RedactedStudent | null {
  if (!student) return null;
  const profile = student.profile ?? null;
  const visible =
    profile && employerMayView(profile.visibility as ProfileVisibility | null | undefined)
      ? {
          id: profile.id as string,
          name: profile.name as string,
          focus: profile.focus as string,
          skills: (profile.skills ?? []) as string[],
        }
      : null;

  return {
    id: student.id,
    email: student.email,
    avatarUrl: student.avatarUrl ?? null,
    profile: visible,
  };
}