import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { SkillsSidebar } from './SkillsSidebar';
import { companiesApi } from '../../../core/api/endpoints/companies';

afterEach(cleanup);

vi.mock('../../../core/api/endpoints/companies', () => ({
  companiesApi: {
    hiringForSkills: vi.fn(),
  },
}));

const mockedHiringForSkills = vi.mocked(companiesApi.hiringForSkills);

describe('SkillsSidebar', () => {
  it('renders title and skill counts', async () => {
    mockedHiringForSkills.mockResolvedValue([
      { skill: 'React', companies: 2 },
      { skill: 'TypeScript', companies: 2 },
      { skill: 'Node.js', companies: 1 },
    ]);
    render(<SkillsSidebar />);
    expect(await screen.findByText('Companies hiring for your skills')).toBeInTheDocument();
    expect(await screen.findByText('React')).toBeInTheDocument();
    expect((await screen.findAllByText('2 companies')).length).toBe(2);
    expect(await screen.findByText('Node.js')).toBeInTheDocument();
    expect(await screen.findByText('1 company')).toBeInTheDocument();
  });

  it('shows singular company label for a single match', async () => {
    mockedHiringForSkills.mockResolvedValue([{ skill: 'Python', companies: 1 }]);
    render(<SkillsSidebar />);
    expect(await screen.findByText('1 company')).toBeInTheDocument();
  });

  it('shows empty hint when there are no matching skills', async () => {
    mockedHiringForSkills.mockResolvedValue([]);
    render(<SkillsSidebar />);
    expect(await screen.findByText(/add skills to your profile/i)).toBeInTheDocument();
  });

  it('shows an error message when loading fails', async () => {
    mockedHiringForSkills.mockRejectedValue(new Error('Network error'));
    render(<SkillsSidebar />);
    expect(await screen.findByText(/could not load/i)).toBeInTheDocument();
  });
});