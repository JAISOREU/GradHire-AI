import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CompaniesFilterBar } from './CompaniesFilterBar';
import type { DiscoverFilters } from '../../../core/api/endpoints/companies';

afterEach(cleanup);

const filters: DiscoverFilters = {};
const onChange = vi.fn();
const onClear = vi.fn();

const renderBar = (props: Partial<{ filters: DiscoverFilters; industries: string[]; locations: string[]; onChange: typeof onChange; onClear: typeof onClear }> = {}) =>
  render(
    <CompaniesFilterBar
      filters={props.filters ?? filters}
      industries={props.industries ?? ['Technology', 'Finance']}
      locations={props.locations ?? ['San Francisco, CA', 'London, UK']}
      onChange={props.onChange ?? onChange}
      onClear={props.onClear ?? onClear}
    />,
  );

describe('CompaniesFilterBar', () => {
  it('renders search input with aria-label', () => {
    renderBar();
    expect(screen.getByLabelText('Search companies')).toBeInTheDocument();
  });

  it('renders industry, location and size selects', () => {
    renderBar();
    expect(screen.getByLabelText('Industry')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Company size')).toBeInTheDocument();
  });

  it('renders industry options from facets', () => {
    renderBar();
    fireEvent.click(screen.getByLabelText('Industry') as HTMLElement);
    expect(screen.getByRole('option', { name: 'Technology' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Finance' })).toBeInTheDocument();
  });

  it('renders remote and hiring toggles', () => {
    renderBar();
    expect(screen.getByRole('button', { name: /remote/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hiring/i })).toBeInTheDocument();
  });

  it('reports search text changes', () => {
    renderBar();
    fireEvent.change(screen.getByLabelText('Search companies'), { target: { value: 'acme' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'acme' }));
  });

  it('reports industry selection', () => {
    renderBar();
    fireEvent.change(screen.getByLabelText('Industry'), { target: { value: 'Finance' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ industry: 'Finance' }));
  });

  it('reports location selection', () => {
    renderBar();
    fireEvent.change(screen.getByLabelText('Location'), { target: { value: 'London, UK' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ location: 'London, UK' }));
  });

  it('reports size selection', () => {
    renderBar();
    fireEvent.change(screen.getByLabelText('Company size'), { target: { value: '501-1000' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ size: '501-1000' }));
  });

  it('toggles remote filter', () => {
    renderBar();
    fireEvent.click(screen.getByRole('button', { name: /remote/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ remote: true }));
  });

  it('toggles hiring filter off', () => {
    renderBar({ filters: { hiring: true } });
    fireEvent.click(screen.getByRole('button', { name: /hiring/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hiring: false }));
  });

  it('calls onClear when clear button clicked', () => {
    renderBar({ filters: { search: 'acme', industry: 'Finance' } });
    fireEvent.click(screen.getByRole('button', { name: /clear all filters/i }));
    expect(onClear).toHaveBeenCalled();
  });

  it('shows active filter count', () => {
    renderBar({ filters: { search: 'a', industry: 'Finance', remote: true } });
    expect(screen.getByText(/3 filters/)).toBeInTheDocument();
  });
});