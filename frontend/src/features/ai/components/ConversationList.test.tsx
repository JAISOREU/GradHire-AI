import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConversationList } from './ConversationList';
import type { AssistantConversation } from '../storage';

afterEach(cleanup);

const makeConv = (overrides: Partial<AssistantConversation>): AssistantConversation => ({
  id: 'conv-1',
  title: 'New chat',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [],
  ...overrides,
});

describe('ConversationList', () => {
  it('renders a New chat button and an empty state', () => {
    render(
      <ConversationList conversations={[]} activeId={null} onSelect={vi.fn()} onNewChat={vi.fn()} onDelete={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
    expect(screen.getByText('No conversations yet.')).toBeInTheDocument();
  });

  it('lists saved conversations with derived titles and snippets', () => {
    const conversations = [
      makeConv({
        id: 'conv-1',
        messages: [
          { role: 'user', content: 'Analyze my resume' },
          { role: 'assistant', content: 'Here is your resume analysis.' },
        ],
      }),
      makeConv({
        id: 'conv-2',
        messages: [
          { role: 'user', content: 'How do I grow?' },
          { role: 'assistant', content: 'Focus on React and networking.' },
        ],
      }),
    ];
    render(<ConversationList conversations={conversations} activeId={null} onSelect={vi.fn()} onNewChat={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Analyze my resume')).toBeInTheDocument();
    expect(screen.getByText('Here is your resume analysis.')).toBeInTheDocument();
    expect(screen.getByText('How do I grow?')).toBeInTheDocument();
    expect(screen.getByText('Focus on React and networking.')).toBeInTheDocument();
  });

  it('highlights the active conversation', () => {
    const conversations = [makeConv({ id: 'conv-1' })];
    render(<ConversationList conversations={conversations} activeId="conv-1" onSelect={vi.fn()} onNewChat={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByTestId('conversation-conv-1').className).toContain('bg-primary-soft');
  });

  it('fires onSelect when a conversation is clicked', () => {
    const onSelect = vi.fn();
    const conversations = [makeConv({ id: 'conv-1' })];
    render(<ConversationList conversations={conversations} activeId={null} onSelect={onSelect} onNewChat={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByTestId('conversation-conv-1'));
    expect(onSelect).toHaveBeenCalledWith(conversations[0]);
  });

  it('fires onNewChat', () => {
    const onNewChat = vi.fn();
    render(<ConversationList conversations={[]} activeId={null} onSelect={vi.fn()} onNewChat={onNewChat} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /new chat/i }));
    expect(onNewChat).toHaveBeenCalledTimes(1);
  });

  it('fires onDelete without selecting the conversation', () => {
    const onDelete = vi.fn();
    const onSelect = vi.fn();
    const conversations = [makeConv({ id: 'conv-1' })];
    render(<ConversationList conversations={conversations} activeId={null} onSelect={onSelect} onNewChat={vi.fn()} onDelete={onDelete} />);
    fireEvent.click(screen.getByTestId('delete-conversation-conv-1'));
    expect(onDelete).toHaveBeenCalledWith(conversations[0]);
    expect(onSelect).not.toHaveBeenCalled();
  });
});