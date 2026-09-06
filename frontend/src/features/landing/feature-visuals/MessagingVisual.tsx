import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef, useState } from 'react';

const EASE = [0.22, 1, 0.36, 1] as const;

interface Message {
  id: number;
  sender: 'them' | 'me';
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  avatar: string;
}

const MessagingVisual = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion();
  const [activeConversation, setActiveConversation] = useState(1);

  const conversations: Conversation[] = [
    { id: 1, name: 'TechCorp Inc.', role: 'Hiring Team', lastMessage: 'When are you available for an interview?', time: '2m', unread: true, avatar: 'TC' },
    { id: 2, name: 'Sarah Chen', role: 'Recruiter', lastMessage: 'Your application has been reviewed', time: '1h', unread: true, avatar: 'SC' },
    { id: 3, name: 'Michael Ross', role: 'Engineering Lead', lastMessage: 'Thanks for applying!', time: '3h', unread: false, avatar: 'MR' },
  ];

  const messages: Message[] = [
    { id: 1, sender: 'them', text: 'Hi Jane, thanks for applying to the Senior Frontend Developer position.', time: '10:30 AM' },
    { id: 2, sender: 'me', text: 'Thank you! I am very excited about the opportunity to join your team.', time: '10:35 AM' },
    { id: 3, sender: 'them', text: 'Your experience with React and TypeScript really stands out. Would you be available for an interview this week?', time: '10:38 AM' },
    { id: 4, sender: 'me', text: 'Yes, I am available Thursday or Friday afternoon. Would either of those work?', time: '10:42 AM' },
  ];

  const active = conversations.find(c => c.id === activeConversation)!;

  return (
    <div ref={ref} className="feature-visual feature-visual--messaging">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="feature-visual__card"
      >
        {/* Window chrome */}
        <div className="feature-visual__bar">
          <div className="feature-visual__dots">
            <span className="feature-visual__dot feature-visual__dot--red" />
            <span className="feature-visual__dot feature-visual__dot--yellow" />
            <span className="feature-visual__dot feature-visual__dot--green" />
          </div>
          <span className="feature-visual__bar-title">Messages</span>
          <span className="feature-visual__bar-badge">3 conversations</span>
        </div>

        <div className="feature-visual__messaging-body">
          {/* Conversation list */}
          <div className="feature-visual__conversations">
            <div className="feature-visual__conversations-header">
              <span className="feature-visual__conversations-title">Conversations</span>
            </div>
            {conversations.map(conv => (
              <button
                key={conv.id}
                type="button"
                className={`feature-visual__conversation ${activeConversation === conv.id ? 'feature-visual__conversation--active' : ''}`}
                onClick={() => setActiveConversation(conv.id)}
              >
                <div className="feature-visual__conversation-avatar">{conv.avatar}</div>
                <div className="feature-visual__conversation-info">
                  <div className="feature-visual__conversation-header-row">
                    <span className="feature-visual__conversation-name">{conv.name}</span>
                    <span className="feature-visual__conversation-time">{conv.time}</span>
                  </div>
                  <div className="feature-visual__conversation-preview">{conv.lastMessage}</div>
                </div>
                {conv.unread && <span className="feature-visual__conversation-unread" />}
              </button>
            ))}
          </div>

          {/* Active conversation */}
          <div className="feature-visual__chat">
            <div className="feature-visual__chat-header">
              <div className="feature-visual__chat-header-info">
                <div className="feature-visual__chat-header-avatar">{active.avatar}</div>
                <div>
                  <div className="feature-visual__chat-header-name">{active.name}</div>
                  <div className="feature-visual__chat-header-role">{active.role}</div>
                </div>
              </div>
              <div className="feature-visual__chat-header-status">
                <span className="feature-visual__chat-status-dot" />
                Online
              </div>
            </div>

            <div className="feature-visual__chat-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.1 }}
                  className={`feature-visual__message ${msg.sender === 'me' ? 'feature-visual__message--me' : 'feature-visual__message--them'}`}
                >
                  <div className="feature-visual__message-bubble">
                    <p className="feature-visual__message-text">{msg.text}</p>
                    <span className="feature-visual__message-time">{msg.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="feature-visual__chat-input">
              <input type="text" className="feature-visual__chat-input-field" placeholder="Type a message..." readOnly />
              <button type="button" className="feature-visual__chat-send">Send</button>
            </div>
          </div>

          {/* Context panel */}
          <div className="feature-visual__context">
            <div className="feature-visual__context-header">
              <span className="feature-visual__context-title">Context</span>
            </div>
            <div className="feature-visual__context-body">
              <div className="feature-visual__context-section">
                <span className="feature-visual__context-label">Position</span>
                <span className="feature-visual__context-value">Senior Frontend Developer</span>
              </div>
              <div className="feature-visual__context-section">
                <span className="feature-visual__context-label">Company</span>
                <span className="feature-visual__context-value">TechCorp Inc.</span>
              </div>
              <div className="feature-visual__context-section">
                <span className="feature-visual__context-label">Match score</span>
                <span className="feature-visual__context-value feature-visual__context-value--accent">87%</span>
              </div>
              <div className="feature-visual__context-section">
                <span className="feature-visual__context-label">Stage</span>
                <span className="feature-visual__context-value">Interview</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <style>{`
        .feature-visual--messaging {
          width: 100%;
          max-width: 720px;
        }
        .feature-visual__card {
          background: var(--visual-surface);
          border: 1px solid var(--visual-border);
          border-radius: var(--visual-radius);
          box-shadow: var(--visual-shadow);
          overflow: hidden;
          transition: background-color var(--transition-theme), border-color var(--transition-theme), box-shadow var(--transition-theme);
        }
        .feature-visual__bar {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: var(--visual-surface-elevated);
          border-bottom: 1px solid var(--visual-border);
          transition: background-color var(--transition-theme), border-color var(--transition-theme);
        }
        .feature-visual__dots {
          display: flex;
          gap: 6px;
        }
        .feature-visual__dot {
          width: 10px;
          height: 10px;
          border-radius: var(--radius-full);
        }
        .feature-visual__dot--red { background: #f87171; }
        .feature-visual__dot--yellow { background: #fbbf24; }
        .feature-visual__dot--green { background: #4ade80; }
        .feature-visual__bar-title {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__bar-badge {
          margin-left: auto;
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
        }
        .feature-visual__messaging-body {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1px;
          background: var(--visual-border);
          min-height: 380px;
        }
        @media (min-width: 768px) {
          .feature-visual__messaging-body {
            grid-template-columns: 240px 1fr;
          }
        }
        @media (min-width: 1024px) {
          .feature-visual__messaging-body {
            grid-template-columns: 240px 1fr 200px;
          }
        }
        .feature-visual__conversations {
          background: var(--visual-surface);
          display: flex;
          flex-direction: column;
        }
        .feature-visual__conversations-header {
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--visual-border);
          transition: border-color var(--transition-theme);
        }
        .feature-visual__conversations-title {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__conversation {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          transition: background-color 150ms ease;
          position: relative;
        }
        .feature-visual__conversation:hover {
          background: var(--visual-surface-muted);
        }
        .feature-visual__conversation--active {
          background: var(--visual-surface-muted);
        }
        .feature-visual__conversation-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .feature-visual__conversation-info {
          flex: 1;
          min-width: 0;
        }
        .feature-visual__conversation-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-2);
        }
        .feature-visual__conversation-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feature-visual__conversation-time {
          font-size: 10px;
          color: var(--visual-text-muted);
          flex-shrink: 0;
        }
        .feature-visual__conversation-preview {
          font-size: var(--text-xs);
          color: var(--visual-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }
        .feature-visual__conversation-unread {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          background: var(--visual-accent);
          flex-shrink: 0;
        }
        .feature-visual__chat {
          background: var(--visual-surface);
          display: flex;
          flex-direction: column;
        }
        .feature-visual__chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid var(--visual-border);
          transition: border-color var(--transition-theme);
        }
        .feature-visual__chat-header-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .feature-visual__chat-header-avatar {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--visual-accent-soft);
          color: var(--visual-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        .feature-visual__chat-header-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__chat-header-role {
          font-size: 10px;
          color: var(--visual-text-muted);
        }
        .feature-visual__chat-header-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-success);
        }
        .feature-visual__chat-status-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--radius-full);
          background: var(--visual-success);
          animation: status-pulse 2s ease-in-out infinite;
        }
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .feature-visual__chat-messages {
          flex: 1;
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          overflow-y: auto;
        }
        .feature-visual__message {
          display: flex;
        }
        .feature-visual__message--me {
          justify-content: flex-end;
        }
        .feature-visual__message-bubble {
          max-width: 75%;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-lg);
          font-size: var(--text-sm);
          line-height: 1.5;
        }
        .feature-visual__message--them .feature-visual__message-bubble {
          background: var(--visual-surface-muted);
          color: var(--visual-text);
          border-bottom-left-radius: var(--radius-sm);
        }
        .feature-visual__message--me .feature-visual__message-bubble {
          background: var(--visual-accent);
          color: var(--visual-surface);
          border-bottom-right-radius: var(--radius-sm);
        }
        .feature-visual__message-text {
          margin: 0;
        }
        .feature-visual__message-time {
          display: block;
          font-size: 9px;
          margin-top: 4px;
          opacity: 0.7;
        }
        .feature-visual__chat-input {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--visual-border);
          transition: border-color var(--transition-theme);
        }
        .feature-visual__chat-input-field {
          flex: 1;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          border: 1px solid var(--visual-border);
          background: var(--visual-surface);
          color: var(--visual-text);
          font-size: var(--text-sm);
          outline: none;
        }
        .feature-visual__chat-send {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-md);
          border: none;
          background: var(--visual-accent);
          color: var(--visual-surface);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
        }
        .feature-visual__context {
          background: var(--visual-surface);
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .feature-visual__context-header {
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--visual-border);
          transition: border-color var(--transition-theme);
        }
        .feature-visual__context-title {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .feature-visual__context-section {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .feature-visual__context-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--visual-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .feature-visual__context-value {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--visual-text);
        }
        .feature-visual__context-value--accent {
          color: var(--visual-accent);
        }

        @media (max-width: 767px) {
          .feature-visual__conversations {
            max-height: 180px;
            overflow-y: auto;
          }
          .feature-visual__chat-messages {
            max-height: 240px;
          }
        }
      `}</style>
    </div>
  );
};

export { MessagingVisual };
