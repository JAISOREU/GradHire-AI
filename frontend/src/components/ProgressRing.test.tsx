import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('renders the percentage text', () => {
    render(<ProgressRing value={87} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ProgressRing value={72} label="Profile" />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('clamps value to 0-100', () => {
    const { rerender } = render(<ProgressRing value={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    rerender(<ProgressRing value={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { rerender } = render(<ProgressRing value={50} size="sm" />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('width')).toBe('32');
    rerender(<ProgressRing value={50} size="lg" />);
    expect(screen.getByRole('img').getAttribute('width')).toBe('64');
  });
});
