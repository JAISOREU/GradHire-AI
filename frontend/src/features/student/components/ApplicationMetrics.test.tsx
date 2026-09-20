import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { ApplicationMetrics, type ApplicationMetricsProps } from './ApplicationMetrics';
import type { ApplicationMetricsCounts, FunnelStage } from '../applicationRules';

afterEach(cleanup);

const counts: ApplicationMetricsCounts = { total: 6, underReview: 2, interviews: 1, offers: 2 };
const funnel: FunnelStage[] = [
  { stage: 'SUBMITTED', label: 'Applied', count: 2 },
  { stage: 'UNDER_REVIEW', label: 'Screening', count: 1 },
  { stage: 'INTERVIEW', label: 'Interview', count: 1 },
  { stage: 'OFFER', label: 'Offer', count: 2 },
];

const baseProps: ApplicationMetricsProps = { counts, createdThisWeek: 0, funnel };

describe('ApplicationMetrics', () => {
  it('renders the four metric cards with live counts and labels', () => {
    render(<ApplicationMetrics {...baseProps} />);

    expect(screen.getByLabelText('Total applications: 6')).toBeInTheDocument();
    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByLabelText('Under review: 2')).toBeInTheDocument();
    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByLabelText('Interviews: 1')).toBeInTheDocument();
    expect(screen.getByText('Interviews')).toBeInTheDocument();
    expect(screen.getByLabelText('Offers: 2')).toBeInTheDocument();
    expect(screen.getByText('Offers')).toBeInTheDocument();
  });

  it('shows the weekly trend chip on the total card when applications were added this week', () => {
    render(<ApplicationMetrics {...baseProps} createdThisWeek={2} />);

    expect(screen.getByText('+2 this week')).toBeInTheDocument();
  });

  it('hides the weekly trend chip when nothing was added this week', () => {
    render(<ApplicationMetrics {...baseProps} createdThisWeek={0} />);

    expect(screen.queryByText(/this week/)).not.toBeInTheDocument();
  });

  it('renders the compact funnel stages in order with counts', () => {
    const { container } = render(<ApplicationMetrics {...baseProps} />);

    expect(screen.getByLabelText('Applied: 2 applications')).toBeInTheDocument();
    expect(screen.getByLabelText('Screening: 1 applications')).toBeInTheDocument();
    expect(screen.getByLabelText('Interview: 1 applications')).toBeInTheDocument();
    expect(screen.getByLabelText('Offer: 2 applications')).toBeInTheDocument();
    expect(container.querySelectorAll('.apps-funnel__sep').length).toBe(3);
  });
});