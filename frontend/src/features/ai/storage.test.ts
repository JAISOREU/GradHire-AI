import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  appendMessage,
  conversationTitle,
  createConversation,
  formatConversationTime,
  loadConversations,
  saveConversations,
  summarizeConversation,
  type AssistantConversation,
} from './storage';

afterEach(cleanup);

describe('storage', () => {
  it('creates a conversation with a unique id and New chat title', () => {
    const a = createConversation();
    const b = createConversation();
    expect(a.id).not.toBe(b.id);
    expect(a.title).toBe('New chat');
    expect(a.messages).toEqual([]);
  });

  it('round-trips conversations through localStorage', () => {
    const c = createConversation();
    c.messages = [{ role: 'user', content: 'Hello' }];
    saveConversations('user-1', [c]);
    expect(loadConversations('user-1')).toEqual([c]);
  });

  it('returns an empty list when nothing is stored', () => {
    expect(loadConversations('user-none')).toEqual([]);
  });

  it('handles missing userId safely', () => {
    saveConversations(undefined, [createConversation()]);
    expect(loadConversations(undefined)).toEqual([]);
  });

  it('derives a title from the first user message', () => {
    const c = createConversation();
    c.messages = [{ role: 'user', content: 'Analyze my resume' }];
    expect(conversationTitle(c)).toBe('Analyze my resume');
  });

  it('truncates long titles and strips job context', () => {
    const c = createConversation();
    c.messages = [{ role: 'user', content: '[Job context: Frontend Dev] A very long question that keeps going and going and going beyond forty characters' }];
    expect(conversationTitle(c).length).toBeLessThanOrEqual(41);
    expect(conversationTitle(c)).not.toContain('[Job context');
  });

  it('summarizes a conversation from its last message', () => {
    const c = createConversation();
    c.messages = [
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'Here is a helpful answer' },
    ];
    expect(summarizeConversation(c)).toBe('Here is a helpful answer');
  });

  it('appends a message and bumps updatedAt', () => {
    const c = createConversation();
    const next = appendMessage(c, { role: 'assistant', content: 'Hi' });
    expect(next.messages).toHaveLength(1);
    expect(c.messages).toHaveLength(0);
    expect(next.updatedAt >= c.updatedAt).toBe(true);
  });

  it('renders friendly relative timestamps', () => {
    const now = Date.now();
    expect(formatConversationTime(new Date(now - 30_000).toISOString())).toBe('Just now');
    expect(formatConversationTime(new Date(now - 5 * 60_000).toISOString())).toBe('5m ago');
    expect(formatConversationTime(new Date(now - 3 * 3_600_000).toISOString())).toBe('3h ago');
    expect(formatConversationTime('garbage')).toBe('');
  });

  it('ignores malformed stored payloads', () => {
    localStorage.setItem('graduate-ai-conversations:user-bad', '{not json');
    expect(loadConversations('user-bad')).toEqual([]);
  });
});