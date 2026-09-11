import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders label and value', () => {
    render(<ProgressBar value={82} label="Experience" />);
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('sets aria attributes', () => {
    render(<ProgressBar value={75} label="Test" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('hides value when showValue is false', () => {
    render(<ProgressBar value={50} label="Test" showValue={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});
