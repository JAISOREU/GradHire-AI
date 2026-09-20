import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Messenger, type MessengerProps, type SharedApp } from './Messenger';
import type { Message } from '../core/types';

afterEach(cleanup);

const SENT: Message = {
  id: 'm1',
  from: 'stu-1',
  to: 'emp-1',
  fromName: 'Demo Student',
  toName: 'Acme Corp',
  fromRole: 'STUDENT',
  toRole: 'EMPLOYER',
  fromTitle: 'Software engineering',
  toTitle: 'Technology',
  fromCompany: null,
  toCompany: 'Acme Corp',
  fromAvatar: null,
  toAvatar: null,
  body: 'I applied and would love to chat.',
  createdAt: '2026-09-12T09:00:00.000Z',
  read: true,
};

const RECEIVED_U1: Message = {
  ...SENT,
  id: 'm2',
  from: 'emp-1',
  to: 'stu-1',
  fromName: 'Acme Corp',
  toName: 'Demo Student',
  fromRole: 'EMPLOYER',
  toRole: 'STUDENT',
  fromCompany: 'Acme Corp',
  toCompany: null,
  fromTitle: 'Technology',
  toTitle: 'Software engineering',
  body: 'Hi! Thanks for applying.',
  read: false,
};

const RECEIVED_U2: Message = {
  ...RECEIVED_U1,
  id: 'm3',
  body: "Let's schedule an interview.",
  createdAt: '2026-09-13T10:00:00.000Z',
  read: false,
};

const OTHER: Message = {
  ...SENT,
  id: 'm4',
  to: 'emp-2',
  toName: 'Beta Inc',
  toCompany: 'Beta Inc',
  toTitle: 'Consulting',
  body: 'Hello Beta!',
  createdAt: '2026-09-11T08:00:00.000Z',
  read: true,
};

const appsFor: SharedApp[] = [
  {
    id: 'a1',
    jobId: 'job-1',
    jobTitle: 'Junior Software Engineer',
    company: 'Acme Corp',
    status: 'SUBMITTED',
    submittedAt: '2026-09-11T11:29:50.306Z',
  },
];

const baseProps: MessengerProps = {
  messages: [RECEIVED_U2, RECEIVED_U1, SENT],
  currentUserId: 'stu-1',
  role: 'STUDENT',
  onSend: vi.fn(),
  onMarkRead: vi.fn(),
  getProfileHref: () => '/student/companies',
  getJobHref: () => '/student/jobs',
};

describe('Messenger workspace', () => {
  it('renders the conversation list, tabs, search, and unread badges', () => {
    render(<Messenger {...baseProps} sharedApps={{ 'emp-1': appsFor }} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Unread' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Recruiters' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Companies' })).toBeInTheDocument();
    expect(screen.getByLabelText('Search conversations')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('filters the list by tab', () => {
    render(<Messenger {...baseProps} messages={[RECEIVED_U2, RECEIVED_U1, SENT, OTHER]} sharedApps={{ 'emp-1': appsFor }} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Unread' }));
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.queryByText('Beta Inc')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Companies' }));
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Recruiters' }));
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
    expect(screen.getByText('No matching conversations')).toBeInTheDocument();
  });

  it('selecting a conversation opens the chat and marks unread messages as read', () => {
    const markRead = vi.fn();
    render(<Messenger {...baseProps} onMarkRead={markRead} sharedApps={{ 'emp-1': appsFor }} />);

    fireEvent.click(screen.getByRole('button', { name: /Acme Corp/ }));

    expect(markRead).toHaveBeenCalledWith(['m2', 'm3']);
    expect(screen.getAllByText("Let's schedule an interview.").length).toBeGreaterThan(0);
  });

  it('sends a message from the composer', async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    render(<Messenger {...{ ...baseProps, onSend: send }} />);

    fireEvent.click(screen.getByRole('button', { name: /Acme Corp/ }));
    const input = screen.getByPlaceholderText('Write a message…');
    fireEvent.change(input, { target: { value: 'Sounds good!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    expect(send).toHaveBeenCalledWith('emp-1', 'Sounds good!');
  });

  it('shows the right panel with shared applications and actions, and hides it when not applicable', () => {
    const { rerender } = render(<Messenger {...baseProps} sharedApps={{ 'emp-1': appsFor }} />);
    fireEvent.click(screen.getByRole('button', { name: /Acme Corp/ }));

    expect(screen.getByRole('complementary', { name: 'Conversation details' })).toBeInTheDocument();
    expect(screen.getByText('Junior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Applied')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Profile' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Job' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View Job' })).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: 'Message' })).toHaveLength(0);

    const PLAIN: Message = {
      ...SENT,
      id: 'm5',
      to: 'emp-3',
      toName: 'Alex Rivera',
      toCompany: null,
      toTitle: null,
      body: 'Hi Alex',
      createdAt: '2026-09-10T08:00:00.000Z',
      read: true,
    };
    rerender(<Messenger {...baseProps} messages={[RECEIVED_U2, RECEIVED_U1, SENT, PLAIN]} sharedApps={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Alex Rivera/ }));
    expect(screen.queryByRole('complementary', { name: 'Conversation details' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View Profile' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'View Job' })).not.toBeInTheDocument();
  });

  it('uses the most recently submitted shared application as the current job', () => {
      const moreApps = [
      ...appsFor,
      {
        id: 'a2',
        jobId: 'job-2',
        jobTitle: 'Senior Software Engineer',
        company: 'Acme Corp',
        status: 'INTERVIEW',
        submittedAt: '2026-09-12T09:00:00.000Z',
      },
    ];
    render(<Messenger {...{ ...baseProps, sharedApps: { 'emp-1': moreApps } }} />);
    fireEvent.click(screen.getByRole('button', { name: /Acme Corp/ }));

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Interview')).toBeInTheDocument();
  });

  it('shows empty states for no conversations and no selection', () => {
    render(<Messenger {...baseProps} messages={[]} />);
    expect(screen.getByText('No conversations')).toBeInTheDocument();
  });

  it('searches conversations by name', () => {
    render(<Messenger {...baseProps} messages={[RECEIVED_U2, OTHER]} />);

    fireEvent.change(screen.getByLabelText('Search conversations'), { target: { value: 'beta' } });
    expect(screen.getByText('Beta Inc')).toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });
});