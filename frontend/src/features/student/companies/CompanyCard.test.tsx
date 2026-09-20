import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CompanyCard } from './CompanyCard';
import type { DiscoverCompany } from '../../../core/api/endpoints/companies';

afterEach(cleanup);

const baseCompany: DiscoverCompany = {
  id: 'comp-1',
  name: 'Acme Corp',
  industry: 'Technology',
  location: 'San Francisco, CA',
  description: 'Building the future of cloud infrastructure with scalable solutions.',
  logo: '',
  size: '501-1000',
  openPositions: 5,
  followerCount: 120,
  remoteAvailable: true,
};

const renderCard = (overrides: Partial<DiscoverCompany> = {}) =>
  render(
    <BrowserRouter>
      <CompanyCard company={{ ...baseCompany, ...overrides }} />
    </BrowserRouter>,
  );

describe('CompanyCard', () => {
  it('renders company name and initials when no logo', () => {
    renderCard();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('AC')).toBeInTheDocument();
  });

  it('renders logo image when logo URL is provided', () => {
    renderCard({ logo: 'https://example.com/logo.png' });
    const img = screen.getByRole('img', { name: /acme corp/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('renders industry badge', () => {
    renderCard();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders location', () => {
    renderCard();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  it('renders description clamped to two lines', () => {
    renderCard();
    expect(screen.getByText(/Building the future/)).toBeInTheDocument();
  });

  it('shows open positions count', () => {
    renderCard();
    expect(screen.getByText('5 open positions')).toBeInTheDocument();
  });

  it('shows follower count', () => {
    renderCard();
    expect(screen.getByText('120 followers')).toBeInTheDocument();
  });

  it('links to company detail page by id', () => {
    renderCard();
    const link = screen.getByRole('link', { name: /acme corp/i });
    expect(link).toHaveAttribute('href', '/companies/comp-1');
  });
});
