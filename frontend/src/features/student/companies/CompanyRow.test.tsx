import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CompanyRow } from './CompanyRow';
import type { DiscoverCompany } from '../../../core/api/endpoints/companies';

afterEach(cleanup);

const baseCompany: DiscoverCompany = {
  id: 'comp-2',
  name: 'Globex Inc',
  industry: 'Finance',
  location: 'London, UK',
  description: 'Global financial services across 40 markets.',
  logo: '',
  size: '1001-5000',
  openPositions: 3,
  followerCount: 40,
  remoteAvailable: false,
};

const renderRow = (overrides: Partial<DiscoverCompany> = {}) =>
  render(
    <BrowserRouter>
      <CompanyRow company={{ ...baseCompany, ...overrides }} />
    </BrowserRouter>,
  );

describe('CompanyRow', () => {
  it('renders company name', () => {
    renderRow();
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();
  });

  it('renders initials when no logo', () => {
    renderRow();
    expect(screen.getByText('GI')).toBeInTheDocument();
  });

  it('renders location and industry', () => {
    renderRow();
    expect(screen.getByText('London, UK')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('renders open roles summary', () => {
    renderRow();
    expect(screen.getByText('3 open roles')).toBeInTheDocument();
  });

  it('shows remote-friendly badge when remote available', () => {
    renderRow({ remoteAvailable: true });
    expect(screen.getByText('Remote-friendly')).toBeInTheDocument();
  });

  it('hides remote-friendly badge when not remote', () => {
    renderRow({ remoteAvailable: false });
    expect(screen.queryByText('Remote-friendly')).not.toBeInTheDocument();
  });

  it('links to company detail page', () => {
    renderRow();
    const link = screen.getByRole('link', { name: /globex inc/i });
    expect(link).toHaveAttribute('href', '/companies/comp-2');
  });
});