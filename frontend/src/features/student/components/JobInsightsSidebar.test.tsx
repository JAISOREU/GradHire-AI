import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { JobInsightsSidebar } from './JobInsightsSidebar';
import type { JobInsightsSidebarProps } from './JobInsightsSidebar';

afterEach(cleanup);

const baseProps: JobInsightsSidebarProps = {
  profileSkills: ['React', 'TypeScript'],
  matchedJobsCount: 12,
  loadingMatch: false,
  snapshot: [
    { type: 'HIRING', count: 8 },
    { type: 'INTERNSHIP', count: 4 },
  ],
  loadingSnapshot: false,
  onApplySkill: vi.fn(),
  onSuggestion: vi.fn(),
};

describe('JobInsightsSidebar', () => {
  it('renders AI Job Match with skill chips and the matching count', () => {
    render(<JobInsightsSidebar {...baseProps} />);

    expect(screen.getByText('AI Job Match')).toBeInTheDocument();
    expect(screen.getByText('matching roles')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByTitle('Filter jobs by React')).toBeInTheDocument();
    expect(screen.getByTitle('Filter jobs by TypeScript')).toBeInTheDocument();
  });

  it('prompts to add skills when the profile has none', () => {
    render(<JobInsightsSidebar {...baseProps} profileSkills={[]} matchedJobsCount={null} />);

    expect(screen.getByText(/Add skills to your profile/)).toBeInTheDocument();
    expect(screen.queryByTitle('Filter jobs by React')).not.toBeInTheDocument();
  });

  it('renders the market snapshot bars with totals', () => {
    render(<JobInsightsSidebar {...baseProps} />);

    expect(screen.getByText('12 open roles by type')).toBeInTheDocument();
    expect(screen.getByText('Full-time')).toBeInTheDocument();
    expect(screen.getByText('Internship')).toBeInTheDocument();
  });

  it('shows a loading state while the snapshot is being fetched', () => {
    render(<JobInsightsSidebar {...baseProps} snapshot={null} loadingSnapshot />);

    expect(screen.getByText(/Loading market overview/)).toBeInTheDocument();
  });

  it('offers suggested searches and reports clicks', () => {
    const onSuggestion = vi.fn();
    render(<JobInsightsSidebar {...baseProps} onSuggestion={onSuggestion} />);

    const suggestion = screen.getByRole('button', { name: /Full Stack Developer/ });
    expect(suggestion).toBeInTheDocument();
    fireEvent.click(suggestion);
    expect(onSuggestion).toHaveBeenCalledWith('Full Stack Developer');
  });

  it('reports skill chip clicks for filtering', () => {
    const onApplySkill = vi.fn();
    render(<JobInsightsSidebar {...baseProps} onApplySkill={onApplySkill} />);

    fireEvent.click(screen.getByTitle('Filter jobs by React'));
    expect(onApplySkill).toHaveBeenCalledWith('React');
  });
});