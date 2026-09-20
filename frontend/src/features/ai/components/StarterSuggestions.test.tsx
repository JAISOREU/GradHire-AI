import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { STARTER_PROMPTS, StarterSuggestions } from './StarterSuggestions';

afterEach(cleanup);

describe('StarterSuggestions', () => {
  it('renders the How can I help heading and all six starter prompts', () => {
    render(<StarterSuggestions onSelect={vi.fn()} />);
    expect(screen.getByText('How can I help?')).toBeInTheDocument();
    expect(STARTER_PROMPTS).toHaveLength(6);
    for (const s of STARTER_PROMPTS) {
      expect(screen.getByText(s.label)).toBeInTheDocument();
    }
  });

  it('fires onSelect with the full prompt text', () => {
    const onSelect = vi.fn();
    render(<StarterSuggestions onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('starter-interview'));
    expect(onSelect).toHaveBeenCalledWith('Prepare for an interview');
  });

  it('disables the starter cards while busy', () => {
    render(<StarterSuggestions onSelect={vi.fn()} disabled />);
    expect(screen.getByTestId('starter-resume')).toBeDisabled();
  });
});