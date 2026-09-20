import { describe, expect, it } from 'vitest';
import type { Application } from '../../core/types';
import {
  applicationDate,
  computeFunnel,
  computeMetrics,
  countCreatedThisWeek,
  isTerminal,
  nextStep,
  recentActivity,
  statusLabel,
  timeAgo,
  toStageBucket,
  upcomingInterviews,
} from './applicationRules';

const NOW = new Date('2026-09-13T12:00:00.000Z');

const mkApp = (over: Partial<Application> & { id: string }): Application => ({
  id: over.id,
  status: 'SUBMITTED',
  createdAt: '2026-09-10T09:00:00.000Z',
  job: { id: 'j1', title: 'Junior Software Engineer', company: 'Acme Corp', location: 'Remote', type: 'HIRING' },
  ...over,
});

describe('applicationRules', () => {
  describe('toStageBucket / isTerminal', () => {
    it('maps every non-terminal status into the four pipeline buckets', () => {
      expect(toStageBucket('SUBMITTED')).toBe('SUBMITTED');
      expect(toStageBucket('UNDER_REVIEW')).toBe('UNDER_REVIEW');
      expect(toStageBucket('SHORTLISTED')).toBe('UNDER_REVIEW');
      expect(toStageBucket('ASSESSMENT')).toBe('UNDER_REVIEW');
      expect(toStageBucket('INTERVIEW')).toBe('INTERVIEW');
      expect(toStageBucket('OFFER')).toBe('OFFER');
      expect(toStageBucket('HIRED')).toBe('OFFER');
    });

    it('marks rejected and withdrawn as terminal', () => {
      expect(isTerminal('REJECTED')).toBe(true);
      expect(isTerminal('WITHDRAWN')).toBe(true);
      expect(isTerminal('INTERVIEW')).toBe(false);
    });
  });

  describe('computeMetrics', () => {
    it('counts total, under review, interviews and offers across buckets', () => {
      const apps = [
        mkApp({ id: 'a1', status: 'SUBMITTED' }),
        mkApp({ id: 'a2', status: 'SHORTLISTED' }),
        mkApp({ id: 'a3', status: 'ASSESSMENT' }),
        mkApp({ id: 'a4', status: 'INTERVIEW' }),
        mkApp({ id: 'a5', status: 'OFFER' }),
        mkApp({ id: 'a6', status: 'HIRED' }),
      ];
      expect(computeMetrics(apps)).toEqual({ total: 6, underReview: 2, interviews: 1, offers: 2 });
    });

    it('excludes rejected and withdrawn from the counts', () => {
      const apps = [
        mkApp({ id: 'a1', status: 'REJECTED' }),
        mkApp({ id: 'a2', status: 'WITHDRAWN' }),
        mkApp({ id: 'a3', status: 'SUBMITTED' }),
      ];
      expect(computeMetrics(apps)).toEqual({ total: 1, underReview: 0, interviews: 0, offers: 0 });
    });

    it('returns zeros for an empty list', () => {
      expect(computeMetrics([])).toEqual({ total: 0, underReview: 0, interviews: 0, offers: 0 });
    });
  });

  describe('computeFunnel', () => {
    it('returns Applied → Screening → Interview → Offer counts in order', () => {
      const apps = [
        mkApp({ id: 'a1', status: 'SUBMITTED' }),
        mkApp({ id: 'a2', status: 'SUBMITTED' }),
        mkApp({ id: 'a3', status: 'UNDER_REVIEW' }),
        mkApp({ id: 'a4', status: 'INTERVIEW' }),
        mkApp({ id: 'a5', status: 'OFFER' }),
        mkApp({ id: 'a6', status: 'HIRED' }),
        mkApp({ id: 'a7', status: 'REJECTED' }),
      ];
      const funnel = computeFunnel(apps);
      expect(funnel.map((f) => f.label)).toEqual(['Applied', 'Screening', 'Interview', 'Offer']);
      expect(funnel.map((f) => f.count)).toEqual([2, 1, 1, 2]);
    });
  });

  describe('countCreatedThisWeek', () => {
    it('counts applications created in the last 7 days', () => {
      const apps = [
        mkApp({ id: 'a1', createdAt: '2026-09-11T09:00:00.000Z' }),
        mkApp({ id: 'a2', createdAt: '2026-09-07T09:00:00.000Z' }),
        mkApp({ id: 'a3', createdAt: '2026-08-30T09:00:00.000Z' }),
      ];
      expect(countCreatedThisWeek(apps, NOW)).toBe(2);
    });

    it('prefers submittedAt over createdAt for the application date', () => {
      expect(applicationDate(mkApp({ id: 'a1', createdAt: '2026-09-02T09:00:00.000Z', submittedAt: '2026-09-11T09:00:00.000Z' }))).toBe('2026-09-11T09:00:00.000Z');
      expect(applicationDate(mkApp({ id: 'a2' }))).toBe('2026-09-10T09:00:00.000Z');
    });

    it('counts this week by submittedAt when present and falls back to createdAt', () => {
      const apps = [
        mkApp({ id: 'a1', submittedAt: '2026-09-12T09:00:00.000Z' }),
        mkApp({ id: 'a2', createdAt: '2026-09-11T09:00:00.000Z' }),
        mkApp({ id: 'a3', submittedAt: '2026-08-30T09:00:00.000Z' }),
      ];
      expect(countCreatedThisWeek(apps, NOW)).toBe(2);
    });
  });

  describe('nextStep', () => {
    it('suggests a follow-up after submission', () => {
      expect(nextStep(mkApp({ id: 'a1', status: 'SUBMITTED' }))).toBe('Follow up with Acme Corp in 3 days');
    });

    it('suggests checking back while under review (incl. shortlisted/assessment)', () => {
      for (const status of ['UNDER_REVIEW', 'SHORTLISTED', 'ASSESSMENT']) {
        expect(nextStep(mkApp({ id: 'a2', status }))).toBe('Check back with Acme Corp in 3 days');
      }
    });

    it('points to the scheduled interview when one exists', () => {
      const interviewApp = mkApp({
        id: 'a3',
        status: 'INTERVIEW',
        interview: {
          id: 'i1',
          applicationId: 'a3',
          scheduledAt: '2026-09-15T14:00:00.000Z',
          status: 'SCHEDULED',
          application: { id: 'a3', job: { id: 'j1', title: 'x', company: 'Acme Corp', location: 'Remote' }, student: { id: 's1', profile: null } },
        } as Application['interview'],
      });
      expect(nextStep(interviewApp, NOW)).toBe('Interview with Acme Corp on Sep 15');
    });

    it('suggests preparation when an interview is scheduled without a date', () => {
      expect(nextStep(mkApp({ id: 'a4', status: 'INTERVIEW', interview: null }))).toBe('Prepare for your Acme Corp interview');
    });

    it('suggests reviewing the offer', () => {
      expect(nextStep(mkApp({ id: 'a5', status: 'OFFER' }))).toBe('Review the offer from Acme Corp');
    });

    it('suggests onboarding when hired', () => {
      expect(nextStep(mkApp({ id: 'a6', status: 'HIRED' }))).toBe('Start onboarding at Acme Corp');
    });

    it('returns null for terminal statuses', () => {
      expect(nextStep(mkApp({ id: 'a7', status: 'REJECTED' }))).toBeNull();
      expect(nextStep(mkApp({ id: 'a8', status: 'WITHDRAWN' }))).toBeNull();
    });
  });

  describe('statusLabel', () => {
    it('maps statuses to friendly stage labels', () => {
      expect(statusLabel('SUBMITTED')).toBe('Applied');
      expect(statusLabel('UNDER_REVIEW')).toBe('Screening');
      expect(statusLabel('SHORTLISTED')).toBe('Shortlisted');
      expect(statusLabel('ASSESSMENT')).toBe('Assessment');
      expect(statusLabel('INTERVIEW')).toBe('Interview');
      expect(statusLabel('OFFER')).toBe('Offer');
      expect(statusLabel('HIRED')).toBe('Hired');
      expect(statusLabel('REJECTED')).toBe('Rejected');
      expect(statusLabel('WITHDRAWN')).toBe('Withdrawn');
    });
  });

  describe('upcomingInterviews', () => {
    it('returns future SCHEDULED interviews sorted by date', () => {
      const apps = [
        mkApp({ id: 'a1', status: 'INTERVIEW', interview: { id: 'i1', status: 'SCHEDULED', scheduledAt: '2026-09-20T10:00:00.000Z' } as Application['interview'] }),
        mkApp({ id: 'a2', status: 'INTERVIEW', interview: { id: 'i2', status: 'SCHEDULED', scheduledAt: '2026-09-15T10:00:00.000Z' } as Application['interview'] }),
        mkApp({ id: 'a3', status: 'INTERVIEW', interview: { id: 'i3', status: 'SCHEDULED', scheduledAt: '2026-09-10T10:00:00.000Z' } as Application['interview'] }),
        mkApp({ id: 'a4', status: 'INTERVIEW', interview: { id: 'i4', status: 'COMPLETED', scheduledAt: '2026-09-20T10:00:00.000Z' } as Application['interview'] }),
      ];
      const result = upcomingInterviews(apps, NOW);
      expect(result.map((a) => a.id)).toEqual(['a2', 'a1']);
    });

    it('returns an empty list when there are none', () => {
      expect(upcomingInterviews([mkApp({ id: 'a1', status: 'SUBMITTED' })], NOW)).toEqual([]);
    });
  });

  describe('recentActivity', () => {
    it('sorts status-change events newest first and skips apps without events', () => {
      const apps = [
        mkApp({ id: 'a1', status: 'UNDER_REVIEW', lastEvent: { id: 'e1', applicationId: 'a1', newStatus: 'UNDER_REVIEW', createdAt: '2026-09-11T09:00:00.000Z' } }),
        mkApp({ id: 'a2', status: 'INTERVIEW', lastEvent: { id: 'e2', applicationId: 'a2', newStatus: 'INTERVIEW', createdAt: '2026-09-12T09:00:00.000Z' } }),
        mkApp({ id: 'a3', status: 'SUBMITTED', lastEvent: null }),
      ];
      const activity = recentActivity(apps);
      expect(activity.map((a) => a.applicationId)).toEqual(['a2', 'a1']);
      expect(activity[0].newStatus).toBe('INTERVIEW');
    });

    it('returns an empty list when no events exist', () => {
      expect(recentActivity([mkApp({ id: 'a1', status: 'SUBMITTED', lastEvent: null })])).toEqual([]);
    });
  });

  describe('timeAgo', () => {
    it('formats relative times', () => {
      expect(timeAgo('2026-09-13T11:59:30.000Z', NOW)).toBe('just now');
      expect(timeAgo('2026-09-13T11:55:00.000Z', NOW)).toBe('5m ago');
      expect(timeAgo('2026-09-13T10:00:00.000Z', NOW)).toBe('2h ago');
      expect(timeAgo('2026-09-12T09:00:00.000Z', NOW)).toBe('yesterday');
      expect(timeAgo('2026-09-07T09:00:00.000Z', NOW)).toBe('6d ago');
    });

    it('falls back to a short date string for older events', () => {
      expect(timeAgo('2026-08-20T09:00:00.000Z', NOW)).toBe('Aug 20');
    });
  });
});