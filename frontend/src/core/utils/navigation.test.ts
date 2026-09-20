import { describe, it, expect } from 'vitest';
import { roleHomePath, initialsOf, STUDENT_SIDEBAR_NAV, EMPLOYER_SIDEBAR_NAV, ADMIN_SIDEBAR_NAV } from './navigation';
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

describe('STUDENT_SIDEBAR_NAV', () => {
  it('has Main section with Home as first item', () => {
    expect(STUDENT_SIDEBAR_NAV[0].label).toBe('Main');
    expect(STUDENT_SIDEBAR_NAV[0].items[0].to).toBe('/student/dashboard');
    expect(STUDENT_SIDEBAR_NAV[0].items[0].label).toBe('Home');
  });
  it('has Explore and Career tools sections', () => {
    expect(STUDENT_SIDEBAR_NAV[1].label).toBe('Explore');
    expect(STUDENT_SIDEBAR_NAV[2].label).toBe('Career tools');
  });
  it('includes Network in Main', () => {
    const mainItems = STUDENT_SIDEBAR_NAV[0].items;
    expect(mainItems.some((i) => i.to === '/student/network')).toBe(true);
  });
});

describe('EMPLOYER_SIDEBAR_NAV', () => {
  it('has Main section with Home as first item', () => {
    expect(EMPLOYER_SIDEBAR_NAV[0].label).toBe('Main');
    expect(EMPLOYER_SIDEBAR_NAV[0].items[0].to).toBe('/employer/dashboard');
  });

  it('includes Network in Main section', () => {
    expect(EMPLOYER_SIDEBAR_NAV[0].items).toContainEqual({ to: '/employer/network', label: 'Network', icon: 'UsersThree' });
  });
});

describe('ADMIN_SIDEBAR_NAV', () => {
  it('has Main, Monitoring, System, Account sections', () => {
    expect(ADMIN_SIDEBAR_NAV.map((s) => s.label)).toEqual(['Main', 'Monitoring', 'System', 'Account']);
  });
});