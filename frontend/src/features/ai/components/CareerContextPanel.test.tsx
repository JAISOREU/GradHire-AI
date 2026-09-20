import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { CareerContextPanel } from './CareerContextPanel';

const { studentsApi } = vi.hoisted(() => ({
  studentsApi: {
    getProfileCompleteness: vi.fn(),
    getCareerPreferences: vi.fn(),
    getSkills: vi.fn(),
    getProfile: vi.fn(),
  },
}));
const { recommendationsApi } = vi.hoisted(() => ({
  recommendationsApi: { ai: vi.fn() },
}));

vi.mock('../../../core/api/endpoints/students', () => ({ studentsApi }));
vi.mock('../../../core/api/endpoints/jobs', () => ({ recommendationsApi }));

afterEach(cleanup);

describe('CareerContextPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    studentsApi.getProfileCompleteness.mockResolvedValue({ percentage: 93, missing: [], sections: [] });
    studentsApi.getCareerPreferences.mockResolvedValue({ preferredJobTitles: ['Software Engineer'], industries: [], preferredLocations: [], authorizedCountries: [], needsVisaSponsorship: false });
    studentsApi.getSkills.mockResolvedValue([{ id: 's1', name: 'React' }, { id: 's2', name: 'TypeScript' }]);
    studentsApi.getProfile.mockResolvedValue({ id: 'u1', name: 'Demo Student', focus: 'Software engineering', skills: ['Node.js', 'GraphQL'] });
    recommendationsApi.ai.mockResolvedValue({
      ready: true,
      missing: [],
      recommendations: [{ id: 'r1', title: 'Job A', type: 'job', score: 0.82, description: '' }],
      fallback: false,
    });
  });

  it('renders profile strength, match score, target role, and top skills', async () => {
    render(<CareerContextPanel />);

    expect(await screen.findByTestId('context-profile-strength')).toBeInTheDocument();
    expect(await screen.findByTestId('context-match-score')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByLabelText('93%')).toBeInTheDocument();
    expect(await screen.findByLabelText('82%')).toBeInTheDocument();
  });

  it('falls back gracefully when APIs fail', async () => {
    studentsApi.getProfileCompleteness.mockRejectedValue(new Error('down'));
    studentsApi.getCareerPreferences.mockRejectedValue(new Error('down'));
    studentsApi.getSkills.mockRejectedValue(new Error('down'));
    studentsApi.getProfile.mockRejectedValue(new Error('down'));
    recommendationsApi.ai.mockRejectedValue(new Error('down'));

    render(<CareerContextPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('context-target-role')).toHaveTextContent('—');
    });
    expect(screen.getByTestId('context-top-skills')).toHaveTextContent('No skills yet');
  });

  it('handles a null preferences body (empty string from API) without breaking the panel', async () => {
    studentsApi.getCareerPreferences.mockResolvedValue(null as never);
    studentsApi.getSkills.mockResolvedValue([]);
    studentsApi.getProfile.mockResolvedValue({ id: 'u1', name: 'Demo Student', focus: 'Software engineering', skills: ['TypeScript', 'React', 'Node.js'] });

    render(<CareerContextPanel />);

    await waitFor(() => {
      expect(screen.getByText('Software engineering')).toBeInTheDocument();
    });
    expect(screen.getByLabelText('93%')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('falls back to the profile focus and skill list when structured data is missing', async () => {
    studentsApi.getCareerPreferences.mockResolvedValue({ preferredJobTitles: [], industries: [], preferredLocations: [], authorizedCountries: [], needsVisaSponsorship: false });
    studentsApi.getSkills.mockResolvedValue([]);
    studentsApi.getProfile.mockResolvedValue({ id: 'u1', name: 'Demo Student', focus: 'Software engineering', skills: ['TypeScript', 'React', 'Node.js'] });

    render(<CareerContextPanel />);

    await waitFor(() => {
      expect(screen.getByText('Software engineering')).toBeInTheDocument();
    });
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
  });

  it('shows a hint when no AI recommendations are available', async () => {
    recommendationsApi.ai.mockResolvedValue({ ready: false, missing: [], recommendations: [], fallback: true });

    render(<CareerContextPanel />);

    await waitFor(() => {
      expect(screen.getByText('No AI match available yet')).toBeInTheDocument();
    });
  });
});