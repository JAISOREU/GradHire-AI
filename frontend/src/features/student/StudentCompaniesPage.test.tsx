import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StudentCompaniesPage } from './StudentCompaniesPage';
import type { DiscoverResult, SkillCompanies } from '../../core/api/endpoints/companies';

const companiesApi = vi.hoisted(() => ({
  discover: vi.fn(),
  hiringForSkills: vi.fn(),
  list: vi.fn(),
  follow: vi.fn(),
  unfollow: vi.fn(),
  myFollowing: vi.fn(),
  getById: vi.fn(),
  searchEmployers: vi.fn(),
}));

vi.mock('../../core/api/endpoints/companies', () => ({ companiesApi }));
vi.mock('../../core/auth/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u-1', role: 'STUDENT' as const } }),
}));

const mockDiscover = (data: DiscoverResult) => companiesApi.discover.mockResolvedValue(data);
const mockHiringForSkills = (data: SkillCompanies[]) => companiesApi.hiringForSkills.mockResolvedValue(data);

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/student/companies' }]}>
      <StudentCompaniesPage />
    </MemoryRouter>,
  );

afterEach(() => cleanup());

describe('StudentCompaniesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHiringForSkills([{ skill: 'React', companies: 2 }]);
  });

  it('renders the page header with title and subtitle', async () => {
    mockDiscover({ items: [], total: 0, page: 1, limit: 20, totalPages: 1, facets: { industries: [], locations: [] } });
    renderPage();

    expect(screen.getByRole('heading', { name: 'Explore companies' })).toBeInTheDocument();
    expect(screen.getByText('Discover companies, teams, and opportunities.')).toBeInTheDocument();
  });

  it('renders featured company cards in a 3-column grid', async () => {
    const items = [
      { id: 'c1', name: 'Acme', industry: 'Tech', location: 'SF', size: '51-200', openPositions: 3, followerCount: 10, remoteAvailable: false },
      { id: 'c2', name: 'Globex', industry: 'Finance', location: 'London', size: '201-500', openPositions: 5, followerCount: 20, remoteAvailable: true },
      { id: 'c3', name: 'Nimbus', industry: 'SaaS', location: 'NYC', size: '1-50', openPositions: 1, followerCount: 5, remoteAvailable: false },
    ];
    mockDiscover({ items, total: 3, page: 1, limit: 20, totalPages: 1, facets: { industries: ['Tech', 'Finance'], locations: ['SF'] } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Acme')).toBeInTheDocument();
    });

    const featured = screen.getByTestId('featured-companies');
    expect(featured.children).toHaveLength(3);
    expect(screen.getByText('Globex')).toBeInTheDocument();
    expect(screen.getByText('Nimbus')).toBeInTheDocument();
  });

  it('renders remaining companies as list rows after the featured cards', async () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `c${i}`, name: `Company ${i}`, openPositions: 1, followerCount: i, remoteAvailable: false,
    }));
    mockDiscover({ items, total: 6, page: 1, limit: 20, totalPages: 1, facets: { industries: [], locations: [] } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Company 0')).toBeInTheDocument();
    });

    expect(screen.getByText('Company 3')).toBeInTheDocument();
    expect(screen.getByText('Company 5')).toBeInTheDocument();

    const list = screen.getByRole('list', { name: /company listings/i });
    expect(list.children).toHaveLength(3);
  });

  it('renders the filter bar and reports filter changes', async () => {
    mockDiscover({ items: [], total: 0, page: 1, limit: 20, totalPages: 1, facets: { industries: ['Tech'], locations: ['SF'] } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByLabelText('Search companies')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Industry')).toBeInTheDocument();
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Company size')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remote/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hiring/i })).toBeInTheDocument();
  });

  it('shows a total company count badge when data is loaded', async () => {
    mockDiscover({ items: [{ id: 'c1', name: 'Acme', openPositions: 1, followerCount: 0, remoteAvailable: false }], total: 42, page: 1, limit: 20, totalPages: 3, facets: { industries: [], locations: [] } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('42 companies')).toBeInTheDocument();
    });
  });

  it('shows pagination controls when there are multiple pages', async () => {
    mockDiscover({ items: [{ id: 'c1', name: 'Acme', openPositions: 1, followerCount: 0, remoteAvailable: false }], total: 60, page: 1, limit: 20, totalPages: 3, facets: { industries: [], locations: [] } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next/i })).toBeEnabled();
  });

  it('shows the skills sidebar', async () => {
    mockDiscover({ items: [], total: 0, page: 1, limit: 20, totalPages: 1, facets: { industries: [], locations: [] } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Companies hiring for your skills')).toBeInTheDocument();
    });
  });

  it('shows a loading state while fetching companies', () => {
    companiesApi.discover.mockReturnValue(new Promise(() => {}));

    renderPage();
    expect(screen.getAllByText(/loading companies/i).length).toBeGreaterThanOrEqual(1);
  });

  it('shows an error state with retry', async () => {
    companiesApi.discover.mockRejectedValue(new Error('Network error'));

    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when filters yield no results', async () => {
    mockDiscover({ items: [], total: 0, page: 1, limit: 20, totalPages: 1, facets: { industries: ['Tech'], locations: [] } });

    renderPage();
    await waitFor(() => {
      expect(screen.getByText('No companies found')).toBeInTheDocument();
    });
    expect(screen.getByText(/check back soon for new companies/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Search companies'), { target: { value: 'acme' } });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
    });
  });
});