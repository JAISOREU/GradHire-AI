import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NetworkPage } from './NetworkPage';
import type { NetworkCompanyCard, NetworkPerson, NetworkSidebar } from '../../core/types';

const { networkApi } = vi.hoisted(() => ({
  networkApi: {
    suggested: vi.fn(),
    search: vi.fn(),
    connections: vi.fn(),
    requests: vi.fn(),
    following: vi.fn(),
    sidebar: vi.fn(),
    connect: vi.fn(),
    removeConnection: vi.fn(),
    acceptRequest: vi.fn(),
    declineRequest: vi.fn(),
    follow: vi.fn(),
    unfollow: vi.fn(),
  },
}));
const { companiesApi } = vi.hoisted(() => ({
  companiesApi: { follow: vi.fn(), unfollow: vi.fn() },
}));

vi.mock('../../core/api/endpoints/network', () => ({ networkApi }));
vi.mock('../../core/api/endpoints/companies', () => ({ companiesApi }));
vi.mock('../../core/auth/AuthContext', () => ({ useAuth: () => ({ user: { role: 'STUDENT' as const } }) }));

const toastMessages: string[] = [];
vi.mock('../../core/toast/ToastContext', () => ({
  useToast: () => ({
    addToast: (_type: string, message: string) => {
      toastMessages.push(message);
    },
  }),
}));

afterEach(cleanup);

const grace: NetworkPerson = {
  id: 'p-grace',
  name: 'Grace Lopez',
  title: 'Data Scientist',
  organization: 'Globex',
  skills: ['Python', 'SQL'],
  mutualCount: 2,
  relation: 'NONE',
  followed: false,
  role: 'STUDENT',
};

const emilyIn: NetworkPerson = {
  id: 'p-emily',
  name: 'Emily Zhao',
  title: 'Cloud Engineer',
  organization: 'CloudPeak',
  skills: ['AWS', 'Kubernetes'],
  mutualCount: 0,
  relation: 'PENDING_IN',
  connectionId: 'conn-in-1',
  followed: false,
  role: 'EMPLOYER',
};

const priyaConnected: NetworkPerson = {
  id: 'p-priya',
  name: 'Priya Sharma',
  title: 'Product Designer',
  organization: 'Acme Corp',
  skills: ['Figma', 'UX'],
  mutualCount: 1,
  relation: 'CONNECTED',
  connectionId: 'conn-1',
  followed: false,
  role: 'STUDENT',
};

const maria: NetworkPerson = {
  id: 'p-maria',
  name: 'Maria Lopez',
  title: 'UI Engineer',
  organization: 'Nimbus',
  skills: ['React', 'TypeScript'],
  mutualCount: 0,
  relation: 'NONE',
  followed: true,
  role: 'STUDENT',
};

const globexCompany: NetworkCompanyCard = { id: 'c-globex', name: 'Globex', industry: 'Tech', followed: false };

const sidebar: NetworkSidebar = {
  peopleYouMayKnow: [grace],
  companiesToFollow: [globexCompany],
  popularSkills: ['React', 'SQL', 'AWS'],
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <NetworkPage />
    </MemoryRouter>,
  );

describe('NetworkPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toastMessages.length = 0;
    networkApi.suggested.mockResolvedValue([grace]);
    networkApi.search.mockResolvedValue([priyaConnected]);
    networkApi.connections.mockResolvedValue([priyaConnected]);
    networkApi.requests.mockResolvedValue([emilyIn]);
    networkApi.following.mockResolvedValue([maria]);
    networkApi.sidebar.mockResolvedValue(sidebar);
    networkApi.connect.mockResolvedValue({ connectionId: 'conn-new' });
    networkApi.acceptRequest.mockResolvedValue({ status: 'ACCEPTED' });
    networkApi.removeConnection.mockResolvedValue(null);
    networkApi.follow.mockResolvedValue(null);
    networkApi.unfollow.mockResolvedValue(null);
    companiesApi.follow.mockResolvedValue({ followed: true, companyId: 'c-globex' });
    companiesApi.unfollow.mockResolvedValue({ followed: false, companyId: 'c-globex' });
  });

  it('renders the header, suggested people, and sidebar widgets', async () => {
    renderPage();

    expect(screen.getByText('Grow your network')).toBeInTheDocument();
    const graceCards = await screen.findAllByText('Grace Lopez');
    expect(graceCards.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('sidebar-pymk')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-companies')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-skills')).toBeInTheDocument();
    expect(screen.getAllByText('Globex').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('shows tab counts for connections, requests, and following', async () => {
    renderPage();

    const graceCards = await screen.findAllByText('Grace Lopez');
    expect(graceCards.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('tab-count-connections')).toHaveTextContent('1');
    expect(screen.getByTestId('tab-count-requests')).toHaveTextContent('1');
    expect(screen.getByTestId('tab-count-following')).toHaveTextContent('1');
  });

  it('searches people after debounce and shows the results', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Search people'), { target: { value: 'priya' } });

    await waitFor(() => expect(networkApi.search).toHaveBeenCalledWith('priya'), { timeout: 1500 });
    expect(await screen.findByText('Priya Sharma')).toBeInTheDocument();
  });

  it('sends a connect invitation and refreshes the suggestions', async () => {
    renderPage();

    const graceCards = await screen.findAllByText('Grace Lopez');
    expect(graceCards.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(screen.getByTestId('connect-p-grace'));

    await waitFor(() => expect(networkApi.connect).toHaveBeenCalledWith('p-grace'));
    await waitFor(() => expect(networkApi.suggested.mock.calls.length).toBeGreaterThan(1));
    expect(toastMessages).toContain('Invitation sent to Grace Lopez');
  });

  it('accepts an incoming request from the Requests tab', async () => {
    renderPage();

    fireEvent.click(screen.getByTestId('tab-requests'));
    expect(await screen.findByText('Emily Zhao')).toBeInTheDocument();
    expect(screen.getByTestId('accept-p-emily')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('accept-p-emily'));

    await waitFor(() => expect(networkApi.acceptRequest).toHaveBeenCalledWith('conn-in-1'));
    expect(toastMessages).toContain('You are now connected with Emily Zhao');
  });

  it('shows the Accept and Decline actions only for incoming requests', async () => {
    renderPage();

    fireEvent.click(screen.getByTestId('tab-requests'));
    expect(await screen.findByText('Emily Zhao')).toBeInTheDocument();
    expect(screen.getByTestId('accept-p-emily')).toBeInTheDocument();
    expect(screen.getByTestId('decline-p-emily')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('tab-connections'));
    expect(await screen.findByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.queryByTestId('accept-p-priya')).not.toBeInTheDocument();
    expect(screen.getByTestId('remove-p-priya')).toBeInTheDocument();
  });

  it('unfollows a followed person from the Following tab', async () => {
    renderPage();

    fireEvent.click(screen.getByTestId('tab-following'));
    expect(await screen.findByText('Maria Lopez')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('follow-p-maria'));

    await waitFor(() => expect(networkApi.unfollow).toHaveBeenCalledWith('p-maria'));
  });

  it('toggles a company follow from the sidebar', async () => {
    renderPage();

    fireEvent.click(await screen.findByTestId('company-follow-c-globex'));

    await waitFor(() => expect(companiesApi.follow).toHaveBeenCalledWith('c-globex'));
  });
});