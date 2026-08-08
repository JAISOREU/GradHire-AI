import { describe, it, expect } from 'vitest';
import { roleHomePath, initialsOf } from './navigation';
import type { UserRole } from '../types';

describe('navigation', () => {
  it('returns student dashboard path for STUDENT role', () => {
    expect(roleHomePath('STUDENT')).toBe('/student/dashboard');
  });

  it('returns employer dashboard path for EMPLOYER role', () => {
    expect(roleHomePath('EMPLOYER')).toBe('/employer/dashboard');
  });

  it('returns public home for unknown role', () => {
    expect(roleHomePath(undefined)).toBe('/');
    expect(roleHomePath('UNKNOWN' as UserRole)).toBe('/');
  });

  it('generates initials from email', () => {
    expect(initialsOf('ava.chen@example.com')).toBe('AC');
    expect(initialsOf('john_doe@test.org')).toBe('JD');
    expect(initialsOf('single@name.com')).toBe('S');
    expect(initialsOf('')).toBe('?');
  });
});
