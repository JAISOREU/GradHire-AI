import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { JobCard } from './JobCard';

afterEach(cleanup);

const baseJob = {
  id: 'job-1',
  title: 'Frontend Engineer',
  company: 'Acme Inc',
  location: 'Manila',
  salary: 'PHP 60,000 — 80,000',
  workplaceType: 'Hybrid',
  experienceLevel: 'Entry level',
  matchScore: 92,
  postedAt: new Date().toISOString(),
};

describe('JobCard', () => {
  it('renders the job title, company, location and salary', () => {
    render(<JobCard job={baseJob} onClick={vi.fn()} />);

    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme Inc · Manila')).toBeInTheDocument();
    expect(screen.getByText('PHP 60,000 — 80,000')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
  });

  it('exposes the card as an accessible button and reports clicks', () => {
    const onClick = vi.fn();
    render(<JobCard job={baseJob} onClick={onClick} />);

    const card = screen.getByRole('button', { name: /View details for Frontend Engineer/ });
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows the company logo image when provided and a fallback otherwise', () => {
    const { rerender } = render(<JobCard job={{ ...baseJob, logo: 'https://example.com/logo.png' }} onClick={vi.fn()} />);
    expect(screen.getByRole('button').querySelector('img')).toHaveAttribute('src', 'https://example.com/logo.png');

    rerender(<JobCard job={{ ...baseJob, logo: null }} onClick={vi.fn()} />);
    expect(screen.getByRole('button').querySelector('img')).toBeNull();
  });

  it('renders up to three skill chips and a +N overflow counter', () => {
    const skills = ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Docker'];
    render(<JobCard job={{ ...baseJob, skills }} onClick={vi.fn()} />);

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('labels the apply action Apply now and switches to View when applied', () => {
    const { rerender } = render(<JobCard job={baseJob} onClick={vi.fn()} onApply={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Apply now' })).toBeInTheDocument();

    rerender(<JobCard job={{ ...baseJob, isApplied: true }} onClick={vi.fn()} onApply={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
  });

  it('does not open the card when applying', () => {
    const onClick = vi.fn();
    const onApply = vi.fn();
    render(<JobCard job={baseJob} onClick={onClick} onApply={onApply} />);

    fireEvent.click(screen.getByRole('button', { name: 'Apply now' }));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('toggles the save button label based on saved state', () => {
    const { rerender } = render(<JobCard job={baseJob} onClick={vi.fn()} onToggleSave={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Save job' })).toBeInTheDocument();

    rerender(<JobCard job={{ ...baseJob, isSaved: true }} onClick={vi.fn()} onToggleSave={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Unsave job' })).toBeInTheDocument();
  });
});