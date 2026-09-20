import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ApplicationsSidebar, type ApplicationsSidebarProps } from './ApplicationsSidebar';
import type { ActivityItem, NextStepItem } from '../applicationRules';
import type { Application } from '../../../core/types';

afterEach(cleanup);

const NOW = new Date('2026-09-13T12:00:00.000Z');

const upcomingApp = (over: Partial<Application> & { id: string }): Application => ({
  id: over.id,
  status: 'INTERVIEW',
  createdAt: '2026-09-12T09:00:00.000Z',
  job: { id: 'j1', title: 'Junior Software Engineer', company: 'Acme Corp', location: 'Remote', type: 'HIRING' },
  interview: {
    id: `i-${over.id}`,
    applicationId: over.id,
    application: { id: over.id, job: { id: 'j1', title: 'Junior Software Engineer', company: 'Acme Corp', location: 'Remote' }, student: { id: 's1', profile: null } },
    scheduledAt: '2026-09-20T14:00:00',
    status: 'SCHEDULED',
  },
  ...over,
});

const activity: ActivityItem[] = [
  { applicationId: 'a2', company: 'TechVista', role: 'Frontend Engineer', newStatus: 'INTERVIEW', at: '2026-09-12T09:00:00.000Z' },
  { applicationId: 'a1', company: 'Acme Corp', role: 'Junior Software Engineer', newStatus: 'UNDER_REVIEW', at: '2026-09-11T07:30:00.000Z' },
];

const steps: NextStepItem[] = [
  { applicationId: 'a1', company: 'Acme Corp', text: 'Follow up with Acme Corp in 3 days' },
];

const baseProps: ApplicationsSidebarProps = { upcoming: [], activity: [], steps: [], totalApplications: 1, now: NOW };

describe('ApplicationsSidebar', () => {
  it('lists upcoming interviews with company, role and scheduled time', () => {
    render(<ApplicationsSidebar {...baseProps} upcoming={[upcomingApp({ id: 'a2' })]} />);

    expect(screen.getByText('Upcoming Interviews')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Junior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Sep 20 · 2:00 PM')).toBeInTheDocument();
  });

  it('shows an empty state when there are no upcoming interviews', () => {
    render(<ApplicationsSidebar {...baseProps} />);

    expect(screen.getByText('No upcoming interviews')).toBeInTheDocument();
  });

  it('lists recent activity with stage labels and relative times', () => {
    render(<ApplicationsSidebar {...baseProps} activity={activity} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Moved to Interview')).toBeInTheDocument();
    expect(screen.getByText('TechVista')).toBeInTheDocument();
    expect(screen.getByText('yesterday')).toBeInTheDocument();
    expect(screen.getByText('Moved to Screening')).toBeInTheDocument();
  });

  it('shows an empty state when there is no activity yet', () => {
    render(<ApplicationsSidebar {...baseProps} />);

    expect(screen.getByText('No recent activity yet')).toBeInTheDocument();
  });

  it('lists recommended next steps from the rule-derived texts', () => {
    render(<ApplicationsSidebar {...baseProps} steps={steps} />);

    expect(screen.getByText('Recommended Next Steps')).toBeInTheDocument();
    expect(screen.getByText('Follow up with Acme Corp in 3 days')).toBeInTheDocument();
  });

  it('prompts to apply when there are no applications at all', () => {
    render(<ApplicationsSidebar {...baseProps} steps={[]} totalApplications={0} />);

    expect(screen.getByText(/Apply to jobs to get personalized next steps/)).toBeInTheDocument();
  });
});