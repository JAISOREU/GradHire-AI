import { describe, expect, it } from 'vitest';
import type { Message } from '../core/types';
import { buildConversations, classifyParticipant, filterByTab, unreadCount } from './conversationRules';

const BASE_MSG: Message = {
  id: 'm1',
  from: 'user-a',
  to: 'user-b',
  fromName: 'Alice',
  toName: 'Acme Corp',
  fromRole: 'STUDENT',
  toRole: 'EMPLOYER',
  fromTitle: 'Software engineering',
  toTitle: 'Technology',
  fromCompany: null,
  toCompany: 'Acme Corp',
  fromAvatar: null,
  toAvatar: null,
  body: 'Hello!',
  createdAt: '2026-09-13T10:00:00.000Z',
  read: false,
};

const mkMsg = (id: string, from: string, to: string, overrides: Partial<Message> = {}): Message => ({
  ...BASE_MSG,
  id,
  from,
  to,
  createdAt: `2026-09-13T10:00:00.${id === 'm1' ? '000' : id === 'm2' ? '010' : '020'}Z`,
  ...overrides,
});

describe('conversationRules', () => {
  describe('classifyParticipant', () => {
    it('classifies an employer with a company as COMPANY', () => {
      expect(classifyParticipant('EMPLOYER', 'Acme Corp')).toBe('COMPANY');
    });

    it('classifies an employer without a company as RECRUITER', () => {
      expect(classifyParticipant('EMPLOYER', null)).toBe('RECRUITER');
    });

    it('classifies a student as CANDIDATE', () => {
      expect(classifyParticipant('STUDENT', null)).toBe('CANDIDATE');
    });

    it('falls back to OTHER for unknown roles', () => {
      expect(classifyParticipant('ADMIN', null)).toBe('OTHER');
    });
  });

  describe('buildConversations', () => {
    it('groups messages into a conversation keyed by counterpart user id', () => {
      const msgs = [
        mkMsg('m1', 'student-1', 'employer-1'),
        mkMsg('m2', 'employer-1', 'student-1'),
      ];
      const convos = buildConversations(msgs, 'student-1');
      expect(convos).toHaveLength(1);
      expect(convos[0].id).toBe('employer-1');
      expect(convos[0].name).toBe('Acme Corp');
    });

    it('tracks the latest message as lastMessage and sorts by lastMessageAt desc', () => {
      const convos = buildConversations(
        [
          mkMsg('m1', 'student-1', 'employer-1', { body: 'First', createdAt: '2026-09-10T08:00:00.000Z' }),
          mkMsg('m2', 'employer-1', 'student-1', { body: 'Second', createdAt: '2026-09-12T14:00:00.000Z' }),
          mkMsg('m3', 'student-1', 'employer-2', { body: 'Only', createdAt: '2026-09-11T08:00:00.000Z', toCompany: 'Beta Inc', toName: 'Beta Inc' }),
        ],
        'student-1',
      );
      expect(convos).toHaveLength(2);
      expect(convos[0].lastMessage).toBe('Second');
      expect(convos[0].lastMessageAt).toBe('2026-09-12T14:00:00.000Z');
    });

    it('counts only unread received messages', () => {
      const convos = buildConversations(
        [
          mkMsg('m1', 'student-1', 'employer-1', { read: false }),
          mkMsg('m2', 'student-1', 'employer-1', { read: true }),
          mkMsg('m3', 'employer-1', 'student-1', { read: false }),
          mkMsg('m4', 'employer-1', 'student-1', { read: false }),
        ],
        'student-1',
      );
      expect(convos[0].unreadCount).toBe(2);
    });

    it('sets kind from the counterpart participant fields', () => {
      const convos = buildConversations([mkMsg('m1', 'student-1', 'employer-1')], 'student-1');
      expect(convos[0].kind).toBe('COMPANY');
      expect(convos[0].company).toBe('Acme Corp');
    });
  });

  describe('filterByTab', () => {
    const convos = [
      { id: 'a', kind: 'COMPANY' as const },
      { id: 'b', kind: 'RECRUITER' as const },
      { id: 'c', kind: 'COMPANY' as const },
      { id: 'd', unreadCount: 2 } as never,
    ];

    it('returns all when kind is undefined', () => {
      expect(filterByTab(convos as any, undefined)).toHaveLength(4);
    });

    it('filters by kind', () => {
      expect(filterByTab(convos as any, 'COMPANY')).toHaveLength(2);
      expect(filterByTab(convos as any, 'RECRUITER')).toHaveLength(1);
    });

    it('filters by unread', () => {
      expect(filterByTab(convos as any, 'UNREAD')).toHaveLength(1);
    });
  });

  describe('unreadCount', () => {
    it('sums unread counts across conversations', () => {
      expect(
        unreadCount([
          { unreadCount: 2 } as never,
          { unreadCount: 0 } as never,
          { unreadCount: 5 } as never,
        ]),
      ).toBe(7);
    });
  });
});
