export type AssistantRole = 'user' | 'assistant';

export type AssistantMessage = {
  role: AssistantRole;
  content: string;
  timestamp?: string;
};

export type AssistantConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AssistantMessage[];
};

const CONVERSATIONS_KEY = 'graduate-ai-conversations:';
const LEGACY_KEY = 'graduate-ai-chat:';

export const conversationsKey = (userId: string) => `${CONVERSATIONS_KEY}${userId}`;

const legacyKey = (userId: string) => `${LEGACY_KEY}${userId}`;

export const formatConversationTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const validMessages = (raw: unknown): AssistantMessage[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (m): m is AssistantMessage =>
      !!m &&
      (m as AssistantMessage).role === 'user' ||
      (m as AssistantMessage).role === 'assistant'
  ) as AssistantMessage[];
};

export const createConversation = (): AssistantConversation => ({
  id: `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: 'New chat',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  messages: [],
});

export const conversationTitle = (conversation: AssistantConversation): string => {
  if (conversation.title && conversation.title !== 'New chat') return conversation.title;
  const firstUser = conversation.messages.find((m) => m.role === 'user');
  if (!firstUser) return 'New chat';
  const clean = firstUser.content.replace(/^\[Job context:[^\]]*\]\s*/i, '').trim();
  return clean.length > 40 ? `${clean.slice(0, 40)}…` : clean || 'New chat';
};

export const summarizeConversation = (conversation: AssistantConversation): string => {
  const last = conversation.messages[conversation.messages.length - 1];
  if (!last) return '';
  const text = last.content.replace(/^\[Job context:[^\]]*\]\s*/i, '').trim();
  return text.length > 56 ? `${text.slice(0, 56)}…` : text;
};

export const loadConversations = (userId: string | undefined): AssistantConversation[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(conversationsKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw) as AssistantConversation[];
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (c) => c && typeof c.id === 'string' && Array.isArray(c.messages)
        );
      }
    }

    const legacyRaw = localStorage.getItem(legacyKey(userId));
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as AssistantMessage[];
      const messages = validMessages(legacy);
      if (messages.length > 0) {
        const conversation: AssistantConversation = {
          id: `conv-legacy-${userId}`,
          title: 'New chat',
          createdAt: messages[0].timestamp ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          messages,
        };
        localStorage.removeItem(legacyKey(userId));
        return [conversation];
      }
    }
  } catch {
    /* storage unavailable or malformed */
  }
  return [];
};

export const saveConversations = (
  userId: string | undefined,
  conversations: AssistantConversation[]
): void => {
  if (!userId) return;
  try {
    localStorage.setItem(conversationsKey(userId), JSON.stringify(conversations));
  } catch {
    /* storage unavailable */
  }
};

export const appendMessage = (
  conversation: AssistantConversation,
  message: AssistantMessage
): AssistantConversation => ({
  ...conversation,
  updatedAt: new Date().toISOString(),
  messages: [...conversation.messages, message],
});