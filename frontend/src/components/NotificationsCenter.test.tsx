import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { NotificationsCenter } from './NotificationsCenter';
import type { Notification } from '../core/types';

afterEach(cleanup);

const makeNotif = (overrides: Partial<Notification>): Notification => ({
  id: 'n-1',
  message: 'Something happened',
  read: false,
  createdAt: '2026-09-01T10:00:00.000Z',
  type: 'GENERIC',
  ...overrides,
});

const sample = [
  makeNotif({ id: 'n-app', type: 'APPLICATION', message: 'New application received for Dev at Acme', read: false }),
  makeNotif({ id: 'n-int', type: 'INTERVIEW', message: 'Interview scheduled for Dev at Acme', read: true }),
  makeNotif({ id: 'n-msg', type: 'MESSAGE', message: 'New message: Hello', read: false }),
  makeNotif({ id: 'n-gen', type: 'GENERIC', message: 'Generic update', read: true }),
];

describe('NotificationsCenter', () => {
  test('renders the four filter tabs', () => {
    render(<NotificationsCenter notifications={[]} onOpenNotification={() => {}} />);
    expect(screen.getByRole('tab', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Applications' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Interviews' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Messages' })).toBeInTheDocument();
  });

  test('shows every notification on the All tab', () => {
    render(<NotificationsCenter notifications={sample} onOpenNotification={() => {}} />);
    expect(screen.getByText('New application received for Dev at Acme')).toBeInTheDocument();
    expect(screen.getByText('Interview scheduled for Dev at Acme')).toBeInTheDocument();
    expect(screen.getByText('New message: Hello')).toBeInTheDocument();
    expect(screen.getByText('Generic update')).toBeInTheDocument();
  });

  test('filters to applications when Applications tab is active', () => {
    render(<NotificationsCenter notifications={sample} onOpenNotification={() => {}} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Applications' }));
    expect(screen.getByText('New application received for Dev at Acme')).toBeInTheDocument();
    expect(screen.queryByText('Interview scheduled for Dev at Acme')).not.toBeInTheDocument();
    expect(screen.queryByText('New message: Hello')).not.toBeInTheDocument();
  });

  test('filters to interviews and messages tabs', () => {
    render(<NotificationsCenter notifications={sample} onOpenNotification={() => {}} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Interviews' }));
    expect(screen.getByText('Interview scheduled for Dev at Acme')).toBeInTheDocument();
    expect(screen.queryByText('New application received for Dev at Acme')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Messages' }));
    expect(screen.getByText('New message: Hello')).toBeInTheDocument();
    expect(screen.queryByText('Generic update')).not.toBeInTheDocument();
  });

  test('unread rows expose an unread indicator, read rows do not', () => {
    render(<NotificationsCenter notifications={sample} onOpenNotification={() => {}} />);
    expect(screen.getByRole('listitem', { name: /New application received for Dev at Acme/ })).toBeInTheDocument();
    const unreadDot = screen.getAllByLabelText('Unread');
    expect(unreadDot).toHaveLength(2);
    const readRow = screen.getByRole('listitem', { name: /Interview scheduled for Dev at Acme/ });
    expect(readRow.querySelector('[aria-label="Unread"]')).toBeNull();
  });

  test('shows a row for each notification with title, message, and timestamp', () => {
    render(<NotificationsCenter notifications={sample} onOpenNotification={() => {}} />);
    expect(screen.getByText('Application update')).toBeInTheDocument();
    expect(screen.getByText('Interview scheduled')).toBeInTheDocument();
  });

  test('clicking a row invokes onOpenNotification with the notification', () => {
    const onOpen = vi.fn();
    render(<NotificationsCenter notifications={sample} onOpenNotification={onOpen} />);
    fireEvent.click(screen.getByRole('listitem', { name: /New message: Hello/ }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen.mock.calls[0][0].id).toBe('n-msg');
  });

  test('shows an empty state when the active tab has no notifications', () => {
    render(<NotificationsCenter notifications={[makeNotif({ type: 'APPLICATION' })]} onOpenNotification={() => {}} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Interviews' }));
    expect(screen.getByText(/No interviews notifications/)).toBeInTheDocument();
  });

  test('shows a loading state while loading', () => {
    render(<NotificationsCenter notifications={[]} loading onOpenNotification={() => {}} />);
    expect(screen.getByText(/Loading notifications/)).toBeInTheDocument();
  });
});