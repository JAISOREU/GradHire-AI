import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AddApplicationModal } from './AddApplicationModal';
import type { Job } from '../../../core/types';

const { jobsApi } = vi.hoisted(() => ({ jobsApi: { listPaginated: vi.fn() } }));
const { studentsApi } = vi.hoisted(() => ({ studentsApi: { apply: vi.fn() } }));

vi.mock('../../../core/api/endpoints/jobs', () => ({ jobsApi }));
vi.mock('../../../core/api/endpoints/students', () => ({ studentsApi }));

afterEach(cleanup);

const reactJob: Job = {
  id: 'job-react-1',
  title: 'React Developer',
  company: 'TechVista',
  location: 'Remote',
  type: 'HIRING',
  salaryMin: 60000,
  salaryMax: 90000,
};

const nodeJob: Job = {
  id: 'job-node-1',
  title: 'Node.js Engineer',
  company: 'Acme Corp',
  location: 'Manila',
  type: 'HIRING',
  salaryMin: 50000,
  salaryMax: 70000,
};

const paginated = (items: Job[]) => ({ items, total: items.length, page: 1, limit: 20 });

describe('AddApplicationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    jobsApi.listPaginated.mockResolvedValue(paginated([reactJob, nodeJob]));
    studentsApi.apply.mockResolvedValue({ id: 'app-new-1', status: 'SUBMITTED', createdAt: new Date().toISOString() });
  });

  it('renders nothing when closed and the dialog when open', () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<AddApplicationModal open={false} onOpenChange={onOpenChange} appliedJobIds={[]} onAdded={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<AddApplicationModal open onOpenChange={onOpenChange} appliedJobIds={[]} onAdded={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add Application')).toBeInTheDocument();
  });

  it('searches jobs with the typed query and lists matching roles', async () => {
    render(<AddApplicationModal open onOpenChange={vi.fn()} appliedJobIds={[]} onAdded={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Search jobs, roles, or companies'), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(jobsApi.listPaginated).toHaveBeenCalledWith(expect.objectContaining({ search: 'react' }));
    expect(await screen.findByText('React Developer')).toBeInTheDocument();
    expect(screen.getByText('TechVista')).toBeInTheDocument();
  });

  it('marks jobs the student already applied to as Applied and disables them', async () => {
    render(<AddApplicationModal open onOpenChange={vi.fn()} appliedJobIds={['job-react-1']} onAdded={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Search jobs, roles, or companies'), { target: { value: 'developer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    const appliedRow = await screen.findByText('React Developer');
    expect(appliedRow).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(studentsApi.apply).not.toHaveBeenCalled();
  });

  it('applies to a job on click and reports success via onAdded', async () => {
    const onAdded = vi.fn();
    render(<AddApplicationModal open onOpenChange={vi.fn()} appliedJobIds={[]} onAdded={onAdded} />);

    fireEvent.change(screen.getByLabelText('Search jobs, roles, or companies'), { target: { value: 'node' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    const applyButton = await screen.findByRole('button', { name: /Apply to Node.js Engineer/ });
    fireEvent.click(applyButton);

    await waitFor(() => expect(studentsApi.apply).toHaveBeenCalledWith('job-node-1'));
    expect(onAdded).toHaveBeenCalledWith(1);
  });

  it('shows an error message when the search fails', async () => {
    jobsApi.listPaginated.mockRejectedValueOnce(new Error('Network failure'));
    render(<AddApplicationModal open onOpenChange={vi.fn()} appliedJobIds={[]} onAdded={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Search jobs, roles, or companies'), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByText('Network failure')).toBeInTheDocument();
  });
});