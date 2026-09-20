import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../core/api/endpoints/jobs', () => ({
  jobsApi: { create: vi.fn().mockResolvedValue({ id: 'job-1', title: 'Test', status: 'PUBLISHED' }) },
}));

import { EmployerPostJobPage } from './EmployerPostJobPage';
import { jobsApi } from '../../core/api/endpoints/jobs';

describe('EmployerPostJobPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('sends requiredQualifications and status PUBLISHED in the create payload', async () => {
    render(
      <MemoryRouter>
        <EmployerPostJobPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Job title/), { target: { value: 'QA Engineer' } });
    fireEvent.change(screen.getByLabelText(/Company/), { target: { value: 'TestCo' } });
    fireEvent.change(screen.getByLabelText(/Location/), { target: { value: 'Remote' } });
    fireEvent.change(screen.getByLabelText(/Experience level/), { target: { value: 'SENIOR' } });

    fireEvent.click(screen.getByRole('button', { name: '+ Add required skills' }));
    fireEvent.change(screen.getByLabelText(/Required skills/), { target: { value: 'TypeScript' } });

    fireEvent.change(screen.getByLabelText(/Role overview/), { target: { value: 'Brief description of the role.' } });
    fireEvent.change(screen.getByLabelText(/Responsibilities/), { target: { value: 'Primary responsibilities of this job.' } });
    fireEvent.change(screen.getByLabelText(/Required qualifications/), { target: { value: 'BS in CS or equivalent' } });

    fireEvent.click(screen.getByRole('button', { name: /Publish job/ }));

    await waitFor(() => {
      expect(jobsApi.create).toHaveBeenCalledTimes(1);
    });

    const payload = (jobsApi.create as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(payload).toMatchObject({
      title: 'QA Engineer',
      company: 'TestCo',
      location: 'Remote',
      experienceLevel: 'SENIOR',
      requiredSkills: ['TypeScript'],
      requiredQualifications: 'BS in CS or equivalent',
      status: 'PUBLISHED',
    });

    expect(await screen.findByText('Job published successfully.')).toBeInTheDocument();
  });
});
