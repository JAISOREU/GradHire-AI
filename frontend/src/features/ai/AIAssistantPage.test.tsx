import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AIAssistantPage } from './AIAssistantPage';

const { aiApi } = vi.hoisted(() => ({
  aiApi: { careerChat: vi.fn() },
}));

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

vi.mock('../../core/api/endpoints/ai', () => ({ aiApi }));
vi.mock('../../core/api/endpoints/students', () => ({ studentsApi }));
vi.mock('../../core/api/endpoints/jobs', () => ({ recommendationsApi }));
vi.mock('../../core/auth/AuthContext', () => ({ useAuth: () => ({ user: { id: 'u-1', role: 'STUDENT' as const } }) }));

const initialLocation = { state: {} };

const renderPage = (state: Record<string, unknown> = {}) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/student/ai-assistant', state }]}>
      <AIAssistantPage />
    </MemoryRouter>,
  );

afterEach(() => {
  cleanup();
  localStorage.clear();
});

HTMLElement.prototype.scrollIntoView = HTMLElement.prototype.scrollIntoView || (() => {});

describe('AIAssistantPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    aiApi.careerChat.mockResolvedValue({ response: 'Here is some advice.', timestamp: '2026-01-01T00:00:00.000Z' });
    studentsApi.getProfileCompleteness.mockResolvedValue({ percentage: 93, missing: [], sections: [] });
    studentsApi.getCareerPreferences.mockResolvedValue({ preferredJobTitles: ['Software Engineer'], industries: [], preferredLocations: [], authorizedCountries: [], needsVisaSponsorship: false });
    studentsApi.getSkills.mockResolvedValue([{ id: 's1', name: 'React' }]);
    studentsApi.getProfile.mockResolvedValue({ id: 'u1', name: 'Demo Student', focus: 'Software engineering', skills: ['Node.js'] });
    recommendationsApi.ai.mockResolvedValue({ ready: true, missing: [], recommendations: [{ id: 'r1', title: 'Job A', type: 'job', score: 0.82, description: '' }], fallback: false });
  });

  it('renders the 3-column layout with header, conversations, starters, and context panel', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'AI Assistant' })).toBeInTheDocument();
    expect(screen.getByText('Your career copilot.')).toBeInTheDocument();
    expect(screen.getByTestId('new-chat-btn')).toBeInTheDocument();
    expect(screen.getByText('How can I help?')).toBeInTheDocument();
    expect(screen.getByTestId('context-profile-strength')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });
    expect(screen.getByTestId('context-match-score')).toBeInTheDocument();
  });

  it('sends a message from the composer and renders the assistant reply', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('Ask a career question'), { target: { value: 'What skills should I learn?' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => {
      expect(aiApi.careerChat).toHaveBeenCalledWith('What skills should I learn?', expect.any(Array));
    });
    expect(await screen.findByTestId('message-assistant-1')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
  });

  it('sends a starter prompt when a suggestion card is clicked', async () => {
    renderPage();

    fireEvent.click(screen.getByTestId('starter-resume'));

    await waitFor(() => {
      expect(aiApi.careerChat).toHaveBeenCalledWith('Analyze my resume', expect.any(Array));
    });
    expect(await screen.findByTestId('message-assistant-1')).toBeInTheDocument();
    expect(screen.queryByText('How can I help?')).not.toBeInTheDocument();
  });

  it('starts a new chat and shows the empty starter state again', async () => {
    renderPage();

fireEvent.click(screen.getByTestId('starter-profile'));
await screen.findByTestId('message-assistant-1');

fireEvent.click(screen.getByTestId('new-chat-btn'));

expect(screen.getByText('How can I help?')).toBeInTheDocument();
expect(screen.getAllByTestId('conversation-list')).toHaveLength(1);
  });

  it('sends a message with job context when arriving from a job view', async () => {
    renderPage({ jobId: 'job-1', jobTitle: 'Frontend Engineer', jobCompany: 'Acme' });

    expect(screen.getByText(/Discussing: Frontend Engineer · Acme/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Ask a career question'), { target: { value: 'Am I a good fit?' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => {
      const [message, history] = aiApi.careerChat.mock.calls[0];
      expect(message).toContain('[Job context: Frontend Engineer]');
      expect(history).toEqual([]);
    });
  });

  it('attaches a file and includes it in the message', async () => {
    renderPage();

    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Choose file to attach') as HTMLInputElement;
    Object.defineProperty(input, 'files', { configurable: true, value: [file] });

    fireEvent.click(screen.getByTestId('attach-btn'));
    fireEvent.change(input);
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Ask a career question'), { target: { value: 'Review this for me' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    await waitFor(() => {
      const [message] = aiApi.careerChat.mock.calls[0];
      expect(message).toContain('[Attachment: resume.pdf]');
    });
  });

  it('shows an error banner and retries the last user message', async () => {
    aiApi.careerChat.mockRejectedValueOnce(new Error('AI is busy'));

    renderPage();

    fireEvent.change(screen.getByLabelText('Ask a career question'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByTestId('send-btn'));

    expect(await screen.findByTestId('ai-error')).toHaveTextContent('AI is busy');

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await waitFor(() => {
      expect(aiApi.careerChat).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByTestId('message-assistant-2')).toBeInTheDocument();
  });

  it('clears the job context conversation when the chip is dismissed', async () => {
    const { unmount } = renderPage({ jobId: 'job-1', jobTitle: 'Backend Engineer' });

    expect(screen.getByText(/Discussing: Backend Engineer/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear job context' }));

    await waitFor(() => {
      expect(screen.queryByText(/Discussing: Backend Engineer/)).not.toBeInTheDocument();
    });
    unmount();
  });
});