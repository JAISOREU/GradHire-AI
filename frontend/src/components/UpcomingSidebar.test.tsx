import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { UpcomingSidebar } from './UpcomingSidebar';

afterEach(cleanup);

const interview = { id: 'int-1', company: 'Acme Corp', title: 'Senior Engineer', when: 'Sep 20 · 10:00 AM' };
const deadline = { id: 'dl-1', company: 'Globex', title: 'Dev Ops', when: 'Sep 30' };

describe('UpcomingSidebar', () => {
  test('renders both upcoming sections by heading', () => {
    render(<UpcomingSidebar interviews={[]} deadlines={[]} />);
    expect(screen.getByRole('heading', { name: 'Upcoming Interviews' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Application Deadlines' })).toBeInTheDocument();
  });

  test('renders interview items when provided', () => {
    render(<UpcomingSidebar interviews={[interview]} deadlines={[]} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument();
    expect(screen.getByText('Sep 20 · 10:00 AM')).toBeInTheDocument();
  });

  test('renders deadline items when provided', () => {
    render(<UpcomingSidebar interviews={[]} deadlines={[deadline]} />);
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('Dev Ops')).toBeInTheDocument();
  });

  test('shows an empty placeholder when interviews list is empty', () => {
    render(<UpcomingSidebar interviews={[]} deadlines={[]} />);
    expect(screen.getByText(/No upcoming interviews/)).toBeInTheDocument();
  });

  test('shows an empty placeholder when deadlines list is empty', () => {
    render(<UpcomingSidebar interviews={[]} deadlines={[]} />);
    expect(screen.getByText(/No application deadlines/)).toBeInTheDocument();
  });

  test('exposes a complementary landmark with an accessible label', () => {
    const { container } = render(<UpcomingSidebar interviews={[]} deadlines={[]} />);
    const aside = container.querySelector('aside');
    expect(aside).toHaveAttribute('aria-label', 'Upcoming');
  });
});