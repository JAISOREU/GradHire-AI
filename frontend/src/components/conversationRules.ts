import type { Message } from '../core/types';

export type ParticipantKind = 'CANDIDATE' | 'RECRUITER' | 'COMPANY' | 'OTHER' | 'UNREAD';

export type Conversation = {
  id: string;
  name: string;
  subtitle: string | null;
  avatar: string | null;
  role: string;
  company: string | null;
  kind: Exclude<ParticipantKind, 'UNREAD'>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
};

export const classifyParticipant = (
  role: string | null | undefined,
  company: string | null | undefined,
): Exclude<ParticipantKind, 'UNREAD'> => {
  if (role === 'STUDENT') return 'CANDIDATE';
  if (role === 'EMPLOYER') return company ? 'COMPANY' : 'RECRUITER';
  return 'OTHER';
};

const isSent = (msg: Message, currentUserId: string) => msg.from === currentUserId;

const otherSide = (msg: Message, currentUserId: string): { id: string; name?: string; role?: string; title?: string | null; company?: string | null; avatar?: string | null } =>
  isSent(msg, currentUserId)
    ? {
        id: msg.to,
        name: msg.toName,
        role: msg.toRole,
        title: msg.toTitle,
        company: msg.toCompany,
        avatar: msg.toAvatar,
      }
    : {
        id: msg.from,
        name: msg.fromName,
        role: msg.fromRole,
        title: msg.fromTitle,
        company: msg.fromCompany,
        avatar: msg.fromAvatar,
      };

export const buildConversations = (messages: Message[], currentUserId: string): Conversation[] => {
  const map = new Map<string, Conversation>();

  for (const msg of messages) {
    const other = otherSide(msg, currentUserId);
    if (!map.has(other.id)) {
      const kind = classifyParticipant(other.role, other.company);
      map.set(other.id, {
        id: other.id,
        name: other.name ?? other.id,
        subtitle: other.title ?? null,
        avatar: other.avatar ?? null,
        role: other.role ?? 'OTHER',
        company: other.company ?? null,
        kind,
        lastMessage: msg.body,
        lastMessageAt: msg.createdAt,
        unreadCount: 0,
        messages: [],
      });
    }

    const convo = map.get(other.id)!;
    convo.messages.push(msg);

    if (new Date(msg.createdAt).getTime() > new Date(convo.lastMessageAt).getTime()) {
      convo.lastMessage = msg.body;
      convo.lastMessageAt = msg.createdAt;
    }

    if (!isSent(msg, currentUserId) && !msg.read) {
      convo.unreadCount += 1;
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
};

export const filterByTab = (
  conversations: Conversation[],
  kind?: ParticipantKind,
): Conversation[] => {
  if (!kind) return conversations;
  if (kind === 'UNREAD') return conversations.filter((c) => c.unreadCount > 0);
  return conversations.filter((c) => c.kind === kind);
};

export const unreadCount = (conversations: Conversation[]): number =>
  conversations.reduce((sum, c) => sum + c.unreadCount, 0);